import { NextRequest, NextResponse } from 'next/server';
import { getOpenRouterConfig } from '@/lib/openrouter-config';
import { resolveModel } from '@/lib/model-router/server-state';

/**
 * POST /api/forge/plan
 * Body: { goal: string, graphSummary?: { title, nodeCount, nodes: { id, type, label }[], edges: { id, source, target }[] } }
 * Returns a plan: { steps: ForgeGraphPatchOp[] } using LLM structured output.
 */
export async function POST(request: NextRequest) {
  const config = getOpenRouterConfig();
  if (!config.apiKey) {
    return NextResponse.json(
      { error: 'OpenRouter API key not configured' },
      { status: 503 }
    );
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

  const graphSummary = body.graphSummary ?? {};
  const { modelId } = resolveModel();

  const systemPrompt =
    'You are a planning assistant for a dialogue graph editor. Given a goal and optional graph summary, output a JSON array of operations to perform. ' +
    'Each operation must be one of: createNode (nodeType, label, content?, speaker?, x?, y?), updateNode (nodeId, updates: {label?, content?, speaker?}), deleteNode (nodeId), createEdge (sourceNodeId, targetNodeId). ' +
    'Use existing node ids from the graph summary when connecting edges. For createNode use position x,y if provided else 0,0. Return only valid operations in order.';

  const userContent =
    `Goal: ${goal}\n\n` +
    `Current graph summary: ${JSON.stringify(graphSummary)}\n\n` +
    'Output a JSON object with a single key "steps" whose value is an array of operation objects. Each object must have "type" and the required args for that type.';

  const jsonSchema = {
    name: 'forge_plan',
    strict: true,
    schema: {
      type: 'object',
      properties: {
        steps: {
          type: 'array',
          description: 'Ordered list of graph operations',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['createNode', 'updateNode', 'deleteNode', 'createEdge'] },
              nodeType: { type: 'string' },
              label: { type: 'string' },
              content: { type: 'string' },
              speaker: { type: 'string' },
              x: { type: 'number' },
              y: { type: 'number' },
              nodeId: { type: 'string' },
              updates: { type: 'object' },
              sourceNodeId: { type: 'string' },
              targetNodeId: { type: 'string' },
              source: { type: 'string' },
              target: { type: 'string' },
            },
            required: ['type'],
            additionalProperties: true,
          },
        },
      },
      required: ['steps'],
      additionalProperties: false,
    },
  };

  const payload = {
    model: modelId,
    messages: [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userContent },
    ],
    stream: false,
    response_format: {
      type: 'json_schema' as const,
      json_schema: jsonSchema,
    },
  };

  try {
    const res = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://forge-agent-poc.local',
        'X-Title': 'Forge Agent PoC',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(config.timeoutMs),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('[forge/plan] OpenRouter error', res.status, text);
      return NextResponse.json(
        { error: 'Plan generation failed', details: text.slice(0, 200) },
        { status: 502 }
      );
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content;
    if (content == null) {
      return NextResponse.json({ error: 'Empty response' }, { status: 502 });
    }

    let parsed: { steps?: unknown[] };
    try {
      parsed = JSON.parse(content);
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in plan response', raw: content.slice(0, 500) },
        { status: 502 }
      );
    }

    const steps = Array.isArray(parsed.steps) ? parsed.steps : [];
    const normalized = steps.map((s) => normalizeStep(s));
    return NextResponse.json({ steps: normalized });
  } catch (err) {
    console.error('[forge/plan]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Plan generation failed' },
      { status: 500 }
    );
  }
}

function normalizeStep(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== 'object') return { type: 'createNode', label: 'Node', nodeType: 'CHARACTER', x: 0, y: 0 };
  const s = raw as Record<string, unknown>;
  const type = String(s.type ?? 'createNode');
  if (type === 'createEdge') {
    return {
      type: 'createEdge',
      source: s.source ?? s.sourceNodeId,
      target: s.target ?? s.targetNodeId,
    };
  }
  if (type === 'updateNode') {
    return { type: 'updateNode', nodeId: s.nodeId, updates: s.updates ?? {} };
  }
  if (type === 'deleteNode') {
    return { type: 'deleteNode', nodeId: s.nodeId };
  }
  return {
    type: 'createNode',
    nodeType: s.nodeType ?? 'CHARACTER',
    label: s.label ?? 'Node',
    content: s.content,
    speaker: s.speaker,
    x: typeof s.x === 'number' ? s.x : 0,
    y: typeof s.y === 'number' ? s.y : 0,
  };
}
