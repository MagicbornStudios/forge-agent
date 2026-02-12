import {
  streamText,
  convertToModelMessages,
  jsonSchema,
  tool,
  type ToolSet,
} from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { getPayload } from 'payload';
import payloadConfig from '@/payload.config';
import { getLogger } from '@/lib/logger';
import { getOpenRouterConfig } from '@/lib/openrouter-config';
import { getOpenRouterModels } from '@/lib/openrouter-models';
import { getPersistedModelIdForProvider } from '@/lib/model-router/persistence';
import { resolveModelIdFromRegistry } from '@/lib/model-router/selection';
import { recordAiUsageEvent } from '@/lib/server/ai-usage';
import { requireAiRequestAuth } from '@/lib/server/api-keys';
import { isLangGraphEnabledServer } from '@/lib/env';
import {
  createAssistantChatOrchestrator,
  PayloadSessionStore,
  type AssistantDomain,
  type AssistantEditorId,
} from '@forge/assistant-runtime';

const log = getLogger('assistant-chat');

type ToolSchema = {
  description?: string;
  parameters: Record<string, unknown>;
};

type ToolSchemaRecord = Record<string, ToolSchema>;

type ParsedBody = {
  messages?: unknown[];
  system?: unknown;
  tools?: ToolSchemaRecord;
  callSettings?: Record<string, unknown>;
};

const OPENROUTER_HEADERS = {
  'HTTP-Referer': 'https://forge-agent-poc.local',
  'X-Title': 'Forge Agent PoC',
};

const config = getOpenRouterConfig();

const ASSISTANT_HEADERS = {
  domain: 'x-forge-ai-domain',
  editorId: 'x-forge-ai-editor-id',
  projectId: 'x-forge-ai-project-id',
  viewportId: 'x-forge-ai-viewport-id',
} as const;

interface ResolvedChatRequest {
  req: Request;
  authContext: NonNullable<Awaited<ReturnType<typeof requireAiRequestAuth>>>;
  payloadClient: Awaited<ReturnType<typeof getPayload>>;
  body: ParsedBody;
  resolvedModel: string;
  tools: ToolSet;
  messages: unknown[];
  callSettings: Record<string, unknown>;
  baseSystem?: string;
}

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

function asString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function toDomain(value: string | null): AssistantDomain | null {
  if (value == null) return null;
  if (value === 'forge' || value === 'character' || value === 'writer' || value === 'video' || value === 'app') {
    return value;
  }
  return null;
}

function toEditorId(value: string | null): AssistantEditorId | null {
  if (value == null) return null;
  if (value === 'dialogue' || value === 'character' || value === 'writer' || value === 'app') {
    return value;
  }
  return null;
}

function inferEditorIdFromDomain(domain: AssistantDomain): AssistantEditorId {
  if (domain === 'forge') return 'dialogue';
  if (domain === 'character') return 'character';
  if (domain === 'writer') return 'writer';
  return 'app';
}

function extractLatestUserMessage(messages: unknown[]): string {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (!message || typeof message !== 'object') continue;

    const role = asString((message as { role?: unknown }).role);
    if (role !== 'user') continue;

    const content = (message as { content?: unknown }).content;
    if (typeof content === 'string' && content.trim().length > 0) {
      return content.trim();
    }

    const parts = (message as { parts?: unknown }).parts;
    if (Array.isArray(parts)) {
      const text = parts
        .map((part) => {
          if (!part || typeof part !== 'object') return '';
          const type = asString((part as { type?: unknown }).type);
          if (type !== 'text') return '';
          const value = asString((part as { text?: unknown }).text);
          return value ?? '';
        })
        .join(' ')
        .trim();

      if (text.length > 0) return text;
    }
  }

  return '';
}

async function streamAssistantResponse(input: {
  req: Request;
  authContext: NonNullable<Awaited<ReturnType<typeof requireAiRequestAuth>>>;
  resolvedModel: string;
  system?: string;
  tools: ToolSet;
  messages: unknown[];
  callSettings: Record<string, unknown>;
  routeKey: string;
}) {
  const openai = createOpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseUrl,
    headers: OPENROUTER_HEADERS,
  });

  const aiMessages = await convertToModelMessages(input.messages as any, {
    tools: input.tools,
    ignoreIncompleteToolCalls: true,
  });

  const maxTokensValue =
    typeof input.callSettings.maxTokens === 'number'
      ? input.callSettings.maxTokens
      : typeof input.callSettings.maxOutputTokens === 'number'
        ? input.callSettings.maxOutputTokens
        : undefined;

  const result = streamText({
    model: openai.chat(input.resolvedModel),
    messages: aiMessages,
    ...(input.system ? { system: input.system } : {}),
    ...(Object.keys(input.tools).length > 0 ? { tools: input.tools } : {}),
    ...(typeof input.callSettings.temperature === 'number'
      ? { temperature: input.callSettings.temperature }
      : {}),
    ...(typeof input.callSettings.topP === 'number' ? { topP: input.callSettings.topP } : {}),
    ...(typeof input.callSettings.topK === 'number' ? { topK: input.callSettings.topK } : {}),
    ...(typeof input.callSettings.presencePenalty === 'number'
      ? { presencePenalty: input.callSettings.presencePenalty }
      : {}),
    ...(typeof input.callSettings.frequencyPenalty === 'number'
      ? { frequencyPenalty: input.callSettings.frequencyPenalty }
      : {}),
    ...(typeof input.callSettings.seed === 'number' ? { seed: input.callSettings.seed } : {}),
    ...(typeof maxTokensValue === 'number' ? { maxOutputTokens: maxTokensValue } : {}),
    headers: {
      ...OPENROUTER_HEADERS,
      ...(input.callSettings.headers && typeof input.callSettings.headers === 'object'
        ? (input.callSettings.headers as Record<string, string | undefined>)
        : {}),
    },
    onFinish: async ({ usage, response }) => {
      await recordAiUsageEvent({
        request: input.req,
        authContext: input.authContext,
        requestId: typeof response?.id === 'string' ? response.id : undefined,
        provider: 'openrouter',
        model: input.resolvedModel,
        routeKey: input.routeKey,
        usage: usage as {
          promptTokens?: number;
          completionTokens?: number;
          totalTokens?: number;
        },
        status: 'success',
      });
    },
  });

  return result.toUIMessageStreamResponse();
}

async function buildLangGraphSystemAddendum(input: {
  req: Request;
  payloadClient: Awaited<ReturnType<typeof getPayload>>;
  userId: number;
  body: ParsedBody;
  resolvedModel: string;
}): Promise<string | null> {
  const projectId = asNumber(input.req.headers.get(ASSISTANT_HEADERS.projectId));
  const domain = toDomain(input.req.headers.get(ASSISTANT_HEADERS.domain));

  if (projectId == null || domain == null) {
    return null;
  }

  const editorHeader = input.req.headers.get(ASSISTANT_HEADERS.editorId);
  const editorId = toEditorId(editorHeader) ?? inferEditorIdFromDomain(domain);
  const viewportId = asString(input.req.headers.get(ASSISTANT_HEADERS.viewportId)) ?? undefined;

  const messages = Array.isArray(input.body.messages) ? input.body.messages : [];
  const latestUserMessage = extractLatestUserMessage(messages);
  if (!latestUserMessage) {
    return null;
  }

  const orchestrator = createAssistantChatOrchestrator({
    payload: input.payloadClient,
    sessionStore: new PayloadSessionStore(input.payloadClient),
  });

  const result = await orchestrator.run({
    metadata: {
      userId: input.userId,
      domain,
      editorId,
      projectId,
      viewportId,
    },
    latestUserMessage,
    selectedModelId: input.resolvedModel,
  });

  return result.systemAddendum;
}

async function legacyStreamPath(input: ResolvedChatRequest) {
  return streamAssistantResponse({
    req: input.req,
    authContext: input.authContext,
    resolvedModel: input.resolvedModel,
    system: input.baseSystem,
    tools: input.tools,
    messages: input.messages,
    callSettings: input.callSettings,
    routeKey: '/api/assistant-chat',
  });
}

async function langGraphPath(input: ResolvedChatRequest) {
  const addendum = await buildLangGraphSystemAddendum({
    req: input.req,
    payloadClient: input.payloadClient,
    userId: input.authContext.userId,
    body: input.body,
    resolvedModel: input.resolvedModel,
  });

  const system =
    addendum && addendum.length > 0
      ? [input.baseSystem, addendum].filter(Boolean).join('\n\n')
      : input.baseSystem;

  return streamAssistantResponse({
    req: input.req,
    authContext: input.authContext,
    resolvedModel: input.resolvedModel,
    system,
    tools: input.tools,
    messages: input.messages,
    callSettings: input.callSettings,
    routeKey: '/api/assistant-chat#langgraph',
  });
}

export async function POST(req: Request) {
  if (!config.apiKey) {
    return new Response(JSON.stringify({ error: 'OpenRouter API key not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const payloadClient = await getPayload({ config: payloadConfig });
  const authContext = await requireAiRequestAuth(payloadClient, req, 'ai.chat');
  if (!authContext) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: ParsedBody;

  try {
    body = (await req.json()) as ParsedBody;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const tools = buildToolSet(body.tools);
  const messages = Array.isArray(body.messages) ? body.messages : [];
  const baseSystem = typeof body.system === 'string' ? body.system : undefined;
  const callSettings = body.callSettings ?? {};
  const selectedModel = await getPersistedModelIdForProvider(req, 'assistantUi');
  const registry = await getOpenRouterModels();
  const resolvedModel = resolveModelIdFromRegistry(selectedModel, registry);
  if (resolvedModel !== selectedModel) {
    log.warn({ selectedModel, resolvedModel }, 'Assistant model fallback applied');
  }
  log.info({ modelId: resolvedModel }, 'Model resolved');

  const resolvedRequest: ResolvedChatRequest = {
    req,
    authContext,
    payloadClient,
    body,
    resolvedModel,
    tools,
    messages,
    callSettings,
    baseSystem,
  };

  if (isLangGraphEnabledServer()) {
    try {
      return await langGraphPath(resolvedRequest);
    } catch (error) {
      log.warn(
        {
          err: error instanceof Error ? error.message : String(error),
        },
        'LangGraph path failed; falling back to legacy assistant stream',
      );
    }
  }

  return legacyStreamPath(resolvedRequest);
}
