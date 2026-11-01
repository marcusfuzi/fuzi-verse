import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let bucket = null;

export function getGridFSBucket() {
  if (mongoose.connection && mongoose.connection.readyState === 1 && mongoose.connection.db) {
    if (!bucket) {
      bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: 'uploads',
      });
    }
    return bucket;
  }
  return null;
}

/**
 * Save a local file into MongoDB Atlas GridFS permanently
 */
export async function saveToGridFS(filePath, filename, contentType, overwrite = false) {
  try {
    const gfs = getGridFSBucket();
    if (!gfs) return false;

    // Check if already stored
    const existing = await gfs.find({ filename }).toArray();
    if (existing.length > 0) {
      if (overwrite) {
        for (const file of existing) {
          await gfs.delete(file._id).catch(() => {});
        }
      } else {
        return true;
      }
    }

    if (!fs.existsSync(filePath)) return false;

    return new Promise((resolve) => {
      const readStream = fs.createReadStream(filePath);
      const uploadStream = gfs.openUploadStream(filename, {
        contentType: contentType || (filename.endsWith('.mp3') ? 'audio/mpeg' : 'image/jpeg'),
      });

      readStream.pipe(uploadStream);

      uploadStream.on('finish', () => {
        console.log(`[GridFS] Stored permanently in MongoDB Atlas: ${filename}`);
        resolve(true);
      });
      uploadStream.on('error', (err) => {
        console.warn(`[GridFS] Upload error for ${filename}:`, err.message);
        resolve(false);
      });
    });
  } catch (err) {
    console.warn(`[GridFS] Error saving ${filename}:`, err.message);
    return false;
  }
}

/**
 * Delete a file from GridFS
 */
export async function deleteFromGridFS(filename) {
  try {
    const gfs = getGridFSBucket();
    if (!gfs) return false;
    const existing = await gfs.find({ filename }).toArray();
    for (const file of existing) {
      await gfs.delete(file._id).catch(() => {});
    }
    return true;
  } catch (err) {
    console.warn(`[GridFS] Error deleting ${filename}:`, err.message);
    return false;
  }
}

/**
 * Stream an exact file from GridFS with HTTP Range support for audio scrubbing
 */
export async function streamFromGridFS(filename, req, res) {
  const gfs = getGridFSBucket();
  if (!gfs) return false;

  const files = await gfs.find({ filename }).limit(1).toArray();
  if (files.length === 0) return false;

  const file = files[0];
  const fileSize = file.length;
  const contentType = file.contentType || (filename.endsWith('.mp3') ? 'audio/mpeg' : 'image/jpeg');

  const range = req.headers.range;
  if (range && contentType.startsWith('audio/')) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=31536000',
    });

    const downloadStream = gfs.openDownloadStream(file._id, {
      start,
      end: end + 1,
    });
    downloadStream.pipe(res);
    return true;
  } else {
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=31536000',
    });
    const downloadStream = gfs.openDownloadStream(file._id);
    downloadStream.pipe(res);
    return true;
  }
}

/**
 * Sync local uploads to Atlas GridFS permanently
 */
export async function syncSeedUploadsToGridFS() {
  try {
    const possibleDirs = [
      path.resolve('server/uploads'),
      path.resolve('uploads'),
      path.resolve(__dirname, '..', '..', 'server', 'uploads'),
    ];

    const baseDir = possibleDirs.find((d) => fs.existsSync(d));
    if (!baseDir) return;

    for (const folder of ['audio', 'covers']) {
      const fullFolder = path.join(baseDir, folder);
      if (!fs.existsSync(fullFolder)) continue;

      const files = fs.readdirSync(fullFolder);
      for (const file of files) {
        const filePath = path.join(fullFolder, file);
        const stat = fs.statSync(filePath);
        if (stat.isFile()) {
          const contentType = folder === 'audio' ? 'audio/mpeg' : 'image/jpeg';
          await saveToGridFS(filePath, file, contentType);
        }
      }
    }
  } catch (err) {
    console.warn('GridFS seed sync warning:', err.message);
  }
}
