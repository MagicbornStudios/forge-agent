import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import payloadConfig from '@/payload.config';
import { getOpenRouterConfig } from '@/lib/openrouter-config';
import { DEFAULT_TASK_MODEL } from '@/lib/model-router/defaults';
import { recordAiUsageEvent } from '@/lib/server/ai-usage';
import { requireAiRequestAuth } from '@/lib/server/api-keys';
import { runForgePlanWorkflow } from '@forge/assistant-runtime';

/**
 * @swagger
 * /api/forge/plan:
 *   post:
 *     summary: Generate a plan (steps) for a goal using LLM structured output
 *     tags: [ai]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               goal: { type: string }
 *               graphSummary: {}
 *     responses:
 *       200:
 *         description: Plan with steps array
 *       400:
 *         description: Invalid request (e.g. goal required)
 *       503:
 *         description: OpenRouter not configured
 */
export async function POST(request: NextRequest) {
  const openRouterConfig = getOpenRouterConfig();
  if (!openRouterConfig.apiKey) {
    return NextResponse.json({ error: 'OpenRouter API key not configured' }, { status: 503 });
  }

  const payloadClient = await getPayload({ config: payloadConfig });
  const authContext = await requireAiRequestAuth(payloadClient, request, 'ai.plan');
  if (!authContext) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { goal?: string; graphSummary?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const goal = typeof body.goal === 'string' ? body.goal.trim() : '';
  if (!goal) {
    return NextResponse.json({ error: 'goal is required' }, { status: 400 });
  }

  try {
    const result = await runForgePlanWorkflow({
      goal,
      graphSummary: body.graphSummary ?? {},
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
      routeKey: '/api/forge/plan',
      status: 'success',
    });

    return NextResponse.json({
      steps: result.steps,
      summary: result.summary,
    });
  } catch (error) {
    await recordAiUsageEvent({
      request,
      authContext,
      provider: 'openrouter',
      model: DEFAULT_TASK_MODEL,
      routeKey: '/api/forge/plan',
      status: 'error',
      errorMessage: error instanceof Error ? error.message : 'Plan generation failed',
    });

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Plan generation failed' },
      { status: 500 },
    );
  }
}
