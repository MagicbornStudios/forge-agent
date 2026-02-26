import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

import { resolveActiveProjectRoot } from '@/lib/project-root';
import { isPathWithinRoots, isSafeRepoPath, listScopeRoots, normalizeRelPath } from '@/lib/repo-files';
import { readRepoStudioConfig, storyRootsFromConfig } from '@/lib/repo-studio-config';

type DiffScope = 'workspace' | 'loop' | 'story' | 'planning';

export type DiffStatusEntry = {
  status: string;
  path: string;
};

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

function runGit(args: string[]) {
  return spawnSync('git', args, {
    cwd: resolveActiveProjectRoot(),
    encoding: 'utf8',
  });
}

function safeRef(ref: string) {
  const normalized = String(ref || '').trim();
  if (!normalized) return false;
  return /^[A-Za-z0-9._/\-]+$/.test(normalized);
}

async function scopeRoots(scope: DiffScope, loopId?: string) {
  if (scope === 'workspace') return ['.'];
  if (scope === 'planning') return ['.planning'];
  if (scope === 'loop') return listScopeRoots(resolveActiveProjectRoot(), 'loop', loopId);
  const config = await readRepoStudioConfig();
  return storyRootsFromConfig(config);
}

export async function getDiffStatus(input?: { scope?: DiffScope; loopId?: string }) {
  const scope = (String(input?.scope || 'workspace').trim().toLowerCase() as DiffScope);
  const result = runGit(['status', '--porcelain']);
  if ((result.status ?? 1) !== 0) {
    return {
      ok: false,
      message: 'Unable to read git status.',
      stderr: String(result.stderr || ''),
      files: [] as DiffStatusEntry[],
      roots: [] as string[],
    };
  }
  const roots = await scopeRoots(scope, input?.loopId);
  const files = parseStatus(String(result.stdout || ''))
    .filter((entry) => isPathWithinRoots(normalizeRelPath(entry.path), roots));
  return {
    ok: true,
    scope,
    roots,
    files,
  };
}

async function readWorktreeFile(filePath: string) {
  try {
    return await fs.readFile(path.join(resolveActiveProjectRoot(), filePath), 'utf8');
  } catch {
    return '';
  }
}

function gitShow(ref: string, filePath: string) {
  const result = runGit(['show', `${ref}:${filePath}`]);
  return (result.status ?? 1) === 0 ? String(result.stdout || '') : '';
}

function gitUnifiedDiff(baseRef: string, headRef: string, filePath: string) {
  const args = ['diff', '--no-color'];
  if (baseRef === 'WORKTREE') {
    // use git diff -- path
  } else if (headRef === 'WORKTREE') {
    args.push(baseRef);
  } else {
    args.push(baseRef, headRef);
  }
  args.push('--', filePath);
  const result = runGit(args);
  return String(result.stdout || '');
}

export async function getDiffFile(input: {
  path: string;
  base?: string;
  head?: string;
  scope?: DiffScope;
  loopId?: string;
}) {
  const filePath = normalizeRelPath(input.path);
  const baseRef = String(input.base || 'HEAD').trim();
  const headRef = String(input.head || 'WORKTREE').trim();
  if (!isSafeRepoPath(filePath)) {
    return { ok: false, message: 'Invalid path parameter.' };
  }
  if (baseRef !== 'WORKTREE' && !safeRef(baseRef)) {
    return { ok: false, message: 'Invalid base ref.' };
  }
  if (headRef !== 'WORKTREE' && !safeRef(headRef)) {
    return { ok: false, message: 'Invalid head ref.' };
  }

  const scope = (String(input.scope || 'workspace').trim().toLowerCase() as DiffScope);
  const roots = await scopeRoots(scope, input.loopId);
  if (!isPathWithinRoots(filePath, roots)) {
    return {
      ok: false,
      message: `Path ${filePath} is outside selected diff scope.`,
      roots,
    };
  }

  const original = baseRef === 'WORKTREE' ? await readWorktreeFile(filePath) : gitShow(baseRef, filePath);
  const modified = headRef === 'WORKTREE' ? await readWorktreeFile(filePath) : gitShow(headRef, filePath);
  const unifiedDiff = gitUnifiedDiff(baseRef, headRef, filePath);

  return {
    ok: true,
    path: filePath,
    base: baseRef,
    head: headRef,
    scope,
    roots,
    original,
    modified,
    unifiedDiff,
  };
}
