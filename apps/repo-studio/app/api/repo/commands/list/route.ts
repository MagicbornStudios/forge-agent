import { NextResponse } from 'next/server';

import { loadCommandsFromCli } from '@/lib/command-policy';

export async function GET() {
  const model = loadCommandsFromCli();
  const status = model.ok ? 200 : 500;
  return NextResponse.json({
    ok: model.ok,
    commands: model.commands,
    disabledCommandIds: model.disabledCommandIds,
    commandView: model.commandView,
    stderr: model.raw.stderr,
  }, { status });
}
