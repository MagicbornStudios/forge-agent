import { NextResponse } from 'next/server';
import {
  getCodexModelCatalog,
  getForgeModelCatalog,
  type AssistantRuntime,
} from '@/lib/model-catalog';
import { getRepoSettingsSnapshot } from '@/lib/settings/repository';

function normalizeRuntime(value: unknown): AssistantRuntime {
  return String(value || '').trim().toLowerCase() === 'codex' ? 'codex' : 'forge';
}

function selectedModelFromSettings(merged: Record<string, unknown>, runtime: AssistantRuntime, loopId: string) {
  const assistant = merged.assistant && typeof merged.assistant === 'object'
    ? merged.assistant as Record<string, unknown>
    : {};
  const models = assistant.models && typeof assistant.models === 'object'
    ? assistant.models as Record<string, unknown>
    : {};
  const byLoop = models.byLoop && typeof models.byLoop === 'object'
    ? models.byLoop as Record<string, unknown>
    : {};
  const loopRecord = byLoop[loopId] && typeof byLoop[loopId] === 'object'
    ? byLoop[loopId] as Record<string, unknown>
    : {};
  const loopValue = String(loopRecord[runtime] || '').trim();
  if (loopValue) return loopValue;
  const directValue = String(models[runtime] || '').trim();
  if (directValue) return directValue;
  return runtime === 'codex' ? 'gpt-5' : 'openai/gpt-oss-120b:free';
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const runtime = normalizeRuntime(url.searchParams.get('runtime'));
  const workspaceId = String(url.searchParams.get('workspaceId') || 'planning').trim() || 'planning';
  const loopId = String(url.searchParams.get('loopId') || 'default').trim().toLowerCase() || 'default';
  try {
    const [catalog, snapshot] = await Promise.all([
      runtime === 'codex' ? getCodexModelCatalog() : getForgeModelCatalog(),
      getRepoSettingsSnapshot({ workspaceId, loopId }),
    ]);
    const selectedModelId = selectedModelFromSettings(
      (snapshot?.merged && typeof snapshot.merged === 'object')
        ? snapshot.merged as Record<string, unknown>
        : {},
      runtime,
      loopId,
    );
    const status = runtime === 'forge' && catalog.ok !== true ? 503 : 200;
    return NextResponse.json({
      ok: catalog.ok,
      runtime,
      source: catalog.source,
      warning: catalog.warning || '',
      message: catalog.ok ? '' : (catalog.warning || 'Forge model catalog unavailable.'),
      selectedModelId,
      models: catalog.models,
    }, { status });
  } catch (error: any) {
    const message = String(error?.message || error || 'Unable to load model catalog.');
    return NextResponse.json({
      ok: false,
      runtime,
      models: [],
      selectedModelId: runtime === 'codex' ? 'gpt-5' : 'openai/gpt-oss-120b:free',
      warning: message,
      message,
      source: 'error',
    }, { status: runtime === 'forge' ? 503 : 500 });
  }
}
