import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import net from 'node:net';
import path from 'node:path';
import { ensureNativeNode } from './native-node.mjs';

ensureNativeNode();

const root = fileURLToPath(new URL('../', import.meta.url));
const browserApp = path.join(root, 'browser/apps/preacherman-demo-host');
const webPort = Number(process.env.PREACHERMAN_WEB_PORT || 5174);
const sitePort = Number(process.env.PORT || 8128);
for (const port of [webPort, sitePort]) {
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Preview ports must be valid TCP ports.');
}
if (new Set([webPort, sitePort, 8791]).size !== 3) throw new Error('The website, browser and API need separate ports.');
for (const port of [sitePort, webPort, 8791]) {
  await new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.once('error', () => reject(new Error(`Port ${port} is in use. Reuse or stop the existing project preview first.`)));
    probe.listen(port, '127.0.0.1', () => probe.close(resolve));
  });
}
if (!existsSync(path.join(root, 'browser/web-dist/index.html'))) {
  throw new Error('Run npm run browser:setup and npm run browser:build first.');
}
const env = { ...process.env, PREACHERMAN_WEB_PORT: String(webPort), PORT: String(sitePort), PREACHERMAN_WEB_URL: `http://127.0.0.1:${webPort}/` };
const build = spawnSync(process.execPath, ['scripts/build.mjs'], { cwd: root, env, stdio: 'inherit' });
if (build.status !== 0) process.exit(build.status || 1);
const children = new Set();
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  process.exitCode = code;
  for (const child of children) child.kill('SIGTERM');
  const deadline = setTimeout(() => {
    for (const child of children) child.kill('SIGKILL');
  }, 7000);
  deadline.unref();
}
for (const [cwd, script] of [[browserApp, 'scripts/preview-web.mjs'], [root, 'scripts/preview.mjs']]) {
  const child = spawn(process.execPath, [script], { cwd, env, stdio: 'inherit' });
  children.add(child);
  child.once('error', error => { console.error(error); children.delete(child); stop(1); });
  child.once('exit', code => { children.delete(child); if (!stopping) stop(code || 1); });
}
process.once('SIGINT', () => stop());
process.once('SIGTERM', () => stop());
console.log(`Local previews: website http://127.0.0.1:${sitePort}/; browser http://127.0.0.1:${webPort}/. Press Ctrl+C to stop both.`);
