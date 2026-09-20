import { cp, mkdir, rm, access, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = path.join(root, 'public');
const output = path.join(root, 'dist');
if (path.dirname(output) !== path.resolve(root) || path.basename(output) !== 'dist') {
  throw new Error('Build output must be the project dist directory.');
}
await access(path.join(source, 'index.html'));
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(source, output, { recursive: true });
const webUrl = process.env.PREACHERMAN_WEB_URL || 'http://localhost:5173/';
const destination = new URL(webUrl);
if (!['http:', 'https:'].includes(destination.protocol) || destination.username || destination.password) {
  throw new Error('PREACHERMAN_WEB_URL must be an HTTP(S) URL without credentials.');
}
const htmlUrl = destination.href.replaceAll('&', '&amp;').replaceAll('"', '&quot;');
for (const relative of ['index.html', 'shopify-winter2026.html']) {
  const file = path.join(output, relative);
  const html = await readFile(file, 'utf8');
  await writeFile(file, html.replace(/(<a\b[^>]*\bhref=")http:\/\/localhost:5173\/("[^>]*data-component-name="start-free-trial")/g, (_, start, end) => start + htmlUrl + end));
}
const navPath = path.join(output, 'assets/runtime/GlobalNavigationContainer-DD0GcKXP.js');
const nav = await readFile(navPath, 'utf8');
await writeFile(navPath, nav.replace('href:"http://localhost:5173/",target:"_self",children:"Try It"', () => `href:${JSON.stringify(destination.href)},target:"_self",children:"Try It"`));
console.log(`Built the presentation website into dist/. Try It → ${destination.href}`);
