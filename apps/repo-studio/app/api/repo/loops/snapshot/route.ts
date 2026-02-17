import path from 'node:path';
import { NextResponse } from 'next/server';

import { buildPlanningStructuredModelFromSnapshot } from '@/lib/planning/model';
import { loadRepoStudioSnapshot } from '@/lib/repo-data';

function resolveRepoRoot() {
  return path.resolve(process.cwd(), '..', '..');
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const loopId = String(url.searchParams.get('loopId') || '').trim().toLowerCase() || undefined;
  const includeStructured = String(url.searchParams.get('structured') || '').trim() === '1';
  const repoRoot = resolveRepoRoot();
  const snapshot = await loadRepoStudioSnapshot(repoRoot, { loopId });
  const structured = includeStructured ? buildPlanningStructuredModelFromSnapshot(snapshot.planning) : null;

  return NextResponse.json({
    ok: true,
    loops: snapshot.loops,
    planning: includeStructured
      ? {
        ...snapshot.planning,
        structured,
      }
      : snapshot.planning,
    commands: snapshot.commands,
  });
}
