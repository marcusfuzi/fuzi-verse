import fs from 'fs';
import path from 'path';
import os from 'os';

console.log('[setup-render-start] Configuring start commands for deployment...');

const isLinux = process.platform === 'linux';
const isWin = process.platform === 'win32';

// 1. Script content that launches the server
const shellScriptContent = `#!/bin/sh
exec node server/src/index.js "$@"
`;

const nodeScriptContent = `#!/usr/bin/env node
import '../server/src/index.js';
`;

// Helper to write executable file
function writeExecutable(filePath, content) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, content, { encoding: 'utf8', mode: 0o755 });
    try {
      fs.chmodSync(filePath, 0o755);
    } catch (e) {}
    console.log(`[setup-render-start] Created executable: ${filePath}`);
    return true;
  } catch (err) {
    // Some paths like /usr/bin might be read-only without root
    return false;
  }
}

// 2. Put start:prod in ./node_modules/.bin/
if (!isWin) {
  const nodeModulesBin = path.resolve('node_modules/.bin');
  writeExecutable(path.join(nodeModulesBin, 'start:prod'), shellScriptContent);
  writeExecutable(path.resolve('start:prod'), shellScriptContent);

  // 3. Put start:prod into any writable directory in PATH
  const pathDirs = (process.env.PATH || '').split(':').filter(Boolean);
  for (const dir of pathDirs) {
    const candidate = path.join(dir, 'start:prod');
    writeExecutable(candidate, shellScriptContent);
  }

  // 4. Also user local bin
  const userLocalBin = path.join(os.homedir(), '.local', 'bin');
  writeExecutable(path.join(userLocalBin, 'start:prod'), shellScriptContent);
}

// 5. Ensure server/src/index.js has executable permissions
try {
  const serverIndex = path.resolve('server/src/index.js');
  fs.chmodSync(serverIndex, 0o755);
} catch (e) {}

console.log('[setup-render-start] Configuration complete!');
