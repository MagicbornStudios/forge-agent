import { NextResponse } from 'next/server';
import { spawnSync } from 'node:child_process';

import { loadCommandsModel } from '@/lib/command-policy';

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

  const model = await loadCommandsModel();
  const entry = model.commands.find((item) => item.id === commandId);
  if (!entry) {
    return NextResponse.json({ ok: false, message: `Unknown command id: ${commandId}` }, { status: 404 });
  }
  if (entry.blocked) {
    return NextResponse.json({
      ok: false,
      message: entry.blockedBy === 'disabled-id'
        ? 'Command is disabled in RepoStudio settings.'
        : `Command is blocked by policy: ${entry.command}`,
    }, { status: 400 });
  }
  if (model.requireConfirm && body.confirm !== true) {
    return NextResponse.json({
      ok: false,
      message: 'Confirmation required before command execution.',
    }, { status: 400 });
  }

  const command = process.platform === 'win32' ? 'cmd.exe' : 'sh';
  const args = process.platform === 'win32'
    ? ['/d', '/s', '/c', entry.command]
    : ['-lc', entry.command];
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    encoding: 'utf8',
    shell: false,
    windowsHide: true,
  });
  const stderr = [String(result.stderr || '').trim(), result.error instanceof Error ? result.error.message : '']
    .filter(Boolean)
    .join('\n')
    .trim();
  const stdout = String(result.stdout || '');
  const ok = (result.status ?? 1) === 0;

  return NextResponse.json({
    ok,
    command: entry.command,
    stdout,
    stderr,
    code: result.status ?? 1,
    message: ok ? 'Command finished.' : 'Command failed.',
  }, { status: ok ? 200 : 400 });
}
