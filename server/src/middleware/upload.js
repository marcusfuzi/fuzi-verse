import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Determine unified uploads directory so multer and static express always match
const baseUploadsDir = fs.existsSync(path.resolve('server/uploads'))
  ? path.resolve('server/uploads')
  : path.resolve('uploads');

const audioDir = path.join(baseUploadsDir, 'audio');
const coversDir = path.join(baseUploadsDir, 'covers');

if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });
if (!fs.existsSync(coversDir)) fs.mkdirSync(coversDir, { recursive: true });

// Also ensure fallback root upload dirs exist
try {
  fs.mkdirSync(path.resolve('uploads/audio'), { recursive: true });
  fs.mkdirSync(path.resolve('uploads/covers'), { recursive: true });
} catch (e) {}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'audio') {
      cb(null, audioDir);
    } else {
      cb(null, coversDir);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${cleanName}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'audio') {
    const allowedMime = [
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/x-wav',
      'audio/ogg',
      'audio/aac',
      'audio/m4a',
      'audio/flac',
      'audio/x-m4a',
    ];
    if (allowedMime.includes(file.mimetype) || file.originalname.match(/\.(mp3|wav|ogg|aac|m4a|flac)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid audio format. Only MP3, WAV, OGG, AAC, and FLAC files are accepted.'));
    }
  } else if (file.fieldname === 'cover' || file.fieldname === 'avatar') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid cover image. Only PNG, JPG, WEBP, and GIF images are accepted.'));
    }
  } else {
    cb(null, true);
  }
};

export const uploadTrackFiles = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 60 * 1024 * 1024, // 60MB max audio
  },
}).fields([
  { name: 'audio', maxCount: 1 },
  { name: 'cover', maxCount: 1 },
]);

export const uploadSingleImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 8 * 1024 * 1024, // 8MB max image
  },
}).single('avatar');

export const uploadCoverImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max image
  },
}).single('cover');
