#!/usr/bin/env node
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import os from 'os';
import dns from 'dns';
import { fileURLToPath } from 'url';
import QRCode from 'qrcode';
import { runSeed } from './seeds/seed.js';

// Ensure DNS resolvers handle MongoDB Atlas SRV records smoothly
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}

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
import { streamFromGridFS, syncSeedUploadsToGridFS } from './services/gridfsService.js';
import { runAutoPurge } from './services/autoPurgeService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;
const MONGO_URI =
  process.env.MONGO_URI ||
  'mongodb+srv://marcusfuzi01_db_user:iC4vnmQjI8Tt3Pii@cluster0.qhvrmhm.mongodb.net/fuzi_verse?retryWrites=true&w=majority';

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

// Serve uploaded audio and covers from all possible upload locations (ensures 0% 404 on uploads)
app.use('/uploads', express.static(path.resolve('server/uploads')));
app.use('/uploads', express.static(path.resolve('uploads')));
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));
app.use('/uploads', express.static(path.resolve(__dirname, '..', '..', 'uploads')));
app.use('/uploads', express.static(path.resolve(__dirname, '..', '..', 'server', 'uploads')));

// Dynamic Atlas GridFS stream handler for audio & covers (streams exact uploaded files permanently)
app.get('/uploads/:folder/:filename', async (req, res, next) => {
  const { filename } = req.params;
  try {
    const streamed = await streamFromGridFS(filename, req, res);
    if (streamed) return;
  } catch (err) {
    console.warn('[GridFS Stream] Warning:', err.message);
  }

  next();
});

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
const possibleDistDirs = [
  path.resolve('client/dist'),
  path.resolve(__dirname, '..', '..', 'client', 'dist'),
  path.resolve('dist'),
];
const clientDistPath = possibleDistDirs.find((d) => fs.existsSync(d));
if (clientDistPath) {
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

      // Initial auto-purge check on startup
      runAutoPurge().catch((e) => console.warn('[AutoPurge Initial]', e.message));

      // Scheduled auto-purge every 30 minutes for 5-day expired blocked items
      setInterval(() => {
        runAutoPurge().catch((e) => console.warn('[AutoPurge Interval]', e.message));
      }, 30 * 60 * 1000);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
