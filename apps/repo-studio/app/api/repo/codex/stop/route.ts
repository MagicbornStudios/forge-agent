import { NextResponse } from 'next/server';

import { runRepoStudioCli } from '@/lib/cli-runner';

export async function POST() {
  const result = runRepoStudioCli(['codex-stop', '--json']);
  const payload = result.payload || {};
  return NextResponse.json({
    ok: payload.ok ?? result.ok,
    stopped: payload.stopped ?? false,
    message: payload.message || (result.ok ? 'Codex stop requested.' : 'Failed to stop Codex.'),
    stderr: payload.stderr || result.stderr,
  }, { status: payload.ok === false || !result.ok ? 400 : 200 });
}
