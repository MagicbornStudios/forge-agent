import path from 'node:path';
import { NextResponse } from 'next/server';

import { loadRepoStudioSnapshot } from '@/lib/repo-data';

function resolveRepoRoot() {
  return path.resolve(process.cwd(), '..', '..');
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const loopId = String(url.searchParams.get('loopId') || '').trim().toLowerCase() || undefined;
  const repoRoot = resolveRepoRoot();
  const snapshot = await loadRepoStudioSnapshot(repoRoot, { loopId });

  return NextResponse.json({
    ok: true,
    loops: snapshot.loops,
    planning: snapshot.planning,
    commands: snapshot.commands,
  });
}

