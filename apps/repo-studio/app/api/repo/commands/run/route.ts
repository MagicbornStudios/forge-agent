import { NextResponse } from 'next/server';

import { runRepoStudioCli } from '@/lib/cli-runner';

export async function POST(request: Request) {
  let body: { commandId?: string; confirm?: boolean } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const commandId = String(body.commandId || '').trim();
  if (!commandId) {
    return NextResponse.json(
      { ok: false, message: 'commandId is required.' },
      { status: 400 },
    );
  }

  const args = ['run', commandId, '--json'];
  if (body.confirm === true) args.push('--confirm');
  const result = runRepoStudioCli(args);
  const payload = result.payload || {};

  return NextResponse.json({
    ok: payload.ok ?? result.ok,
    command: payload.command || '',
    stdout: payload.stdout || result.stdout,
    stderr: payload.stderr || result.stderr,
    code: payload.code ?? result.code,
    message: payload.message || (result.ok ? 'Command finished.' : 'Command failed.'),
  }, { status: payload.ok === false || !result.ok ? 400 : 200 });
}
