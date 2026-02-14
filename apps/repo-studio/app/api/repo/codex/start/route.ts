import { NextResponse } from 'next/server';

import { runRepoStudioCli } from '@/lib/cli-runner';

export async function POST(request: Request) {
  let body: { wsPort?: number; reuse?: boolean } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const args = ['codex-start'];
  if (typeof body.wsPort === 'number' && Number.isFinite(body.wsPort) && body.wsPort > 0) {
    args.push('--ws-port', String(body.wsPort));
  }
  if (body.reuse === false) args.push('--no-reuse');
  args.push('--json');

  const result = runRepoStudioCli(args);
  const payload = result.payload || {};
  return NextResponse.json({
    ok: payload.ok ?? result.ok,
    reused: payload.reused ?? false,
    pid: payload.pid || payload.runtime?.pid || null,
    wsUrl: payload.wsUrl || payload.runtime?.wsUrl || null,
    message: payload.message || (result.ok ? 'Codex started.' : 'Failed to start Codex.'),
    stderr: payload.stderr || result.stderr,
  }, { status: payload.ok === false || !result.ok ? 400 : 200 });
}
