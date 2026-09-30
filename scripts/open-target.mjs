import { spawnSync } from 'node:child_process';
import path from 'node:path';

export function openTargetCommand(target, platform = process.platform, env = process.env) {
  if (platform === 'darwin') return { command: '/usr/bin/open', args: [target] };
  if (platform === 'win32') {
    // Encode a PowerShell literal so spaces, apostrophes and shell characters
    // in a Windows project path cannot become command syntax.
    const literal = String(target).replaceAll("'", "''");
    const script = `$ErrorActionPreference = 'Stop'; Start-Process -FilePath '${literal}'`;
    return {
      command: path.win32.join(env.SystemRoot || 'C:\\Windows', 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe'),
      args: ['-NoProfile', '-NonInteractive', '-EncodedCommand', Buffer.from(script, 'utf16le').toString('base64')],
    };
  }
  return { command: 'xdg-open', args: [target] };
}

export function openTarget(target) {
  const { command, args } = openTargetCommand(target);
  const result = spawnSync(command, args, { windowsHide: true, encoding: 'utf8', timeout: 10000 });
  if (result.error || result.status !== 0) {
    throw new Error(`Could not open ${target}: ${result.error?.message || result.stderr?.trim() || `exit ${result.status}`}`);
  }
}
