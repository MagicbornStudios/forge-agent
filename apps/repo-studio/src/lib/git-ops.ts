import { spawnSync } from 'node:child_process';

import { resolveActiveProjectRoot } from '@/lib/project-root';
import { isSafeRepoPath, normalizeRelPath } from '@/lib/repo-files';

function runGit(args: string[]) {
  const root = resolveActiveProjectRoot();
  const result = spawnSync('git', args, {
    cwd: root,
    encoding: 'utf8',
  });
  return {
    ok: (result.status ?? 1) === 0,
    code: result.status ?? 1,
    stdout: String(result.stdout || ''),
    stderr: String(result.stderr || ''),
    command: `git ${args.join(' ')}`,
  };
}

function ensureSafeBranchName(name: string) {
  const value = String(name || '').trim();
  if (!value) throw new Error('branch name is required.');
  if (!/^[A-Za-z0-9._/\-]+$/.test(value)) {
    throw new Error(`Invalid branch name: ${value}`);
  }
  return value;
}

function ensureSafePaths(paths: string[]) {
  const values = (paths || []).map((value) => normalizeRelPath(value)).filter(Boolean);
  for (const value of values) {
    if (!isSafeRepoPath(value)) {
      throw new Error(`Invalid repository path: ${value}`);
    }
  }
  return values;
}

function parseStatus(stdout: string) {
  return String(stdout || '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .filter(Boolean)
    .map((line) => ({
      status: line.slice(0, 2),
      path: line.slice(3).trim(),
    }));
}

export function gitStatus() {
  const status = runGit(['status', '--porcelain']);
  if (!status.ok) return status;
  return {
    ...status,
    files: parseStatus(status.stdout),
  };
}

export function gitBranches() {
  const list = runGit(['branch', '--list']);
  if (!list.ok) return list;
  const branches = String(list.stdout || '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .filter(Boolean)
    .map((line) => ({
      name: line.replace(/^\*+\s*/, '').trim(),
      current: line.trimStart().startsWith('*'),
    }));
  return {
    ...list,
    branches,
  };
}

export function gitCreateBranch(name: string, fromRef?: string) {
  const branch = ensureSafeBranchName(name);
  const args = fromRef
    ? ['checkout', '-b', branch, String(fromRef).trim()]
    : ['checkout', '-b', branch];
  return runGit(args);
}

export function gitSwitchBranch(name: string) {
  const branch = ensureSafeBranchName(name);
  return runGit(['checkout', branch]);
}

export function gitRestore(paths: string[], sourceRef?: string) {
  const safePaths = ensureSafePaths(paths);
  if (safePaths.length === 0) throw new Error('At least one path is required.');
  const args = ['restore'];
  if (sourceRef) args.push('--source', String(sourceRef).trim());
  args.push('--', ...safePaths);
  return runGit(args);
}

export function gitStage(paths: string[]) {
  const safePaths = ensureSafePaths(paths);
  if (safePaths.length === 0) throw new Error('At least one path is required.');
  return runGit(['add', '--', ...safePaths]);
}

export function gitCommit(message: string) {
  const value = String(message || '').trim();
  if (!value) throw new Error('Commit message is required.');
  return runGit(['commit', '-m', value]);
}

export function gitLog(limit = 30) {
  const safeLimit = Math.max(1, Math.min(Number(limit || 30), 200));
  const format = '%H%x09%h%x09%an%x09%ad%x09%s';
  const result = runGit(['log', `--max-count=${safeLimit}`, `--pretty=format:${format}`, '--date=iso']);
  if (!result.ok) return result;
  const entries = String(result.stdout || '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [hash, shortHash, author, date, ...subjectParts] = line.split('\t');
      return {
        hash,
        shortHash,
        author,
        date,
        subject: subjectParts.join('\t'),
      };
    });
  return {
    ...result,
    entries,
  };
}

export function gitPull(remote = 'origin', branch?: string) {
  const normalizedRemote = String(remote || 'origin').trim() || 'origin';
  const args = ['pull', normalizedRemote];
  const normalizedBranch = String(branch || '').trim();
  if (normalizedBranch) {
    args.push(normalizedBranch);
  }
  return runGit(args);
}

export function gitPush(remote = 'origin', branch?: string) {
  const normalizedRemote = String(remote || 'origin').trim() || 'origin';
  const args = ['push', normalizedRemote];
  const normalizedBranch = String(branch || '').trim();
  if (normalizedBranch) {
    args.push(normalizedBranch);
  }
  return runGit(args);
}
