import { NextResponse } from 'next/server';
import { loadCommandsModel } from '@/lib/command-policy';
import { upsertRepoSettings } from '@/lib/settings/repository';

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

  const model = await loadCommandsModel();
  const current = new Set(model.disabledCommandIds);
  if (body.disabled === false) current.delete(commandId);
  else current.add(commandId);

  const snapshot = await upsertRepoSettings({
    scope: 'local',
    scopeId: 'default',
    settings: {
      commands: {
        disabledCommandIds: [...current].sort((a, b) => String(a).localeCompare(String(b))),
      },
    },
  });

  const merged = (snapshot.merged as Record<string, any>) || {};
  const commands = merged.commands && typeof merged.commands === 'object' ? merged.commands : {};
  const disabledCommandIds = Array.isArray(commands.disabledCommandIds) ? commands.disabledCommandIds : [];

  return NextResponse.json({
    ok: true,
    commandId,
    disabled: body.disabled !== false,
    disabledCommandIds,
    message: 'Updated command policy.',
  }, { status: 200 });
}
