import { NextResponse } from 'next/server';

import { getDependencyHealth } from '@/lib/dependency-health';
import { runRepoStudioCli } from '@/lib/cli-runner';
import { getRepoAuthStatus } from '@/lib/repo-auth-memory';
import { evaluateRuntimeDepsSnapshot } from '@/lib/runtime-deps-evaluator';

export async function GET() {
  const deps = getDependencyHealth(process.cwd());
  const doctor = runRepoStudioCli(['doctor', '--json']);
  const desktop = doctor.payload?.desktop || null;
  const desktopAuth = getRepoAuthStatus();
  const evaluated = evaluateRuntimeDepsSnapshot({
    deps,
    desktop,
  });

  return NextResponse.json({
    ok: evaluated.ok,
    severity: evaluated.severity,
    desktopRuntimeReady: evaluated.desktopRuntimeReady,
    desktopStandaloneReady: evaluated.desktopStandaloneReady,
    deps,
    desktop,
    desktopAuth,
  }, { status: 200 });
}
