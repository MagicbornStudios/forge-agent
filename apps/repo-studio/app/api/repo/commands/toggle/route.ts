import { NextResponse } from 'next/server';

import { runRepoStudioCli } from '@/lib/cli-runner';

export async function POST(request: Request) {
  let body: { commandId?: string; disabled?: boolean } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const commandId = String(body.commandId || '').trim();
  if (!commandId) {
    return NextResponse.json({ ok: false, message: 'commandId is required.' }, { status: 400 });
  }

  const args = [
    'commands-toggle',
    commandId,
    body.disabled === false ? '--enable' : '--disable',
    '--json',
  ];
  const result = runRepoStudioCli(args);
  const payload = result.payload || {};
  return NextResponse.json({
    ok: payload.ok ?? result.ok,
    commandId: payload.commandId || commandId,
    disabled: payload.disabled ?? (body.disabled !== false),
    disabledCommandIds: payload.disabledCommandIds || [],
    message: payload.message || (result.ok ? 'Updated command policy.' : 'Failed to update command policy.'),
    stderr: payload.stderr || result.stderr,
  }, { status: payload.ok === false || !result.ok ? 400 : 200 });
}
