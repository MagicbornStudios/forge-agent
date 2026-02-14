import { NextResponse } from 'next/server';

import { loadCommandsFromCli } from '@/lib/command-policy';
import { serializeRun, startRepoRun } from '@/lib/run-manager';

export async function POST(request: Request) {
  let body: { commandId?: string; confirm?: boolean } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const commandId = String(body.commandId || '').trim();
  if (!commandId) {
    return NextResponse.json({ ok: false, message: 'commandId is required.' }, { status: 400 });
  }
  if (body.confirm !== true) {
    return NextResponse.json({ ok: false, message: 'Confirmation required before execution.' }, { status: 400 });
  }

  const commandsModel = loadCommandsFromCli();
  if (!commandsModel.ok) {
    return NextResponse.json({
      ok: false,
      message: 'Unable to load allowlisted commands.',
      stderr: commandsModel.raw.stderr,
    }, { status: 500 });
  }

  const entry = commandsModel.commands.find((item) => item.id === commandId);
  if (!entry) {
    return NextResponse.json({ ok: false, message: `Unknown command id: ${commandId}` }, { status: 404 });
  }
  if (entry.blocked) {
    const reason = entry.blockedBy === 'disabled-id'
      ? 'Command is disabled in local overrides.'
      : `Command is blocked by policy: ${entry.command}`;
    return NextResponse.json({ ok: false, message: reason }, { status: 400 });
  }

  const run = startRepoRun(commandId, entry.command);
  return NextResponse.json({
    ok: true,
    run: serializeRun(run),
    streamPath: `/api/repo/runs/${run.id}/stream`,
    stopPath: `/api/repo/runs/${run.id}/stop`,
    message: `Started ${commandId}.`,
  });
}
