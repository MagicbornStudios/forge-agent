import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import payloadConfig from '@/payload.config';
import { getOpenRouterConfig } from '@/lib/openrouter-config';
import { DEFAULT_TASK_MODEL } from '@/lib/model-router/defaults';
import { recordAiUsageEvent } from '@/lib/server/ai-usage';
import { requireAiRequestAuth } from '@/lib/server/api-keys';
import { runForgeStoryBuilderWorkflow } from '@forge/assistant-runtime';

export async function POST(request: NextRequest) {
  const openRouterConfig = getOpenRouterConfig();
  if (!openRouterConfig.apiKey) {
    return NextResponse.json({ error: 'OpenRouter API key not configured' }, { status: 503 });
  }

  const payload = await getPayload({ config: payloadConfig });
  const authContext = await requireAiRequestAuth(payload, request, 'ai.plan');
  if (!authContext) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { premise?: string; characterCount?: number; sceneCount?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const premise = typeof body.premise === 'string' ? body.premise.trim() : '';
  if (!premise) {
    return NextResponse.json({ error: 'premise is required' }, { status: 400 });
  }

  try {
    const result = await runForgeStoryBuilderWorkflow({
      premise,
      characterCount: typeof body.characterCount === 'number' ? body.characterCount : undefined,
      sceneCount: typeof body.sceneCount === 'number' ? body.sceneCount : undefined,
      openRouterApiKey: openRouterConfig.apiKey,
      openRouterBaseUrl: openRouterConfig.baseUrl,
      modelId: DEFAULT_TASK_MODEL,
      headers: {
        'HTTP-Referer': 'https://forge-agent-poc.local',
        'X-Title': 'Forge Agent PoC',
      },
    });

    await recordAiUsageEvent({
      request,
      authContext,
      provider: 'openrouter',
      model: DEFAULT_TASK_MODEL,
      routeKey: '/api/forge/story-builder',
      status: 'success',
    });

    return NextResponse.json(result);
  } catch (error) {
    await recordAiUsageEvent({
      request,
      authContext,
      provider: 'openrouter',
      model: DEFAULT_TASK_MODEL,
      routeKey: '/api/forge/story-builder',
      status: 'error',
      errorMessage: error instanceof Error ? error.message : 'Story builder failed',
    });

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Story builder failed' },
      { status: 500 }
    );
  }
}
