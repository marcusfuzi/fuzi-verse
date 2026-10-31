import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';
import QRCode from 'qrcode';
import { runSeed } from './seeds/seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import authRoutes from './routes/auth.js';
import trackRoutes from './routes/tracks.js';
import playlistRoutes from './routes/playlists.js';
import userRoutes from './routes/users.js';
import commentRoutes from './routes/comments.js';
import socialRoutes from './routes/social.js';
import adminRoutes from './routes/admin.js';
import analyticsRoutes from './routes/analytics.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fuzi_verse';

// Middlewares
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded audio and covers
const uploadsDir = fs.existsSync(path.resolve('uploads'))
  ? path.resolve('uploads')
  : path.resolve(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadsDir));

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/tracks', trackRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/users', userRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    platform: 'FUZI VERSE API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Local network & Mobile QR Code endpoint
app.get('/api/network-info', async (req, res) => {
  try {
    const interfaces = os.networkInterfaces();
    let localIp = 'localhost';
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal && !iface.address.startsWith('169.254')) {
          localIp = iface.address;
          break;
        }
      }
      if (localIp !== 'localhost') break;
    }

    const localUrl = `http://${localIp}:5174`;

    // Check if live cloudflared tunnel is active for zero-firewall mobile access
    let tunnelUrl = null;
    const tunnelFilePath = path.join(__dirname, '..', '..', 'tunnel-url.txt');
    if (fs.existsSync(tunnelFilePath)) {
      try {
        const rawUrl = fs.readFileSync(tunnelFilePath, 'utf8').trim();
        if (rawUrl.startsWith('https://')) {
          tunnelUrl = rawUrl;
        }
      } catch (e) {}
    }

    const targetUrl = tunnelUrl || localUrl;
    const qrCode = await QRCode.toDataURL(targetUrl, {
      margin: 1,
      width: 320,
      color: { dark: '#000000', light: '#ffffff' },
    });

    res.json({
      url: targetUrl,
      qrCode,
      localIp,
      localUrl,
      tunnelUrl,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve frontend client in production (when client/dist exists)
const clientDistPath = path.resolve(__dirname, '..', '..', 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Central error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
  });
});

let mongodInstance = null;

// Graceful shutdown
const handleShutdown = async () => {
  console.log('\nShutting down FUZI VERSE Server...');
  try {
    await mongoose.disconnect();
    if (mongodInstance) {
      await mongodInstance.stop();
    }
  } catch (e) {
    // ignore error on exit
  }
  process.exit(0);
};

process.on('SIGINT', handleShutdown);
process.on('SIGTERM', handleShutdown);

// Start Server & Connect MongoDB
async function startServer() {
  try {
    console.log(`Checking MongoDB connection at: ${MONGO_URI}...`);
    try {
      await mongoose.connect(MONGO_URI, {
        serverSelectionTimeoutMS: 2000,
      });
      console.log('✅ Connected to MongoDB successfully.');
    } catch (connErr) {
      console.warn(`⚠️  Cannot reach MongoDB at ${MONGO_URI}`);
      console.log('⚡ Launching embedded persistent MongoDB server (server/data/db)...');

      const dataDir = path.resolve('data/db');
      fs.mkdirSync(dataDir, { recursive: true });

      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create({
        instance: {
          dbPath: dataDir,
          storageEngine: 'wiredTiger',
        },
      });

      const embeddedUri = mongodInstance.getUri() + 'fuzi_verse';
      console.log(`Connecting to embedded database at ${embeddedUri}...`);
      await mongoose.connect(embeddedUri);
      console.log('✅ Connected to embedded persistent MongoDB successfully.');
    }

    // Auto-seed if empty
    await runSeed(false);

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 FUZI VERSE Server running on http://localhost:${PORT}`);
      console.log(`🎵 Audio uploads served from http://localhost:${PORT}/uploads`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
