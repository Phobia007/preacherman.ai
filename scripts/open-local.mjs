import { spawn } from 'node:child_process';
import { mkdirSync, openSync, closeSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { ensureNativeNode } from './native-node.mjs';
import { openTarget } from './open-target.mjs';

ensureNativeNode();

const root = fileURLToPath(new URL('../', import.meta.url));
const runtime = path.join(root, 'browser/.runtime-tmp');
const url = 'http://127.0.0.1:8128/';
mkdirSync(runtime, { recursive: true });
async function ready() {
  try {
    const [app, website] = await Promise.all([
      fetch('http://127.0.0.1:5174/__preacherman_preview', { signal: AbortSignal.timeout(1500) }),
      fetch(url, { signal: AbortSignal.timeout(1500) }),
    ]);
    if (!app.ok || !website.ok) return false;
    const identity = await app.json();
    return identity.app === 'preacherman-browser' && identity.root === path.join(root, 'browser')
      && await website.text() === readFileSync(path.join(root, 'dist/index.html'), 'utf8');
  } catch { return false; }
}
try {
  if (!await ready()) {
    const log = openSync(path.join(runtime, 'desktop-preview.log'), 'w');
    const child = spawn(process.execPath, ['scripts/local.mjs'], {
      cwd: root, detached: true, stdio: ['ignore', log, log],
      env: { ...process.env, PORT: '8128', PREACHERMAN_WEB_PORT: '5174' },
    });
    closeSync(log);
    let startupError;
    child.once('error', error => { startupError = error; });
    child.once('exit', (code, signal) => {
      startupError = new Error(`Preview exited before becoming ready (${signal || `exit ${code}`}).`);
    });
    child.unref();
    const deadline = Date.now() + 45000;
    while (!await ready()) {
      if (startupError) {
        const details = readFileSync(path.join(runtime, 'desktop-preview.log'), 'utf8').slice(-6000).trim();
        throw new Error(`${startupError.message}\n\n${details}`);
      }
      if (Date.now() >= deadline) throw new Error('Preview did not become ready. Check desktop-preview.log for a port conflict or build error.');
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    if (child.pid) writeFileSync(path.join(runtime, 'desktop-preview.pid'), String(child.pid));
  }
  rmSync(path.join(runtime, 'desktop-launch-error.txt'), { force: true });
  if (process.argv.includes('--check')) console.log('Preacherman local website and browser are ready.');
  else openTarget(url);
} catch (error) {
  const report = path.join(runtime, 'desktop-launch-error.txt');
  writeFileSync(report, `preacherman.ai could not start.\n${error.message}\n\nProject: ${root}\nLog: ${path.join(runtime, 'desktop-preview.log')}\n`);
  if (!process.argv.includes('--check')) {
    try { openTarget(report); } catch (openError) { console.error(openError.message); }
  }
  console.error(error.message);
  process.exitCode = 1;
}
