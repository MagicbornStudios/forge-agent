import { NextResponse } from 'next/server';
import {
  resolvePrimaryAndFallbacks,
  getPreferences,
  updatePreferences,
} from '@/lib/model-router/server-state';
import { getOpenRouterModels } from '@/lib/openrouter-models';

/**
 * @swagger
 * /api/model-settings:
 *   get:
 *     summary: Get model router state (active model, mode, registry from OpenRouter, preferences, primary + fallbacks)
 *     tags: [model]
 *     responses:
 *       200:
 *         description: Model settings and preferences; registry is from OpenRouter API
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
 *         description: New resolved primary and fallbacks
 */
export async function GET() {
  const registry = await getOpenRouterModels();
  const { primary, fallbacks, mode } = resolvePrimaryAndFallbacks();
  const preferences = getPreferences();

  return NextResponse.json({
    activeModelId: primary,
    mode,
    registry,
    preferences,
    primaryId: primary,
    fallbackIds: fallbacks,
  });
}

export async function POST(req: Request) {
  const body = await req.json();

  const patch: Record<string, unknown> = {};
  if (body.mode) patch.mode = body.mode;
  if (body.manualModelId !== undefined) patch.manualModelId = body.manualModelId;
  if (body.enabledModelIds) patch.enabledModelIds = body.enabledModelIds;

  updatePreferences(patch);

  const { primary, fallbacks, mode } = resolvePrimaryAndFallbacks();

  return NextResponse.json({
    activeModelId: primary,
    mode,
    primaryId: primary,
    fallbackIds: fallbacks,
  });
}
