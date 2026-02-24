import { NextResponse } from 'next/server';
import { createUIMessageStream, createUIMessageStreamResponse } from 'ai';

import { companionCorsHeaders, isCompanionRequest } from '@/lib/companion-auth';
import { runRepoStudioCli } from '@/lib/cli-runner';
import { runLocalLoopAssistant } from '@/lib/loop-assistant-chat';
import { resolveLoopAssistantEndpoint } from '@/lib/loop-assistant-runtime';
import { resolvePlanningMentionContext } from '@/lib/assistant/mention-context';
import { loadRepoStudioSnapshot } from '@/lib/repo-data';
import { resolveRepoRoot } from '@/lib/repo-files';
import { getRepoSettingsSnapshot } from '@/lib/settings/repository';
import {
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
  const configAssistantTarget = String(config.assistant?.defaultEditor || 'loop-assistant').trim().toLowerCase();
  const assistantTarget = queryAssistantTarget || bodyAssistantTarget || configAssistantTarget;
  if (assistantTarget === 'codex-assistant') return 'codex-assistant';
  return 'loop-assistant';
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

function codexExec(prompt: string) {
  const exec = runRepoStudioCli(['codex-exec', '--prompt', prompt, '--json']);
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

function assistantPromptKey(assistantTarget: 'loop-assistant' | 'codex-assistant') {
  return assistantTarget === 'codex-assistant' ? 'codexAssistant' : 'loopAssistant';
}

async function resolveAssistantSystemPrompt(input: {
  assistantTarget: 'loop-assistant' | 'codex-assistant';
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
  mentionContext: string;
}) {
  const basePrompt = String(input.userPrompt || '').trim();
  if (!basePrompt) return '';
  const systemPrompt = String(input.systemPrompt || '').trim();
  const mentionContext = String(input.mentionContext || '').trim();
  if (!systemPrompt && !mentionContext) return basePrompt;
  const parts: string[] = [];
  if (systemPrompt) {
    parts.push('## Assistant System Prompt');
    parts.push(systemPrompt);
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
  assistantTarget: 'loop-assistant' | 'codex-assistant';
}) {
  const loopId = normalizeLoopId(input.body?.loopId);
  const userPrompt = extractPrompt(input.body);
  const systemPrompt = await resolveAssistantSystemPrompt({
    assistantTarget: input.assistantTarget,
    workspaceId: String(input.body?.workspaceId || 'planning'),
    loopId,
  });

  let mentionContext = '';
  if (userPrompt.includes('@planning/')) {
    try {
      const snapshot = await loadRepoStudioSnapshot(resolveRepoRoot(), { loopId });
      mentionContext = resolvePlanningMentionContext({
        text: userPrompt,
        docs: snapshot.planning.docs,
      }).contextBlock;
    } catch {
      mentionContext = '';
    }
  }

  const enrichedPrompt = buildEnrichedPrompt({
    userPrompt,
    systemPrompt,
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

  const exec = codexExec(prompt);
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

  const url = new URL(request.url);
  const rawBody = await request.text();
  const parsedBody = parseBody(rawBody);
  const assistantTarget = assistantTargetFromRequest(url, parsedBody, config);
  const requestContext = await buildAssistantRequestContext({
    body: parsedBody,
    assistantTarget,
  });
  const requestBody = requestContext.body;

  if (assistantTarget === 'codex-assistant') {
    return runCodexPath({
      config,
      url,
      body: requestBody,
      assistantTarget: 'codex-assistant',
      prompt: requestContext.prompt,
      loopId: requestContext.loopId,
    });
  }

  const loopRoute = resolveLoopAssistantEndpoint(config);
  if (!loopRoute.ok) {
    return NextResponse.json(
      {
        error: loopRoute.message,
        routeMode: loopRoute.mode,
      },
      { status: 501 },
    );
  }

  if (loopRoute.local === true || !loopRoute.endpoint) {
    return runLocalLoopAssistant({
      body: requestBody,
      assistantTarget: 'loop-assistant',
    });
  }

  const upstream = await fetch(loopRoute.endpoint, {
    method: 'POST',
    headers: {
      'content-type': request.headers.get('content-type') || 'application/json',
      accept: request.headers.get('accept') || '*/*',
    },
    body: JSON.stringify(requestBody),
  });

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      'content-type': upstream.headers.get('content-type') || 'application/json',
    },
  });
}

export async function POST(request: Request) {
  const response = await handlePost(request);
  return applyCompanionCors(request, response);
}

