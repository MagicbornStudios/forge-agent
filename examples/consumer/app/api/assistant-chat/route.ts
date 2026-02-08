import { streamText, convertToModelMessages, jsonSchema, tool, type ToolSet } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

type ToolSchema = {
  description?: string;
  parameters: Record<string, unknown>;
};

type ToolSchemaRecord = Record<string, ToolSchema>;

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const openRouterHeaders = {
  'HTTP-Referer': 'https://forge-agent-poc.local',
  'X-Title': 'Forge Agent PoC',
};

function buildToolSet(schema: ToolSchemaRecord | undefined | null): ToolSet {
  if (!schema || typeof schema !== 'object') return {};

  const entries = Object.entries(schema)
    .map(([name, def]) => {
      if (!def || typeof def !== 'object') return null;
      const parameters = (def as ToolSchema).parameters;
      if (!parameters || typeof parameters !== 'object') return null;
      const description =
        typeof (def as ToolSchema).description === 'string'
          ? (def as ToolSchema).description
          : undefined;

      return [
        name,
        tool({
          description,
          parameters: jsonSchema(parameters),
          execute: async (input) => input ?? {},
        }),
      ] as const;
    })
    .filter(Boolean) as Array<readonly [string, ReturnType<typeof tool>]>;

  return Object.fromEntries(entries);
}

function resolveRequestedModel(configOverride: unknown): string | null {
  if (!configOverride || typeof configOverride !== 'object') return null;
  const modelName = (configOverride as { modelName?: unknown }).modelName;
  if (typeof modelName !== 'string') return null;
  const trimmed = modelName.trim();
  if (!trimmed || trimmed === 'auto') return null;
  return trimmed;
}

export async function POST(req: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'OpenRouter API key not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: {
    messages?: unknown[];
    system?: unknown;
    tools?: ToolSchemaRecord;
    callSettings?: Record<string, unknown>;
    config?: Record<string, unknown>;
  };

  try {
    body = (await req.json()) as typeof body;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const tools = buildToolSet(body.tools);
  const messages = Array.isArray(body.messages) ? body.messages : [];
  const system = typeof body.system === 'string' ? body.system : undefined;
  const callSettings = body.callSettings ?? {};
  const requestedModel = resolveRequestedModel(body.config);

  const fallbackEnv = process.env.OPENROUTER_FALLBACK_MODELS ?? '';
  const fallbackModels = fallbackEnv
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

  const defaultModel =
    process.env.OPENROUTER_MODEL?.trim() || 'google/gemini-2.0-flash-exp:free';
  const selectedPrimary = requestedModel ?? defaultModel;
  const selectedFallbacks = requestedModel ? [] : fallbackModels;

  const customFetch =
    selectedFallbacks.length > 0
      ? createFetchWithModelFallbacks(selectedPrimary, selectedFallbacks, process.env.OPENROUTER_BASE_URL ?? OPENROUTER_BASE_URL)
      : undefined;

  const openai = createOpenAI({
    apiKey,
    baseURL: process.env.OPENROUTER_BASE_URL ?? OPENROUTER_BASE_URL,
    headers: openRouterHeaders,
    fetch: customFetch,
  });

  const aiMessages = convertToModelMessages(messages as any, {
    tools,
    ignoreIncompleteToolCalls: true,
  });

  const maxTokensValue =
    typeof callSettings.maxTokens === 'number'
      ? callSettings.maxTokens
      : typeof callSettings.maxOutputTokens === 'number'
        ? callSettings.maxOutputTokens
        : undefined;

  const result = streamText({
    model: openai.chat(selectedPrimary),
    messages: aiMessages,
    ...(system ? { system } : {}),
    ...(Object.keys(tools).length > 0 ? { tools } : {}),
    ...(typeof callSettings.temperature === 'number'
      ? { temperature: callSettings.temperature }
      : {}),
    ...(typeof callSettings.topP === 'number' ? { topP: callSettings.topP } : {}),
    ...(typeof callSettings.topK === 'number' ? { topK: callSettings.topK } : {}),
    ...(typeof callSettings.presencePenalty === 'number'
      ? { presencePenalty: callSettings.presencePenalty }
      : {}),
    ...(typeof callSettings.frequencyPenalty === 'number'
      ? { frequencyPenalty: callSettings.frequencyPenalty }
      : {}),
    ...(typeof callSettings.seed === 'number' ? { seed: callSettings.seed } : {}),
    ...(typeof maxTokensValue === 'number' ? { maxOutputTokens: maxTokensValue } : {}),
    headers: {
      ...openRouterHeaders,
      ...(callSettings.headers && typeof callSettings.headers === 'object'
        ? (callSettings.headers as Record<string, string | undefined>)
        : {}),
    },
  });

  return result.toUIMessageStreamResponse();
}

function createFetchWithModelFallbacks(
  primary: string,
  fallbacks: string[],
  baseUrl: string,
  baseFetch: typeof fetch = fetch,
): typeof fetch {
  const models = [primary, ...fallbacks];
  const baseOrigin = new URL(baseUrl).origin;

  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : (input as Request).url;
    const parsed = new URL(url);
    if (parsed.origin !== baseOrigin || !parsed.pathname.includes('chat/completions')) {
      return baseFetch(input, init);
    }
    if (!init?.body) return baseFetch(input, init);
    try {
      const body = JSON.parse(init.body as string) as Record<string, unknown>;
      body.models = models;
      return baseFetch(input, { ...init, body: JSON.stringify(body) });
    } catch {
      return baseFetch(input, init);
    }
  };
}
