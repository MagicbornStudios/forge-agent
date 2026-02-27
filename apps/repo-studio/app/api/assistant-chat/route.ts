import { NextResponse } from 'next/server';
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  jsonSchema,
  streamText,
  tool,
  type ToolSet,
} from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

import { companionCorsHeaders, isCompanionRequest } from '@/lib/companion-auth';
import { runRepoStudioCli } from '@/lib/cli-runner';
import { resolveForgeAssistantEndpoint } from '@/lib/forge-assistant-runtime';
import { resolvePlanningMentionContext } from '@/lib/assistant/mention-context';
import { loadRepoStudioSnapshot } from '@/lib/repo-data';
import { resolveRepoRoot } from '@/lib/repo-files';
import { getRepoSettingsSnapshot } from '@/lib/settings/repository';
import {
  legacyAssistantConfigIssues,
  readRepoStudioConfig,
  resolveCodexAssistantRoute,
  type RepoStudioConfig,
} from '@/lib/repo-studio-config';
import {
  getCodexSessionStatus,
  snapshotTurnEvents,
  startCodexTurn,
  subscribeTurnEvents,
  type CodexTurnStreamEvent,
} from '@/lib/codex-session';
import { resolveScopeGuardContext } from '@/lib/scope-guard';

type ToolSchema = {
  description?: string;
  parameters: Record<string, unknown>;
};

type ToolSchemaRecord = Record<string, ToolSchema>;

const OPENROUTER_DEFAULT_MODEL = 'openai/gpt-oss-120b:free';
const OPENROUTER_DEFAULT_BASE_URL = 'https://openrouter.ai/api/v1';
const OPENROUTER_DEFAULT_TIMEOUT_MS = 30000;

const OPENROUTER_HEADERS = {
  'HTTP-Referer': 'https://forge-agent-poc.local',
  'X-Title': 'Forge Repo Studio',
};

function parseTimeout(value: string, fallback: number) {
  const parsed = Number.parseInt(String(value || ''), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function buildOpenRouterConfig() {
  return {
    apiKey: String(process.env.OPENROUTER_API_KEY || '').trim(),
    baseUrl: String(process.env.OPENROUTER_BASE_URL || OPENROUTER_DEFAULT_BASE_URL).trim() || OPENROUTER_DEFAULT_BASE_URL,
    timeoutMs: parseTimeout(String(process.env.OPENROUTER_TIMEOUT_MS || OPENROUTER_DEFAULT_TIMEOUT_MS), OPENROUTER_DEFAULT_TIMEOUT_MS),
  };
}

function buildToolSet(schema: ToolSchemaRecord | undefined | null): ToolSet {
  if (!schema || typeof schema !== 'object') return {};

  const toolSet: ToolSet = {};

  for (const [name, def] of Object.entries(schema)) {
    if (!def || typeof def !== 'object') continue;
    const parameters = (def as ToolSchema).parameters;
    if (!parameters || typeof parameters !== 'object') continue;
    const description = typeof (def as ToolSchema).description === 'string'
      ? (def as ToolSchema).description
      : undefined;
    toolSet[name] = tool({
      description,
      inputSchema: jsonSchema(parameters),
    });
  }

  return toolSet;
}

function parseBody(rawBody: string) {
  try {
    return rawBody ? JSON.parse(rawBody) : {};
  } catch {
    return {};
  }
}

function extractPrompt(body: any) {
  if (typeof body?.input === 'string' && body.input.trim()) return body.input.trim();
  if (typeof body?.prompt === 'string' && body.prompt.trim()) return body.prompt.trim();
  if (Array.isArray(body?.messages)) {
    for (let index = body.messages.length - 1; index >= 0; index -= 1) {
      const message = body.messages[index];
      if (!message || typeof message !== 'object') continue;
      if (String(message.role || '') !== 'user') continue;
      if (typeof message.content === 'string' && message.content.trim()) return message.content.trim();
      if (Array.isArray(message.content)) {
        const text = message.content
          .map((part: any) => (part && typeof part === 'object' && part.type === 'text' ? String(part.text || '') : ''))
          .join(' ')
          .trim();
        if (text) return text;
      }
    }
  }
  return '';
}

function assistantTargetFromRequest(url: URL, body: any, config: RepoStudioConfig) {
  const queryAssistantTarget = String(url.searchParams.get('assistantTarget') || '').trim().toLowerCase();
  const bodyAssistantTarget = String(body?.assistantTarget || '').trim().toLowerCase();
  const configAssistantTarget = String(config.assistant?.defaultTarget || 'forge').trim().toLowerCase();
  const assistantTarget = queryAssistantTarget || bodyAssistantTarget || configAssistantTarget;
  if (assistantTarget === 'codex') return 'codex';
  return 'forge';
}

function codexTransport(config: RepoStudioConfig) {
  const route = resolveCodexAssistantRoute(config);
  return route.transport;
}

function allowExecFallback(url: URL, body: any, config: RepoStudioConfig) {
  if (String(url.searchParams.get('allowExecFallback') || '').toLowerCase() === 'true') return true;
  if (body?.allowExecFallback === true) return true;
  const route = resolveCodexAssistantRoute(config);
  return route.execFallbackAllowed === true;
}

function codexExec(prompt: string, model?: string) {
  const args = ['codex-exec', '--prompt', prompt, '--json'];
  if (model) {
    args.push('--model', model);
  }
  const exec = runRepoStudioCli(args);
  const payload = exec.payload || {};
  return {
    ok: exec.ok && payload.ok !== false,
    payload,
    stderr: exec.stderr,
  };
}

function normalizeLoopId(value: unknown) {
  const normalized = String(value || '').trim().toLowerCase();
  return normalized || 'default';
}

function normalizeRequestedModel(value: unknown) {
  const model = String(value || '').trim();
  return model || '';
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, fallback: T): Promise<T> {
  let timer: NodeJS.Timeout | null = null;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((resolve) => {
        timer = setTimeout(() => resolve(fallback), timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function assistantPromptKey(assistantTarget: 'forge' | 'codex') {
  return assistantTarget === 'codex' ? 'codexAssistant' : 'forgeAssistant';
}

async function resolveAssistantSystemPrompt(input: {
  assistantTarget: 'forge' | 'codex';
  workspaceId?: string;
  loopId: string;
}) {
  try {
    const snapshot = await getRepoSettingsSnapshot({
      workspaceId: String(input.workspaceId || 'planning'),
      loopId: input.loopId,
    });
    const merged = (snapshot?.merged && typeof snapshot.merged === 'object')
      ? snapshot.merged as Record<string, any>
      : {};
    const prompts = merged.assistant?.prompts && typeof merged.assistant.prompts === 'object'
      ? merged.assistant.prompts as Record<string, any>
      : {};
    const byLoop = prompts.byLoop && typeof prompts.byLoop === 'object'
      ? prompts.byLoop as Record<string, any>
      : {};
    const promptKey = assistantPromptKey(input.assistantTarget);
    const byLoopPrompt = String(byLoop?.[input.loopId]?.[promptKey] || '').trim();
    if (byLoopPrompt) return byLoopPrompt;
    const fallbackPrompt = String(prompts?.[promptKey] || '').trim();
    return fallbackPrompt || '';
  } catch {
    return '';
  }
}

function updateLatestUserMessage(messages: any[], text: string) {
  const next = Array.isArray(messages) ? [...messages] : [];
  for (let index = next.length - 1; index >= 0; index -= 1) {
    const message = next[index];
    if (!message || typeof message !== 'object') continue;
    if (String(message.role || '') !== 'user') continue;
    if (typeof message.content === 'string') {
      next[index] = { ...message, content: text };
      return next;
    }
    if (Array.isArray(message.content)) {
      const content = [...message.content];
      const textIndex = content.findIndex((part) => part?.type === 'text');
      if (textIndex >= 0) {
        content[textIndex] = { ...content[textIndex], text };
      } else {
        content.push({ type: 'text', text });
      }
      next[index] = { ...message, content };
      return next;
    }
    next[index] = { ...message, content: text };
    return next;
  }
  return next.length > 0
    ? [...next, { role: 'user', content: text }]
    : [{ role: 'user', content: text }];
}

function buildEnrichedPrompt(input: {
  userPrompt: string;
  systemPrompt: string;
  planningContext: string;
  mentionContext: string;
}) {
  const basePrompt = String(input.userPrompt || '').trim();
  if (!basePrompt) return '';
  const systemPrompt = String(input.systemPrompt || '').trim();
  const planningContext = String(input.planningContext || '').trim();
  const mentionContext = String(input.mentionContext || '').trim();
  if (!systemPrompt && !planningContext && !mentionContext) return basePrompt;
  const parts: string[] = [];
  if (systemPrompt) {
    parts.push('## Assistant System Prompt');
    parts.push(systemPrompt);
  }
  if (planningContext) {
    parts.push(planningContext);
  }
  if (mentionContext) {
    parts.push(mentionContext);
  }
  parts.push('## User Prompt');
  parts.push(basePrompt);
  return parts.join('\n\n');
}

async function buildAssistantRequestContext(input: {
  body: any;
  assistantTarget: 'forge' | 'codex';
}) {
  const loopId = normalizeLoopId(input.body?.loopId);
  const userPrompt = extractPrompt(input.body);
  const systemPrompt = await withTimeout(
    resolveAssistantSystemPrompt({
      assistantTarget: input.assistantTarget,
      workspaceId: String(input.body?.workspaceId || 'planning'),
      loopId,
    }),
    3000,
    '',
  );
  const planningContext = await withTimeout((async () => {
    try {
      const snapshot = await loadRepoStudioSnapshot(resolveRepoRoot(), { loopId });
      const openTasks = Number(snapshot.planning.openTaskCount || 0);
      const completeTasks = Number(snapshot.planning.completeTaskCount || 0);
      const decisionOpen = Number(snapshot.planning.decisionOpen || 0);
      const errorOpen = Number(snapshot.planning.errorOpen || 0);
      const prdText = String(snapshot.planning.prdContent || '').trim();
      const prdSummary = prdText
        ? prdText.split('\n').map((line) => line.trim()).filter(Boolean).slice(0, 3).join(' | ').slice(0, 320)
        : 'PRD missing at .planning/PRD.md';
      return [
        '## Loop Context',
        `Loop ID: ${snapshot.planning.loopId}`,
        `Planning Root: ${snapshot.planning.planningRoot}`,
        `Next Action: ${snapshot.planning.nextAction || '-'}`,
        `Progress: ${snapshot.planning.percent}%`,
        `Tasks: ${openTasks} open / ${completeTasks} complete`,
        `Decisions Open: ${decisionOpen}`,
        `Regression Open: ${errorOpen}`,
        `PRD Summary: ${prdSummary}`,
      ].join('\n');
    } catch {
      return '';
    }
  })(), 3000, '');

  let mentionContext = '';
  if (userPrompt.includes('@planning/')) {
    mentionContext = await withTimeout((async () => {
      try {
        const snapshot = await loadRepoStudioSnapshot(resolveRepoRoot(), { loopId });
        return resolvePlanningMentionContext({
          text: userPrompt,
          docs: snapshot.planning.docs,
        }).contextBlock;
      } catch {
        return '';
      }
    })(), 3000, '');
  }

  const enrichedPrompt = buildEnrichedPrompt({
    userPrompt,
    systemPrompt,
    planningContext,
    mentionContext,
  });

  const body = enrichedPrompt
    ? {
        ...input.body,
        input: enrichedPrompt,
        prompt: enrichedPrompt,
        messages: updateLatestUserMessage(input.body?.messages, enrichedPrompt),
      }
    : input.body;

  return {
    body,
    loopId,
    prompt: enrichedPrompt || userPrompt,
  };
}

function streamFromCodexTurn(turnId: string, assistantTarget: string) {
  const partId = `codex-${turnId}`;

  return createUIMessageStream({
    execute: async ({ writer }) => {
      writer.write({
        type: 'start',
        messageMetadata: {
          assistantTarget,
          turnId,
        },
      });
      writer.write({ type: 'text-start', id: partId });

      let finished = false;
      let finishReason: 'stop' | 'error' = 'stop';

      const forward = (event: CodexTurnStreamEvent) => {
        if (event.type === 'text-delta') {
          writer.write({
            type: 'text-delta',
            id: partId,
            delta: event.delta,
          });
          return;
        }

        if (event.type === 'approval-request') {
          writer.write({
            type: 'data-repo-proposal',
            data: {
              turnId: event.turnId,
              proposal: event.proposal,
              approvalToken: event.approvalToken,
            },
            transient: true,
          });
          return;
        }

        if (event.type === 'finished') {
          finished = true;
          finishReason = event.status === 'failed' ? 'error' : 'stop';
        }
      };

      for (const existing of snapshotTurnEvents(turnId)) {
        forward(existing);
      }

      if (!finished) {
        await new Promise<void>((resolve) => {
          const unsubscribe = subscribeTurnEvents(turnId, (event) => {
            forward(event);
            if (event.type === 'finished') {
              unsubscribe?.();
              resolve();
            }
          });
          if (!unsubscribe) resolve();
        });
      }

      writer.write({ type: 'text-end', id: partId });
      writer.write({
        type: 'finish',
        finishReason,
        messageMetadata: {
          assistantTarget,
          turnId,
        },
      });
    },
  });
}

function streamFromExecResult(input: {
  message: string;
  assistantTarget: string;
  mode: string;
  usedExecFallback: boolean;
}) {
  const partId = `codex-exec-${Date.now()}`;
  return createUIMessageStream({
    execute: ({ writer }) => {
      writer.write({
        type: 'start',
        messageMetadata: {
          assistantTarget: input.assistantTarget,
          mode: input.mode,
          usedExecFallback: input.usedExecFallback,
        },
      });
      writer.write({ type: 'text-start', id: partId });
      writer.write({
        type: 'text-delta',
        id: partId,
        delta: input.message,
      });
      writer.write({ type: 'text-end', id: partId });
      writer.write({
        type: 'finish',
        finishReason: 'stop',
        messageMetadata: {
          assistantTarget: input.assistantTarget,
          mode: input.mode,
          usedExecFallback: input.usedExecFallback,
        },
      });
    },
  });
}

async function runCodexPath(input: {
  config: RepoStudioConfig;
  url: URL;
  body: any;
  assistantTarget: string;
  prompt: string;
  loopId: string;
  model?: string;
}) {
  const prompt = String(input.prompt || '').trim();
  if (!prompt) {
    return NextResponse.json({ error: 'No user prompt found for Codex execution.' }, { status: 400 });
  }

  const transport = codexTransport(input.config);
  const execFallback = allowExecFallback(input.url, input.body, input.config);

  if (transport === 'app-server') {
    const status = await getCodexSessionStatus();
    if (status.ok !== true) {
      return NextResponse.json(
        {
          error: 'Codex is not ready. Run `codex login` and `forge-repo-studio codex-status`.',
          readiness: status.readiness,
        },
        { status: 503 },
      );
    }

    const turn = await startCodexTurn({
      prompt,
      messages: input.body?.messages,
      loopId: input.loopId,
      assistantTarget: input.assistantTarget,
      model: normalizeRequestedModel(input.model),
      domain: String(input.body?.domain || '').trim().toLowerCase(),
      scopeOverrideToken: String(input.body?.scopeOverrideToken || '').trim(),
      scopeRoots: (await resolveScopeGuardContext({
        domain: String(input.body?.domain || '').trim().toLowerCase(),
        loopId: input.loopId,
        overrideToken: String(input.body?.scopeOverrideToken || '').trim(),
      })).allowedRoots,
    });

    if (turn.ok) {
      const stream = streamFromCodexTurn(String(turn.turnId), input.assistantTarget);
      return createUIMessageStreamResponse({ stream });
    }

    if (!execFallback) {
      return NextResponse.json(
        {
          ok: false,
          error: turn.message || 'Failed to start Codex app-server turn.',
          remediation: 'Enable exec fallback for this request or fix Codex app-server session.',
        },
        { status: 503 },
      );
    }
  }

  const exec = codexExec(prompt, normalizeRequestedModel(input.model));
  if (!exec.ok) {
    return NextResponse.json(
      {
        error: exec.payload?.message || exec.payload?.stderr || exec.stderr || 'Codex execution failed.',
      },
      { status: 500 },
    );
  }

  const stream = streamFromExecResult({
    message: String(exec.payload?.message || 'Codex completed.'),
    assistantTarget: input.assistantTarget,
    mode: transport,
    usedExecFallback: true,
  });
  return createUIMessageStreamResponse({ stream });
}

async function runForgeOpenRouterPath(input: {
  request: Request;
  body: any;
  requestedModel: string;
}) {
  const openRouter = buildOpenRouterConfig();
  if (!openRouter.apiKey) {
    return NextResponse.json(
      {
        ok: false,
        code: 'FORGE_OPENROUTER_UNAVAILABLE',
        error: 'Forge OpenRouter runtime unavailable: OPENROUTER_API_KEY is not configured.',
      },
      { status: 503 },
    );
  }

  const tools = buildToolSet((input.body?.tools || undefined) as ToolSchemaRecord | undefined);
  const fallbackPrompt = extractPrompt(input.body);
  const messages = Array.isArray(input.body?.messages) ? input.body.messages : [];
  const resolvedMessages = messages.length > 0
    ? messages
    : (fallbackPrompt ? [{ role: 'user', content: fallbackPrompt }] : []);
  if (resolvedMessages.length === 0) {
    return NextResponse.json(
      { ok: false, error: 'No user prompt found for Forge execution.' },
      { status: 400 },
    );
  }
  const callSettings = input.body?.callSettings && typeof input.body.callSettings === 'object'
    ? input.body.callSettings as Record<string, unknown>
    : {};
  const systemPrompt = typeof input.body?.system === 'string' ? input.body.system : undefined;
  const resolvedModel = String(input.requestedModel || OPENROUTER_DEFAULT_MODEL).trim() || OPENROUTER_DEFAULT_MODEL;

  const aiMessages = await convertToModelMessages(resolvedMessages as any, {
    tools,
    ignoreIncompleteToolCalls: true,
  });

  const openai = createOpenAI({
    apiKey: openRouter.apiKey,
    baseURL: openRouter.baseUrl,
    headers: OPENROUTER_HEADERS,
  });

  const maxTokensValue =
    typeof callSettings.maxTokens === 'number'
      ? callSettings.maxTokens
      : typeof callSettings.maxOutputTokens === 'number'
        ? callSettings.maxOutputTokens
        : undefined;

  const streamResult = streamText({
    model: openai.chat(resolvedModel),
    messages: aiMessages,
    ...(systemPrompt ? { system: systemPrompt } : {}),
    ...(Object.keys(tools).length > 0 ? { tools } : {}),
    ...(typeof callSettings.temperature === 'number' ? { temperature: callSettings.temperature } : {}),
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
      ...OPENROUTER_HEADERS,
      ...(callSettings.headers && typeof callSettings.headers === 'object'
        ? callSettings.headers as Record<string, string | undefined>
        : {}),
    },
    abortSignal: AbortSignal.timeout(openRouter.timeoutMs),
  });

  return streamResult.toUIMessageStreamResponse();
}

function applyCompanionCors(request: Request, response: Response): Response {
  const headers = companionCorsHeaders(request, 'POST, OPTIONS');
  if (Object.keys(headers).length === 0) return response;
  const merged = new Headers(response.headers);
  for (const [key, value] of Object.entries(headers)) {
    merged.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: merged,
  });
}

export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 204,
    headers: companionCorsHeaders(request, 'POST, OPTIONS'),
  });
}

async function handlePost(request: Request) {
  const config = await readRepoStudioConfig();
  const assistantEnabled = config.assistant?.enabled !== false;
  // When Open Router path runs here, use isCompanionRequest(request) to skip Payload user auth for companion apps.
  void isCompanionRequest(request);
  if (!assistantEnabled) {
    return NextResponse.json(
      { error: 'Assistant is disabled in .repo-studio/config.json.' },
      { status: 403 },
    );
  }
  const legacyConfigIssues = legacyAssistantConfigIssues(config);
  if (legacyConfigIssues.length > 0) {
    return NextResponse.json(
      {
        error: 'Legacy assistant config keys detected. Update .repo-studio/config.json to forge/codex canonical keys.',
        issues: legacyConfigIssues,
      },
      { status: 400 },
    );
  }

  const url = new URL(request.url);
  const rawBody = await request.text();
  const parsedBody = parseBody(rawBody);
  const assistantTarget = assistantTargetFromRequest(url, parsedBody, config);
  const requestedModel = normalizeRequestedModel(
    url.searchParams.get('model') || parsedBody?.model,
  );
  const requestContext = await buildAssistantRequestContext({
    body: parsedBody,
    assistantTarget,
  });
  const requestBody = requestedModel
    ? { ...requestContext.body, model: requestedModel }
    : requestContext.body;

  if (assistantTarget === 'codex') {
    return runCodexPath({
      config,
      url,
      body: requestBody,
      assistantTarget: 'codex',
      prompt: requestContext.prompt,
      loopId: requestContext.loopId,
      model: requestedModel,
    });
  }

  const forgeRoute = resolveForgeAssistantEndpoint(config);
  if (!forgeRoute.ok) {
    return NextResponse.json(
      {
        error: forgeRoute.message,
        routeMode: forgeRoute.mode,
      },
      { status: 501 },
    );
  }

  if (!forgeRoute.endpoint) {
    return runForgeOpenRouterPath({
      request,
      body: requestBody,
      requestedModel,
    });
  }

  const upstream = await fetch(forgeRoute.endpoint, {
    method: 'POST',
    headers: {
      'content-type': request.headers.get('content-type') || 'application/json',
      accept: request.headers.get('accept') || '*/*',
    },
    body: JSON.stringify(requestBody),
    signal: AbortSignal.timeout(45000),
  });

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      'content-type': upstream.headers.get('content-type') || 'application/json',
    },
  });
}

export async function POST(request: Request) {
  try {
    const response = await withTimeout<Response>(
      handlePost(request),
      45000,
      NextResponse.json(
        { error: 'Assistant request timed out before a response was produced.' },
        { status: 504 },
      ),
    );
    return applyCompanionCors(request, response);
  } catch (error) {
    return applyCompanionCors(
      request,
      NextResponse.json(
        {
          error: 'Assistant request failed.',
          message: String((error as Error)?.message || error || 'Unknown error'),
        },
        { status: 500 },
      ),
    );
  }
}

