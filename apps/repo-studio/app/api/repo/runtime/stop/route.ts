import { NextResponse } from 'next/server';

import { runRepoStudioCli } from '@/lib/cli-runner';
import { resolveHostWorkspaceRoot } from '@/lib/project-root';

export async function POST() {
  const result = runRepoStudioCli(['stop', '--json'], { cwd: resolveHostWorkspaceRoot() });
  const payload = result.payload || {};
  return NextResponse.json({
    ok: payload.ok ?? result.ok,
    stopped: payload.stopped ?? false,
    message: payload.message || (result.ok ? 'Runtime stop requested.' : 'Unable to stop runtime.'),
    stdout: payload.stdout || result.stdout,
    stderr: payload.stderr || result.stderr,
    code: payload.code ?? result.code,
  }, { status: payload.ok === false || !result.ok ? 500 : 200 });
}
