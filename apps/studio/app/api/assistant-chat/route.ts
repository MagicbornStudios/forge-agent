import { streamText, convertToModelMessages, jsonSchema, tool, type ToolSet } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { getLogger } from '@/lib/logger';
import { getOpenRouterConfig } from '@/lib/openrouter-config';
import { getOpenRouterModels } from '@/lib/openrouter-models';
import { getPersistedModelIdForProvider } from '@/lib/model-router/persistence';
import { resolveModelIdFromRegistry } from '@/lib/model-router/selection';

const log = getLogger('assistant-chat');

type ToolSchema = {
  description?: string;
  parameters: Record<string, unknown>;
};

type ToolSchemaRecord = Record<string, ToolSchema>;

const openRouterHeaders = {
  'HTTP-Referer': 'https://forge-agent-poc.local',
  'X-Title': 'Forge Agent PoC',
};

const config = getOpenRouterConfig();

function buildToolSet(schema: ToolSchemaRecord | undefined | null): ToolSet {
  if (!schema || typeof schema !== 'object') return {};

  const toolSet: ToolSet = {};

  for (const [name, def] of Object.entries(schema)) {
    if (!def || typeof def !== 'object') continue;
    const parameters = (def as ToolSchema).parameters;
    if (!parameters || typeof parameters !== 'object') continue;
    const description =
      typeof (def as ToolSchema).description === 'string'
        ? (def as ToolSchema).description
        : undefined;

    toolSet[name] = tool({
      description,
      inputSchema: jsonSchema(parameters),
    });
  }

  return toolSet;
}

export async function POST(req: Request) {
  if (!config.apiKey) {
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
  const selectedModel = await getPersistedModelIdForProvider(req, 'assistantUi');
  const registry = await getOpenRouterModels();
  const resolvedModel = resolveModelIdFromRegistry(selectedModel, registry);
  if (resolvedModel !== selectedModel) {
    log.warn({ selectedModel, resolvedModel }, 'Assistant model fallback applied');
  }
  log.info({ modelId: resolvedModel }, 'Model resolved');

  const openai = createOpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseUrl,
    headers: openRouterHeaders,
  });

  const aiMessages = await convertToModelMessages(messages as any, {
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
    model: openai.chat(resolvedModel),
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
