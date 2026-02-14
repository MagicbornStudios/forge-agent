import { NextResponse } from 'next/server';

import { runRepoStudioCli } from '@/lib/cli-runner';

export async function GET() {
  const result = runRepoStudioCli(['codex-status', '--json']);
  const payload = result.payload || {};
  return NextResponse.json({
    ok: payload.ok ?? result.ok,
    readiness: payload.readiness || null,
    runtime: payload.runtime || null,
    running: payload.running ?? false,
    message: payload.message || (result.ok ? 'Codex status loaded.' : 'Failed to load Codex status.'),
    stderr: payload.stderr || result.stderr,
  }, { status: payload.ok === false || !result.ok ? 400 : 200 });
}
