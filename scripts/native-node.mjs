import { spawnSync } from 'node:child_process';

// Finder can launch a universal Node binary through Rosetta even when npm
// installed the native Apple Silicon dependencies. Correct the architecture
// before starting any build or preview children; Intel-only Macs keep x64.
export function ensureNativeNode() {
  if (process.platform !== 'darwin' || process.arch !== 'x64') return;
  const probe = spawnSync('/usr/bin/arch', ['-arm64', process.execPath, '-p', 'process.arch'], {
    encoding: 'utf8', timeout: 5000,
  });
  if (probe.status !== 0 || probe.stdout.trim() !== 'arm64') return;

  const result = spawnSync('/usr/bin/arch', [
    '-arm64', process.execPath, ...process.execArgv, ...process.argv.slice(1),
  ], { stdio: 'inherit' });
  if (result.error) console.error(`Could not start native Node: ${result.error.message}`);
  process.exit(result.status ?? 1);
}
