import { NextResponse } from 'next/server';
import type { ModelProviderId } from '@/lib/model-router/types';
import { getOpenRouterModels } from '@/lib/openrouter-models';
import { getPersistedModelIds, setPersistedModelId } from '@/lib/model-router/persistence';
import { resolveModelIdFromRegistry } from '@/lib/model-router/selection';

/**
 * @swagger
 * /api/model-settings:
 *   get:
 *     summary: Get model registry (OpenRouter) and selected model IDs for copilot and assistantUi
 *     tags: [model]
 *     responses:
 *       200:
 *         description: registry, copilotModelId, assistantUiModelId
 *   post:
 *     summary: Set model for a provider (copilot or assistantUi)
 *     tags: [model]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               provider: { type: string, enum: [copilot, assistantUi] }
 *               modelId: { type: string }
 *     responses:
 *       200:
 *         description: Updated copilotModelId and assistantUiModelId
 */
export async function GET(req: Request) {
  const registry = await getOpenRouterModels();
  const { copilotModelId, assistantUiModelId } = await getPersistedModelIds(req);

  const resolvedCopilotModelId = resolveModelIdFromRegistry(copilotModelId, registry, {
    requireResponsesV2: true,
  });
  const resolvedAssistantUiModelId = resolveModelIdFromRegistry(assistantUiModelId, registry);

  return NextResponse.json({
    registry,
    copilotModelId: resolvedCopilotModelId,
    assistantUiModelId: resolvedAssistantUiModelId,
  });
}

export async function POST(req: Request) {
  let body: { provider?: string; modelId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const provider = body.provider as ModelProviderId | undefined;
  const modelId = typeof body.modelId === 'string' ? body.modelId.trim() : '';

  if (provider !== 'copilot' && provider !== 'assistantUi') {
    return NextResponse.json({ error: 'provider must be "copilot" or "assistantUi"' }, { status: 400 });
  }
  if (!modelId) {
    return NextResponse.json({ error: 'modelId is required' }, { status: 400 });
  }

  const registry = await getOpenRouterModels();
  const selectedModelId = resolveModelIdFromRegistry(
    modelId,
    registry,
    provider === 'copilot' ? { requireResponsesV2: true } : undefined,
  );

  const { copilotModelId, assistantUiModelId } = await setPersistedModelId(req, provider, selectedModelId);

  return NextResponse.json({
    copilotModelId,
    assistantUiModelId,
  });
}
