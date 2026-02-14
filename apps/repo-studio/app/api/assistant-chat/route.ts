import fs from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { runRepoStudioCli } from '@/lib/cli-runner';

type RepoStudioConfig = {
  assistant?: {
    enabled?: boolean;
    routeMode?: 'codex' | 'local' | 'proxy' | 'openrouter' | string;
    routePath?: string;
  };
};

const ENV_PROXY_KEYS = [
  'REPOSTUDIO_ASSISTANT_PROXY_URL',
  'ASSISTANT_CHAT_PROXY_URL',
  'OPENROUTER_ASSISTANT_PROXY_URL',
];

function resolveRepoRoot() {
  return path.resolve(process.cwd(), '..', '..');
}

async function readRepoStudioConfig(): Promise<RepoStudioConfig> {
  const configPath = path.join(resolveRepoRoot(), '.repo-studio', 'config.json');
  try {
    const raw = await fs.readFile(configPath, 'utf8');
    return JSON.parse(raw) as RepoStudioConfig;
  } catch {
    return {};
  }
}

function firstEnvProxyUrl() {
  for (const key of ENV_PROXY_KEYS) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return '';
}

function resolveProxyUrl(config: RepoStudioConfig) {
  const assistant = config.assistant || {};
  const routePath = String(assistant.routePath || '').trim();
  const routeMode = String(assistant.routeMode || 'local');
  const envFallback = firstEnvProxyUrl();

  if (routeMode === 'proxy' || routeMode === 'openrouter') {
    if (/^https?:\/\//i.test(routePath)) return routePath;
    if (envFallback) return envFallback;
    return '';
  }

  // local mode still proxies to existing assistant backend for this phase.
  if (/^https?:\/\//i.test(routePath)) return routePath;
  return envFallback;
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

export async function POST(request: Request) {
  const config = await readRepoStudioConfig();
  const assistantEnabled = config.assistant?.enabled !== false;
  if (!assistantEnabled) {
    return NextResponse.json(
      { error: 'Assistant is disabled in .repo-studio/config.json.' },
      { status: 403 },
    );
  }

  const assistant = config.assistant || {};
  const routeMode = String(assistant.routeMode || 'local').trim().toLowerCase();
  const rawBody = await request.text();
  let parsedBody: any = {};
  try {
    parsedBody = rawBody ? JSON.parse(rawBody) : {};
  } catch {
    parsedBody = {};
  }

  if (routeMode === 'codex') {
    const status = runRepoStudioCli(['codex-status', '--json']);
    const statusPayload = status.payload || {};
    const readiness = statusPayload.readiness || {};
    if (!status.ok || statusPayload.ok === false || readiness.ok !== true) {
      return NextResponse.json(
        { error: statusPayload.message || 'Codex is not ready. Run `codex login`.' },
        { status: 503 },
      );
    }

    const prompt = extractPrompt(parsedBody);
    if (!prompt) {
      return NextResponse.json(
        { error: 'No user prompt found for Codex execution.' },
        { status: 400 },
      );
    }

    const exec = runRepoStudioCli(['codex-exec', '--prompt', prompt, '--json']);
    const execPayload = exec.payload || {};
    if (!exec.ok || execPayload.ok === false) {
      return NextResponse.json(
        { error: execPayload.message || execPayload.stderr || exec.stderr || 'Codex execution failed.' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      message: execPayload.message || 'Codex completed.',
      output: execPayload.message || '',
    });
  }

  const proxyUrl = resolveProxyUrl(config);
  if (!proxyUrl) {
    return NextResponse.json(
      {
        error: `Assistant route is not configured. Set assistant.routePath (absolute URL) or one of ${ENV_PROXY_KEYS.join(', ')}.`,
      },
      { status: 501 },
    );
  }

  const upstream = await fetch(proxyUrl, {
    method: 'POST',
    headers: {
      'content-type': request.headers.get('content-type') || 'application/json',
      accept: request.headers.get('accept') || '*/*',
    },
    body: rawBody,
  });

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      'content-type': upstream.headers.get('content-type') || 'application/json',
    },
  });
}
