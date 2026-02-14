import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { NextResponse } from 'next/server';

function resolveRepoRoot() {
  return path.resolve(process.cwd(), '..', '..');
}

function parseStatus(stdout: string) {
  const lines = String(stdout || '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .filter(Boolean);

  return lines.map((line) => {
    const xy = line.slice(0, 2);
    const filePath = line.slice(3).trim();
    return {
      status: xy,
      path: filePath,
    };
  });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const scope = String(url.searchParams.get('scope') || 'workspace').trim().toLowerCase();
  const cwd = resolveRepoRoot();

  const result = spawnSync('git', ['status', '--porcelain'], {
    cwd,
    encoding: 'utf8',
  });

  if ((result.status ?? 1) !== 0) {
    return NextResponse.json({
      ok: false,
      message: 'Unable to read git status.',
      stderr: String(result.stderr || ''),
    }, { status: 500 });
  }

  const files = parseStatus(String(result.stdout || ''));
  return NextResponse.json({
    ok: true,
    scope,
    files,
  });
}

