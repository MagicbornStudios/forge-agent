import { spawnSync } from 'node:child_process';

export function runCommand(commandText, options = {}) {
  const shellCommand = String(commandText || '').trim();
  if (!shellCommand) {
    return {
      ok: false,
      code: 1,
      command: shellCommand,
      stdout: '',
      stderr: 'Empty command.',
    };
  }

  const result = process.platform === 'win32'
    ? spawnSync('cmd.exe', ['/d', '/s', '/c', shellCommand], {
      encoding: 'utf8',
      cwd: options.cwd || process.cwd(),
    })
    : spawnSync('sh', ['-lc', shellCommand], {
      encoding: 'utf8',
      cwd: options.cwd || process.cwd(),
    });

  return {
    ok: (result.status ?? 1) === 0,
    code: result.status ?? 1,
    command: shellCommand,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
  };
}
