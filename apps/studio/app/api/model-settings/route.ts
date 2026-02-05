import { NextResponse } from 'next/server';
import {
  resolveModel,
  getPreferences,
  updatePreferences,
  getHealthSnapshot,
} from '@/lib/model-router/server-state';
import { MODEL_REGISTRY } from '@/lib/model-router/registry';

/**
 * @swagger
 * /api/model-settings:
 *   get:
 *     summary: Get model router state (active model, mode, registry, preferences, health)
 *     tags: [model]
 *     responses:
 *       200:
 *         description: Model settings and health snapshot
 *   post:
 *     summary: Update model preferences (mode, manualModelId, enabledModelIds)
 *     tags: [model]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mode: { type: string }
 *               manualModelId: { type: string }
 *               enabledModelIds: { type: array, items: { type: string } }
 *     responses:
 *       200:
 *         description: New resolved model and health
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
