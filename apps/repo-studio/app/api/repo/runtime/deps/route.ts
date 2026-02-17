import { NextResponse } from 'next/server';

import { getDependencyHealth } from '@/lib/dependency-health';
import { runRepoStudioCli } from '@/lib/cli-runner';
import { getRepoAuthStatus } from '@/lib/repo-auth-memory';

export async function GET() {
  const deps = getDependencyHealth(process.cwd());
  const doctor = runRepoStudioCli(['doctor', '--json']);
  const desktop = doctor.payload?.desktop || null;
  const desktopAuth = getRepoAuthStatus();
  const desktopOk = desktop
    ? Boolean(
      desktop.electronInstalled
      && desktop.nextStandalonePresent
      && desktop.sqlitePathWritable
      && desktop.watcherAvailable,
    )
    : false;
  const ok = deps.dockviewPackageResolved
    && deps.dockviewCssResolved
    && deps.sharedStylesResolved
    && deps.cssPackagesResolved
    && desktopOk;

  return NextResponse.json({
    ok,
    deps,
    desktop,
    desktopAuth,
  }, { status: ok ? 200 : 500 });
}
