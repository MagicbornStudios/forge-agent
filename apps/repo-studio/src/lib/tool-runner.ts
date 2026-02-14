import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { resolveRepoRoot } from './cli-runner';

type Attempt = {
  command: string;
  args: string[];
};

type AttemptResult = {
  command: string;
  ok: boolean;
  code: number;
  stderr: string;
  spawnFailed: boolean;
};

function displayCommand(command: string, args: string[]) {
  return [command, ...args].join(' ').trim();
}

function runAttempt(attempt: Attempt, cwd: string) {
  const result = spawnSync(attempt.command, attempt.args, {
    cwd,
    encoding: 'utf8',
    shell: false,
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

function localCliPath(toolName: string, repoRoot: string) {
  const rel = {
    'forge-env': path.join('packages', 'forge-env', 'src', 'cli.mjs'),
    'forge-loop': path.join('packages', 'forge-loop', 'src', 'cli.mjs'),
    'forge-repo-studio': path.join('packages', 'repo-studio', 'src', 'cli.mjs'),
  }[toolName];
  if (!rel) return null;
  const abs = path.join(repoRoot, rel);
  return fs.existsSync(abs) ? abs : null;
}

function appendScriptArgs(scriptName: string, subArgs: string[]) {
  if (!subArgs.length) return ['run', scriptName];
  return ['run', scriptName, '--', ...subArgs];
}

function buildAttempts(toolName: string, subArgs: string[], repoRoot: string): Attempt[] {
  const attempts: Attempt[] = [];
  const localCli = localCliPath(toolName, repoRoot);
  const scriptName = toolName;
  if (localCli) {
    attempts.push({ command: process.execPath, args: [localCli, ...subArgs] });
  }
  attempts.push({ command: 'pnpm', args: appendScriptArgs(scriptName, subArgs) });
  attempts.push({ command: 'pnpm', args: ['exec', toolName, ...subArgs] });
  attempts.push({ command: toolName, args: [...subArgs] });
  return attempts;
}

export function runToolCommand(toolName: string, subArgs: string[] = []) {
  const repoRoot = resolveRepoRoot();
  const attempts = buildAttempts(toolName, subArgs, repoRoot);
  const attemptResults: AttemptResult[] = [];
  let last: ReturnType<typeof runAttempt> | null = null;

  for (const attempt of attempts) {
    const result = runAttempt(attempt, repoRoot);
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
    attempts: attemptResults,
    resolvedAttempt: null,
    spawnFailed: false,
  };
}

