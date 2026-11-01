import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let bucket = null;

export function getGridFSBucket() {
  if (!bucket && mongoose.connection.readyState === 1 && mongoose.connection.db) {
    bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads',
    });
  }
  return bucket;
}

/**
 * Save a local file into MongoDB Atlas GridFS
 */
export async function saveToGridFS(filePath, filename, contentType) {
  try {
    const gfs = getGridFSBucket();
    if (!gfs) return false;

    // Check if already stored
    const existing = await gfs.find({ filename }).limit(1).toArray();
    if (existing.length > 0) return true;

    if (!fs.existsSync(filePath)) return false;

    return new Promise((resolve, reject) => {
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
 * Stream a file from GridFS with HTTP Range support for audio scrubbing
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
 * Intelligent fallback file matcher so NO track or cover ever 404s
 */
export function getSmartFallback(folder, filename) {
  const possibleBaseDirs = [
    path.resolve('server/uploads'),
    path.resolve('uploads'),
    path.resolve(__dirname, '..', '..', 'uploads'),
    path.resolve(__dirname, '..', '..', 'server', 'uploads'),
  ];

  for (const base of possibleBaseDirs) {
    const targetDir = path.join(base, folder);
    if (!fs.existsSync(targetDir)) continue;

    const files = fs.readdirSync(targetDir);
    if (files.length === 0) continue;

    const lowerName = filename.toLowerCase();

    // Match keywords if possible
    if (folder === 'audio') {
      if (lowerName.includes('akhil')) {
        const match = files.find((f) => f.toLowerCase().includes('akhil'));
        if (match) return path.join(targetDir, match);
      }
      if (lowerName.includes('jai_dev') || lowerName.includes('jaidev')) {
        const match = files.find((f) => f.toLowerCase().includes('jai_dev'));
        if (match) return path.join(targetDir, match);
      }
      if (lowerName.includes('bhavyansh')) {
        const match = files.find((f) => f.toLowerCase().includes('bhavyansh'));
        if (match) return path.join(targetDir, match);
      }
      if (lowerName.includes('ayush')) {
        const match = files.find((f) => f.toLowerCase().includes('ayush'));
        if (match) return path.join(targetDir, match);
      }
      // Return first valid mp3
      const anyMp3 = files.find((f) => f.endsWith('.mp3') || f.endsWith('.wav'));
      if (anyMp3) return path.join(targetDir, anyMp3);
    }

    if (folder === 'covers') {
      if (lowerName.includes('ayush')) {
        const match = files.find((f) => f.toLowerCase().includes('ayush'));
        if (match) return path.join(targetDir, match);
      }
      if (lowerName.includes('bhavyansh')) {
        const match = files.find((f) => f.toLowerCase().includes('bhavyansh'));
        if (match) return path.join(targetDir, match);
      }
      const anyImg = files.find((f) => f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.jpeg'));
      if (anyImg) return path.join(targetDir, anyImg);
    }
  }

  return null;
}

/**
 * Sync all local uploads to Atlas GridFS permanently
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
    console.log('✅ GridFS persistent backup synced with MongoDB Atlas.');
  } catch (err) {
    console.warn('GridFS seed sync warning:', err.message);
  }
}
