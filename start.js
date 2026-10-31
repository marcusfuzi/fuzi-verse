import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const logFile = path.join(__dirname, 'fuziverse.log');
const logStream = fs.createWriteStream(logFile, { flags: 'a' });

const log = (msg) => {
  const line = `[${new Date().toLocaleTimeString()}] ${msg}\n`;
  try { process.stdout.write(line); } catch (e) {}
  try { logStream.write(line); } catch (e) {}
};

log('🎵 Starting FUZI VERSE Creator Platform...');
log('👉 Local URL:   http://localhost:5174');
log('👉 Backend API: http://localhost:5050');

const nodeExec = process.execPath;

// 1. Launch Backend API directly via node executable
const serverProcess = spawn(nodeExec, ['src/index.js'], {
  cwd: path.join(__dirname, 'server'),
  stdio: ['ignore', 'pipe', 'pipe'],
});

serverProcess.stdout.on('data', (d) => {
  try { logStream.write(d); process.stdout.write(d); } catch (e) {}
});
serverProcess.stderr.on('data', (d) => {
  try { logStream.write(d); process.stderr.write(d); } catch (e) {}
});

// 2. Launch Vite directly on 0.0.0.0 for phone/local network access
const viteBin = path.join(__dirname, 'client', 'node_modules', 'vite', 'bin', 'vite.js');
const clientProcess = spawn(nodeExec, [viteBin, '--host', '0.0.0.0', '--port', '5174'], {
  cwd: path.join(__dirname, 'client'),
  stdio: ['ignore', 'pipe', 'pipe'],
});

clientProcess.stdout.on('data', (d) => {
  try { logStream.write(d); process.stdout.write(d); } catch (e) {}
});
clientProcess.stderr.on('data', (d) => {
  try { logStream.write(d); process.stderr.write(d); } catch (e) {}
});

// 3. Launch Cloudflare Tunnel if cloudflared.exe exists (bypasses Windows firewall & router isolation)
let tunnelProcess = null;
const cloudflaredExe = path.join(__dirname, 'cloudflared.exe');
if (fs.existsSync(cloudflaredExe)) {
  tunnelProcess = spawn(cloudflaredExe, ['tunnel', '--no-autoupdate', '--metrics', '127.0.0.1:0', '--url', 'http://127.0.0.1:5174'], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  const extractUrl = (data) => {
    const text = data.toString();
    const match = text.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
    if (match) {
      const tunnelUrl = match[0];
      try {
        fs.writeFileSync(path.join(__dirname, 'tunnel-url.txt'), tunnelUrl);
        log(`🌐 Instant Mobile HTTPS URL: ${tunnelUrl}`);
      } catch (e) {}
    }
  };

  tunnelProcess.stdout.on('data', (d) => {
    extractUrl(d);
    try { logStream.write(d); } catch (e) {}
  });
  tunnelProcess.stderr.on('data', (d) => {
    extractUrl(d);
    try { logStream.write(d); } catch (e) {}
  });
  tunnelProcess.on('exit', (code) => {
    log(`cloudflared exited with code ${code}`);
  });
  tunnelProcess.on('error', (err) => {
    log(`cloudflared error: ${err.message}`);
  });
}

const cleanup = () => {
  log('🛑 Stopping FUZI VERSE...');
  try { serverProcess.kill(); } catch (e) {}
  try { clientProcess.kill(); } catch (e) {}
  if (tunnelProcess) {
    try { tunnelProcess.kill(); } catch (e) {}
  }
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
