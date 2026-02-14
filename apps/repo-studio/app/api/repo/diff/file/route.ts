import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { NextResponse } from 'next/server';

function resolveRepoRoot() {
  return path.resolve(process.cwd(), '..', '..');
}

function isSafeRepoPath(filePath: string) {
  const normalized = String(filePath || '').replace(/\\/g, '/');
  if (!normalized || normalized.startsWith('/') || /^[a-zA-Z]:\//.test(normalized)) return false;
  if (normalized.includes('../') || normalized.includes('..\\')) return false;
  return /^[a-zA-Z0-9._/@-]+(?:\/[a-zA-Z0-9._@-]+)*$/.test(normalized);
}

function isSafeRef(ref: string) {
  if (!ref) return false;
  return /^[A-Za-z0-9._/\-]+$/.test(ref);
}

function gitShow(cwd: string, ref: string, filePath: string) {
  const result = spawnSync('git', ['show', `${ref}:${filePath}`], {
    cwd,
    encoding: 'utf8',
  });
  if ((result.status ?? 1) !== 0) {
    return '';
  }
  return String(result.stdout || '');
}

function gitUnifiedDiff(cwd: string, baseRef: string, headRef: string, filePath: string) {
  const args = ['diff', '--no-color'];
  if (baseRef === 'WORKTREE') {
    // no-op; use git diff -- path
  } else if (headRef === 'WORKTREE') {
    args.push(baseRef);
  } else {
    args.push(baseRef, headRef);
  }
  args.push('--', filePath);
  const result = spawnSync('git', args, { cwd, encoding: 'utf8' });
  return String(result.stdout || '');
}

async function readWorktreeFile(cwd: string, filePath: string) {
  try {
    return await fs.readFile(path.join(cwd, filePath), 'utf8');
  } catch {
    return '';
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const filePath = String(url.searchParams.get('path') || '').trim();
  const baseRef = String(url.searchParams.get('base') || 'HEAD').trim();
  const headRef = String(url.searchParams.get('head') || 'WORKTREE').trim();

  if (!isSafeRepoPath(filePath)) {
    return NextResponse.json({ ok: false, message: 'Invalid path parameter.' }, { status: 400 });
  }
  if (baseRef !== 'WORKTREE' && !isSafeRef(baseRef)) {
    return NextResponse.json({ ok: false, message: 'Invalid base ref.' }, { status: 400 });
  }
  if (headRef !== 'WORKTREE' && !isSafeRef(headRef)) {
    return NextResponse.json({ ok: false, message: 'Invalid head ref.' }, { status: 400 });
  }

  const cwd = resolveRepoRoot();
  const original = baseRef === 'WORKTREE'
    ? await readWorktreeFile(cwd, filePath)
    : gitShow(cwd, baseRef, filePath);
  const modified = headRef === 'WORKTREE'
    ? await readWorktreeFile(cwd, filePath)
    : gitShow(cwd, headRef, filePath);
  const unifiedDiff = gitUnifiedDiff(cwd, baseRef, headRef, filePath);

  return NextResponse.json({
    ok: true,
    path: filePath,
    base: baseRef,
    head: headRef,
    original,
    modified,
    unifiedDiff,
  });
}

