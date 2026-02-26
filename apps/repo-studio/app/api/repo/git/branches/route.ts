import { NextResponse } from 'next/server';

import { gitBranches } from '@/lib/git-ops';
import { resolveActiveProjectRoot } from '@/lib/project-root';

export async function GET() {
  const result = gitBranches();
  return NextResponse.json({
    ok: result.ok,
    activeRoot: resolveActiveProjectRoot(),
    branches: (result as any).branches || [],
    stdout: result.stdout,
    stderr: result.stderr,
    command: result.command,
  }, { status: result.ok ? 200 : 500 });
}
