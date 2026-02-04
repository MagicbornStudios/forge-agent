import { NextResponse } from 'next/server';
import {
  resolveModel,
  getPreferences,
  updatePreferences,
  getHealthSnapshot,
} from '@/lib/model-router/server-state';
import { MODEL_REGISTRY } from '@/lib/model-router/registry';

/**
 * GET /api/model-settings
 *
 * Returns current model selection state: active model, mode,
 * registry, preferences, and health snapshot.
 */
export async function GET() {
  const { modelId, mode } = resolveModel();
  const preferences = getPreferences();
  const health = getHealthSnapshot();

  return NextResponse.json({
    activeModelId: modelId,
    mode,
    registry: MODEL_REGISTRY,
    preferences,
    health,
  });
}

/**
 * POST /api/model-settings
 *
 * Update user preferences (mode, manual model, enabled models).
 * Returns the new resolved model.
 */
export async function POST(req: Request) {
  const body = await req.json();

  const patch: Record<string, unknown> = {};
  if (body.mode) patch.mode = body.mode;
  if (body.manualModelId !== undefined) patch.manualModelId = body.manualModelId;
  if (body.enabledModelIds) patch.enabledModelIds = body.enabledModelIds;

  updatePreferences(patch);

  const { modelId, mode } = resolveModel();
  const health = getHealthSnapshot();

  return NextResponse.json({ activeModelId: modelId, mode, health });
}
