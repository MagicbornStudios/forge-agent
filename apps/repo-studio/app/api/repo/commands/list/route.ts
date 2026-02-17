import { NextResponse } from 'next/server';

import { loadCommandsModel } from '@/lib/command-policy';

export async function GET() {
  const model = await loadCommandsModel();
  const status = model.ok ? 200 : 500;
  return NextResponse.json({
    ok: model.ok,
    commands: model.commands,
    disabledCommandIds: model.disabledCommandIds,
    commandView: model.commandView,
  }, { status });
}
