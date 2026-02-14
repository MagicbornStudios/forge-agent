import { NextResponse } from 'next/server';

import { getDependencyHealth } from '@/lib/dependency-health';

export async function GET() {
  const deps = getDependencyHealth(process.cwd());
  const ok = deps.dockviewPackageResolved && deps.dockviewCssResolved && deps.sharedStylesResolved;

  return NextResponse.json({
    ok,
    deps,
  }, { status: ok ? 200 : 500 });
}
