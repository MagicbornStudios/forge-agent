import fs from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { runRepoStudioCli } from '@/lib/cli-runner';

type RepoStudioConfig = {
  assistant?: {
    enabled?: boolean;
    defaultEditor?: 'loop-assistant' | 'codex-assistant' | string;
    routeMode?: 'codex' | 'local' | 'proxy' | 'openrouter' | string;
    routePath?: string;
    codex?: {
      mode?: 'exec' | 'app-server' | string;
    };
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

function parseBody(rawBody: string) {
  try {
    return rawBody ? JSON.parse(rawBody) : {};
  } catch {
    return {};
  }
}

function editorFromRequest(url: URL, body: any, config: RepoStudioConfig) {
  const queryEditor = String(url.searchParams.get('editor') || '').trim().toLowerCase();
  const bodyEditor = String(body?.editorTarget || '').trim().toLowerCase();
  const configEditor = String(config.assistant?.defaultEditor || 'loop-assistant').trim().toLowerCase();
  const editor = queryEditor || bodyEditor || configEditor;
  if (editor === 'codex-assistant') return 'codex-assistant';
  return 'loop-assistant';
}

function allowExecFallback(url: URL, body: any) {
  if (String(url.searchParams.get('allowExecFallback') || '').toLowerCase() === 'true') return true;
  return body?.allowExecFallback === true;
}

function codexMode(config: RepoStudioConfig) {
  const mode = String(config.assistant?.codex?.mode || 'exec').trim().toLowerCase();
  return mode === 'app-server' ? 'app-server' : 'exec';
}

function codexStatus() {
  const status = runRepoStudioCli(['codex-status', '--json']);
  const payload = status.payload || {};
  return {
    ok: status.ok && payload.ok !== false,
    payload,
    stderr: status.stderr,
  };
}

function codexStart() {
  const started = runRepoStudioCli(['codex-start', '--reuse', '--json']);
  return {
    ok: started.ok && (started.payload?.ok !== false),
    payload: started.payload || {},
    stderr: started.stderr,
  };
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

export async function POST(request: Request) {
  const config = await readRepoStudioConfig();
  const assistantEnabled = config.assistant?.enabled !== false;
  if (!assistantEnabled) {
    return NextResponse.json(
      { error: 'Assistant is disabled in .repo-studio/config.json.' },
      { status: 403 },
    );
  }

  const url = new URL(request.url);
  const routeMode = String(config.assistant?.routeMode || 'local').trim().toLowerCase();
  const rawBody = await request.text();
  const parsedBody = parseBody(rawBody);
  const editorTarget = editorFromRequest(url, parsedBody, config);
  const execFallback = allowExecFallback(url, parsedBody);

  const runCodexPath = () => {
    const status = codexStatus();
    const readiness = status.payload?.readiness || {};
    if (!status.ok || readiness.ok !== true) {
      return NextResponse.json(
        { error: status.payload?.message || 'Codex is not ready. Run `codex login`.' },
        { status: 503 },
      );
    }

    const mode = codexMode(config);
    if (mode === 'app-server') {
      const running = status.payload?.running === true;
      if (!running) {
        const started = codexStart();
        if (!started.ok) {
          return NextResponse.json(
            {
              error: started.payload?.message || 'Failed to start Codex app-server.',
              remediation: 'Run `forge-repo-studio codex-start --reuse` and retry.',
            },
            { status: 503 },
          );
        }
      }

      if (!execFallback) {
        return NextResponse.json(
          {
            ok: false,
            message: 'Codex app-server is ready. Enable exec fallback to run CLI execution for this request.',
            remediation: 'Set allowExecFallback=true in request (or toggle in Codex Assistant panel).',
          },
          { status: 428 },
        );
      }
    }

    const prompt = extractPrompt(parsedBody);
    if (!prompt) {
      return NextResponse.json(
        { error: 'No user prompt found for Codex execution.' },
        { status: 400 },
      );
    }

    const exec = codexExec(prompt);
    if (!exec.ok) {
      return NextResponse.json(
        { error: exec.payload?.message || exec.payload?.stderr || exec.stderr || 'Codex execution failed.' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      editorTarget,
      message: exec.payload?.message || 'Codex completed.',
      output: exec.payload?.message || '',
      mode,
      usedExecFallback: true,
    });
  };

  if (editorTarget === 'codex-assistant') {
    return runCodexPath();
  }

  if (routeMode === 'codex') {
    return runCodexPath();
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

