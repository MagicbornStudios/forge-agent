import { NextResponse } from 'next/server';
import { upsertRepoSettings } from '@/lib/settings/repository';
import type { AssistantRuntime } from '@/lib/model-catalog';

function normalizeRuntime(value: unknown): AssistantRuntime {
  return String(value || '').trim().toLowerCase() === 'codex' ? 'codex' : 'forge';
}

export async function POST(request: Request) {
  let body: {
    runtime?: string;
    modelId?: string;
    workspaceId?: string;
    loopId?: string;
  } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const runtime = normalizeRuntime(body.runtime);
  const modelId = String(body.modelId || '').trim();
  if (!modelId) {
    return NextResponse.json({
      ok: false,
      message: 'modelId is required.',
    }, { status: 400 });
  }

  const workspaceId = String(body.workspaceId || 'planning').trim() || 'planning';
  const loopId = String(body.loopId || 'default').trim().toLowerCase() || 'default';

  try {
    const snapshot = await upsertRepoSettings({
      scope: 'local',
      scopeId: 'default',
      workspaceId,
      loopId,
      settings: {
        assistant: {
          models: {
            byLoop: {
              [loopId]: {
                [runtime]: modelId,
              },
            },
          },
        },
      },
    });
    return NextResponse.json({
      ok: true,
      runtime,
      modelId,
      snapshot,
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      runtime,
      modelId,
      message: String(error?.message || error || 'Unable to persist model selection.'),
    }, { status: 500 });
  }
}
