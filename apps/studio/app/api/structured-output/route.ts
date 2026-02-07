import { NextRequest, NextResponse } from 'next/server';
import { getOpenRouterConfig } from '@/lib/openrouter-config';
import { resolvePrimaryAndFallbacks } from '@/lib/model-router/server-state';

/** Predefined JSON schemas for structured extraction. */
const NAMED_SCHEMAS: Record<string, { name: string; strict: boolean; schema: object }> = {
  characters: {
    name: 'characters',
    strict: true,
    schema: {
      type: 'object',
      properties: {
        characters: {
          type: 'array',
          description: 'List of characters extracted from the text',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Character name' },
              description: { type: 'string', description: 'Brief description' },
            },
            required: ['name'],
            additionalProperties: false,
          },
        },
      },
      required: ['characters'],
      additionalProperties: false,
    },
  },
  keyValue: {
    name: 'keyValue',
    strict: true,
    schema: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          description: 'List of key-value pairs',
          items: {
            type: 'object',
            properties: {
              key: { type: 'string' },
              value: { type: 'string' },
            },
            required: ['key', 'value'],
            additionalProperties: false,
          },
        },
      },
      required: ['items'],
      additionalProperties: false,
    },
  },
  list: {
    name: 'list',
    strict: true,
    schema: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          description: 'List of string items',
          items: { type: 'string' },
        },
      },
      required: ['items'],
      additionalProperties: false,
    },
  },
};

/**
 * @swagger
 * /api/structured-output:
 *   post:
 *     summary: Get structured JSON output from prompt using a named or custom schema
 *     tags: [ai]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prompt: { type: string }
 *               schemaName: { type: string }
 *               schema: { type: object }
 *     responses:
 *       200:
 *         description: Parsed JSON per schema
 *       400:
 *         description: prompt required or invalid schema
 *       503:
 *         description: OpenRouter not configured
 */
export async function POST(request: NextRequest) {
  const config = getOpenRouterConfig();
  if (!config.apiKey) {
    return NextResponse.json(
      { error: 'OpenRouter API key not configured' },
      { status: 503 }
    );
  }

  let body: { prompt?: string; schemaName?: string; schema?: { name: string; strict: boolean; schema: object } };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
  if (!prompt) {
    return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
  }

  let jsonSchema: { name: string; strict: boolean; schema: object };
  if (body.schema && typeof body.schema === 'object' && body.schema.schema) {
    jsonSchema = {
      name: body.schema.name ?? 'response',
      strict: body.schema.strict !== false,
      schema: body.schema.schema,
    };
  } else if (body.schemaName && NAMED_SCHEMAS[body.schemaName]) {
    jsonSchema = NAMED_SCHEMAS[body.schemaName];
  } else {
    jsonSchema = NAMED_SCHEMAS.list;
  }

  const { primary, fallbacks } = resolvePrimaryAndFallbacks();
  const models = [primary, ...fallbacks];

  const payload = {
    model: primary,
    ...(models.length > 1 && { models }),
    messages: [{ role: 'user' as const, content: prompt }],
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
      console.error('[structured-output] OpenRouter error', res.status, text);
      return NextResponse.json(
        { error: 'Structured output failed', details: text.slice(0, 200) },
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

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      return NextResponse.json(
        { error: 'Response was not valid JSON', raw: content.slice(0, 500) },
        { status: 502 }
      );
    }

    return NextResponse.json({ data: parsed, schemaName: jsonSchema.name });
  } catch (err) {
    console.error('[structured-output]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Structured output failed' },
      { status: 500 }
    );
  }
}
