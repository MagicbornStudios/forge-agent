import path from 'node:path';
import { NextResponse } from 'next/server';

import { loadRepoStudioSnapshot } from '@/lib/repo-data';

function resolveRepoRoot() {
  return path.resolve(process.cwd(), '..', '..');
}

export async function GET() {
  const repoRoot = resolveRepoRoot();
  const snapshot = await loadRepoStudioSnapshot(repoRoot);
  return NextResponse.json({
    ok: true,
    loops: snapshot.loops,
  });
}

