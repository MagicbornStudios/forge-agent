import { NextResponse } from 'next/server';

import { runRepoStudioCli } from '@/lib/cli-runner';

export async function POST() {
  const result = runRepoStudioCli(['codex-login', '--json'], { timeoutMs: 300000 });
  const payload = result.payload || {};
  const ok = payload.ok ?? result.ok;
  return NextResponse.json({
    ok,
    message: payload.message || (ok ? 'Codex login completed.' : 'Codex login failed.'),
    authUrl: payload.authUrl || null,
    readiness: payload.readiness || null,
    stdout: payload.stdout || result.stdout || '',
    stderr: payload.stderr || result.stderr || '',
  }, { status: ok ? 200 : 400 });
}
