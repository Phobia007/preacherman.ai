import assert from 'node:assert/strict';
import test from 'node:test';
import { openTargetCommand } from '../open-target.mjs';

test('macOS opens the local website with the system URL handler', () => {
  assert.deepEqual(openTargetCommand('http://127.0.0.1:8128/', 'darwin'), {
    command: '/usr/bin/open', args: ['http://127.0.0.1:8128/'],
  });
});

test('Windows uses its system opener instead of the macOS executable', () => {
  const target = 'http://127.0.0.1:8128/';
  const result = openTargetCommand(target, 'win32', { SystemRoot: 'D:\\Windows' });
  assert.equal(result.command, 'D:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe');
  assert.equal(Buffer.from(result.args.at(-1), 'base64').toString('utf16le'),
    `$ErrorActionPreference = 'Stop'; Start-Process -FilePath '${target}'`);
  assert.ok(result.args.includes('-NoProfile'));
});

test('Windows error reports preserve spaces, Chinese and shell characters in paths', () => {
  const target = "C:\\Users\\O'Brien\\项目 & $draft; 100%\\desktop-launch-error.txt";
  const result = openTargetCommand(target, 'win32', {});
  const decoded = Buffer.from(result.args.at(-1), 'base64').toString('utf16le');
  assert.equal(decoded, `$ErrorActionPreference = 'Stop'; Start-Process -FilePath '${target.replaceAll("'", "''")}'`);
  assert.equal(result.command, 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe');
});
