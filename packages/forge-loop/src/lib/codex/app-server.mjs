import { spawn } from 'node:child_process';

export function spawnCodexAppServer({ command = 'codex', cwd = process.cwd() } = {}) {
  if (process.platform === 'win32') {
    return spawn('cmd.exe', ['/d', '/s', '/c', `${command} app-server`], {
      cwd,
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true,
    });
  }

  return spawn(command, ['app-server'], {
    cwd,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
}

export function stopCodexAppServer(processRef) {
  if (!processRef || processRef.killed) return;
  try {
    processRef.kill('SIGTERM');
  } catch {
    // ignore process stop failures here; caller handles stale cleanup.
  }
}
