import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const script = `
  import { ensureNativeNode } from './scripts/native-node.mjs';
  ensureNativeNode();
  await import('./browser/apps/preacherman-demo-host/node_modules/rollup/dist/es/rollup.js');
  console.log(process.arch);
`;

test('native startup can load the installed Rollup dependency', () => {
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', script], {
    cwd: root, encoding: 'utf8', timeout: 10000,
  });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), process.arch);
});

test('a Rosetta launch switches to Apple Silicon before loading Rollup', {
  skip: process.platform !== 'darwin' || process.arch !== 'arm64',
}, () => {
  const result = spawnSync('/usr/bin/arch', ['-x86_64', process.execPath, '--input-type=module', '-e', script], {
    cwd: root, encoding: 'utf8', timeout: 15000,
  });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), 'arm64');
});
