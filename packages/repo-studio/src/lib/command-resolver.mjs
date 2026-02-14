import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

function displayCommand(command, args) {
  return [command, ...(args || [])].join(' ').trim();
}

function runAttempt(attempt, options = {}) {
  const cwd = options.cwd || process.cwd();
  const result = spawnSync(attempt.command, attempt.args || [], {
    encoding: 'utf8',
    cwd,
    shell: attempt.shell === true,
  });

  const spawnError = result.error instanceof Error ? result.error.message : '';
  const stderr = [String(result.stderr || '').trim(), spawnError].filter(Boolean).join('\n').trim();

  return {
    ok: (result.status ?? 1) === 0,
    code: result.status ?? 1,
    command: displayCommand(attempt.command, attempt.args),
    stdout: String(result.stdout || ''),
    stderr,
    spawnFailed: Boolean(result.error),
  };
}

function localCliPath(toolName, cwd) {
  const rel = {
    'forge-env': path.join('packages', 'forge-env', 'src', 'cli.mjs'),
    'forge-loop': path.join('packages', 'forge-loop', 'src', 'cli.mjs'),
    'forge-repo-studio': path.join('packages', 'repo-studio', 'src', 'cli.mjs'),
  }[toolName];

  if (!rel) return null;
  const abs = path.join(cwd, rel);
  return fs.existsSync(abs) ? abs : null;
}

function scriptNameForTool(toolName) {
  if (toolName === 'forge-env') return 'forge-env';
  if (toolName === 'forge-loop') return 'forge-loop';
  if (toolName === 'forge-repo-studio') return 'forge-repo-studio';
  return toolName;
}

function appendScriptArgs(scriptName, subArgs) {
  if (!Array.isArray(subArgs) || subArgs.length === 0) return ['run', scriptName];
  return ['run', scriptName, '--', ...subArgs];
}

export function buildToolCommandAttempts(toolName, subArgs = [], options = {}) {
  const cwd = options.cwd || process.cwd();
  const attempts = [];
  const args = Array.isArray(subArgs) ? subArgs.map((item) => String(item)) : [];
  const localCli = localCliPath(toolName, cwd);
  const scriptName = scriptNameForTool(toolName);

  if (localCli) {
    attempts.push({ command: process.execPath, args: [localCli, ...args] });
  }

  attempts.push({ command: 'pnpm', args: appendScriptArgs(scriptName, args) });
  attempts.push({ command: 'pnpm', args: ['exec', toolName, ...args] });
  attempts.push({ command: toolName, args });

  return attempts;
}

export function runCommandAttempts(attempts, options = {}) {
  const normalized = Array.isArray(attempts) ? attempts : [];
  const attemptResults = [];
  let last = null;

  for (const attempt of normalized) {
    const result = runAttempt(attempt, options);
    const detail = {
      command: result.command,
      ok: result.ok,
      code: result.code,
      stderr: result.stderr,
      spawnFailed: result.spawnFailed === true,
    };
    attemptResults.push(detail);
    last = result;
    if (result.ok) {
      return {
        ...result,
        attempts: attemptResults,
        resolvedAttempt: detail.command,
      };
    }

    // If command executed but returned non-zero, do not hide it behind later fallback attempts.
    if (result.spawnFailed !== true) {
      return {
        ...result,
        attempts: attemptResults,
        resolvedAttempt: detail.command,
      };
    }
  }

  if (last) {
    return {
      ...last,
      attempts: attemptResults,
      resolvedAttempt: null,
    };
  }

  return {
    ok: false,
    code: 1,
    command: '',
    stdout: '',
    stderr: 'No command attempts were provided.',
    attempts: [],
    resolvedAttempt: null,
  };
}

export function runToolCommand(toolName, subArgs = [], options = {}) {
  const attempts = buildToolCommandAttempts(toolName, subArgs, options);
  return runCommandAttempts(attempts, options);
}
