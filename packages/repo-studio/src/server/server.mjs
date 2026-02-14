import http from 'node:http';
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

import {
  loadRepoStudioConfig,
  loadRepoStudioLocalOverrides,
  saveRepoStudioLocalOverrides,
} from '../lib/config.mjs';
import { buildAllowedCommands, resolveAllowedCommand } from '../lib/policy.mjs';
import { runCommand } from '../lib/process.mjs';
import { runToolCommand } from '../lib/command-resolver.mjs';
import { getCodexStatus, runCodexExec } from '../lib/codex.mjs';
import {
  ensureRunLogsDir,
  loadActiveRuntimeState,
  readRuntimeState,
  runtimeUrlFor,
  stopRuntime,
  clearRuntimeState,
} from '../lib/runtime-manager.mjs';
import {
  captureEnvDoctor,
  captureForgeLoopProgress,
  collectRunbookDocs,
  collectLoopAnalytics,
} from '../lib/snapshots.mjs';
import { renderLegacyStudioHtml, renderStudioHtml } from './ui.mjs';

const HOST = '127.0.0.1';
const DEFAULT_PORT = 3864;

async function readBody(req) {
  let body = '';
  for await (const chunk of req) {
    body += chunk;
  }
  if (!body.trim()) return {};
  try {
    return JSON.parse(body);
  } catch {
    return {};
  }
}

function json(res, statusCode, payload) {
  res.writeHead(statusCode, { 'content-type': 'application/json' });
  res.end(JSON.stringify(payload, null, 2));
}

function normalizeView(view) {
  const normalized = String(view || 'env').toLowerCase();
  if (normalized === 'forge-loop') return 'planning';
  if (['planning', 'env', 'commands', 'docs', 'loop-assistant', 'codex-assistant', 'diff'].includes(normalized)) {
    return normalized;
  }
  return 'env';
}

function nowIso() {
  return new Date().toISOString();
}

function appendRecentRun(localOverrides, run) {
  const existing = Array.isArray(localOverrides?.recentRuns) ? localOverrides.recentRuns : [];
  const next = [
    {
      ...run,
      timestamp: run.timestamp || nowIso(),
    },
    ...existing,
  ];
  return next.slice(0, 50);
}

async function appendRunLog(run) {
  const dir = await ensureRunLogsDir();
  const safeId = String(run?.id || 'run').replace(/[^a-z0-9_-]/gi, '-').slice(0, 64);
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `${stamp}-${safeId}.json`;
  const filePath = path.join(dir, fileName);
  await fs.writeFile(filePath, `${JSON.stringify(run, null, 2)}\n`, 'utf8');
  return filePath;
}

async function assistantStatusFromConfig(config) {
  const assistant = config?.assistant || {};
  const routeMode = String(assistant.routeMode || 'local');
  const routePath = String(assistant.routePath || '/api/assistant-chat');
  const hasOpenRouterKey = Boolean(String(process.env.OPENROUTER_API_KEY || '').trim());
  const codex = await getCodexStatus(config);
  const enabled = assistant.enabled !== false;

  let ready = enabled;
  let message = 'Assistant route is available.';
  if (!enabled) {
    ready = false;
    message = 'Assistant is disabled in .repo-studio/config.json.';
  } else if (routeMode === 'openrouter' && !hasOpenRouterKey) {
    ready = false;
    message = 'OPENROUTER_API_KEY is missing. Run forge-env doctor --mode headless --strict.';
  } else if (routeMode === 'proxy' && !/^https?:\/\//i.test(routePath)) {
    ready = false;
    message = 'assistant.routePath must be an absolute http(s) URL when routeMode is proxy.';
  } else if (routeMode === 'codex') {
    ready = codex.readiness.ok;
    message = codex.readiness.ok
      ? 'Codex assistant mode is ready.'
      : `Codex is not ready (${codex.readiness.missing.join(', ')}). Run "codex login".`;
  } else if (routeMode === 'local') {
    message = 'Local assistant mode expects RepoStudio app runtime integration.';
  }

  return {
    enabled,
    routeMode,
    routePath,
    defaultModel: String(assistant.defaultModel || 'gpt-5'),
    hasOpenRouterKey,
    codex,
    ready,
    message,
  };
}

function mergeRuntimeConfig(config, localOverrides) {
  const baseDisabled = Array.isArray(config?.commandPolicy?.disabledCommandIds)
    ? config.commandPolicy.disabledCommandIds
    : [];
  const localDisabled = Array.isArray(localOverrides?.commandPolicy?.disabledCommandIds)
    ? localOverrides.commandPolicy.disabledCommandIds
    : [];

  const disabled = [...new Set([...baseDisabled, ...localDisabled])];
  return {
    ...config,
    commandPolicy: {
      ...(config?.commandPolicy || {}),
      disabledCommandIds: disabled,
    },
    localOverrides: localOverrides || {},
  };
}

export async function createStudioModel(options = {}) {
  const baseConfig = await loadRepoStudioConfig();
  const localOverrides = await loadRepoStudioLocalOverrides();
  const config = mergeRuntimeConfig(baseConfig, localOverrides);
  const profile = String(options.profile || 'forge-loop');
  const mode = String(options.mode || 'local');
  const view = normalizeView(options.view || config?.ui?.defaultView || 'env');

  const commands = await buildAllowedCommands(config);
  const envDoctor = captureEnvDoctor({ profile, mode });
  const loop = captureForgeLoopProgress();
  const loopAnalytics = await collectLoopAnalytics(config);
  const docs = await collectRunbookDocs(config);
  const assistant = await assistantStatusFromConfig(config);

  return {
    config,
    profile,
    mode,
    view,
    commands,
    envReport: envDoctor.payload?.report || envDoctor.stdout || envDoctor.stderr,
    loopReport: loop.report || loop.stderr,
    loopPayload: loop.payload || null,
    loopAnalytics,
    docs,
    assistant,
    recentRuns: config?.localOverrides?.recentRuns || [],
    commandView: config?.localOverrides?.commandView || null,
  };
}

export async function runRepoStudioServer(options = {}) {
  const port = Number(options.port || DEFAULT_PORT);
  const defaultProfile = String(options.profile || 'forge-loop');
  const defaultMode = String(options.mode || 'local');
  let commandsCache = [];
  let baseConfig = await loadRepoStudioConfig();
  let localOverrides = await loadRepoStudioLocalOverrides();
  let config = mergeRuntimeConfig(baseConfig, localOverrides);
  commandsCache = await buildAllowedCommands(config);

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);

    if (req.method === 'GET' && url.pathname === '/') {
      const model = await createStudioModel(options);
      res.writeHead(200, { 'content-type': 'text/html' });
      if (options.legacyUi === true) {
        res.end(renderLegacyStudioHtml(model));
      } else {
        res.end(renderStudioHtml(model));
      }
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/env/doctor') {
      const body = await readBody(req);
      const profile = body.profile || defaultProfile;
      const mode = body.mode || defaultMode;
      const result = captureEnvDoctor({ profile, mode });
      json(res, 200, {
        ok: result.ok,
        report: result.payload?.report || result.stdout,
        stderr: result.stderr,
        payload: result.payload,
        attempts: result.attempts || [],
        resolvedAttempt: result.resolvedAttempt || null,
      });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/env/reconcile') {
      const body = await readBody(req);
      const profile = body.profile || defaultProfile;
      const mode = body.mode || defaultMode;
      const result = runToolCommand('forge-env', [
        'reconcile',
        '--profile',
        profile,
        '--mode',
        mode,
        '--write',
        '--sync-examples',
      ]);
      json(res, 200, {
        ok: result.ok,
        command: result.command,
        report: result.stdout,
        stderr: result.stderr,
        attempts: result.attempts || [],
        resolvedAttempt: result.resolvedAttempt || null,
      });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/loop/progress') {
      const result = captureForgeLoopProgress();
      const analytics = await collectLoopAnalytics(config);
      json(res, 200, {
        ok: result.ok,
        report: result.report,
        payload: result.payload || null,
        analytics,
        stderr: result.stderr,
        attempts: result.attempts || [],
        resolvedAttempt: result.resolvedAttempt || null,
      });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/commands/run') {
      const body = await readBody(req);
      const commandId = String(body.commandId || '').trim();
      const confirm = body.confirm === true;
      const requireConfirm = config.commandPolicy?.requireConfirm !== false;
      if (requireConfirm && !confirm) {
        json(res, 400, { ok: false, message: 'Confirmation required before command execution.' });
        return;
      }

      commandsCache = await buildAllowedCommands(config);
      const entry = resolveAllowedCommand(commandsCache, commandId);
      if (!entry) {
        json(res, 404, { ok: false, message: `Unknown command id: ${commandId}` });
        return;
      }
      if (entry.blocked) {
        const reason = entry.blockedBy === 'disabled-id'
          ? 'Command is currently disabled in local overrides.'
          : `Blocked by deny pattern: ${entry.command}`;
        json(res, 400, { ok: false, message: reason });
        return;
      }

      const result = runCommand(entry.command);
      localOverrides = {
        ...(localOverrides || {}),
        recentRuns: appendRecentRun(localOverrides, {
          id: commandId,
          command: result.command,
          ok: result.ok,
          code: result.code,
        }),
      };
      await saveRepoStudioLocalOverrides(localOverrides);
      const runLogPath = await appendRunLog({
        id: commandId,
        source: entry.source,
        command: result.command,
        ok: result.ok,
        code: result.code,
        stdout: result.stdout,
        stderr: result.stderr,
        startedAt: nowIso(),
      }).catch(() => null);

      json(res, 200, {
        ok: result.ok,
        commandId,
        command: result.command,
        stdout: result.stdout,
        stderr: result.stderr,
        code: result.code,
        recentRuns: localOverrides.recentRuns,
        runLogPath,
      });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/commands/toggle') {
      const body = await readBody(req);
      const commandId = String(body.commandId || '').trim();
      const disabled = body.disabled === true;

      if (!commandId) {
        json(res, 400, { ok: false, message: 'commandId is required.' });
        return;
      }

      const current = new Set(
        Array.isArray(localOverrides?.commandPolicy?.disabledCommandIds)
          ? localOverrides.commandPolicy.disabledCommandIds
          : [],
      );

      if (disabled) current.add(commandId);
      else current.delete(commandId);

      localOverrides = {
        ...(localOverrides || {}),
        commandPolicy: {
          ...(localOverrides?.commandPolicy || {}),
          disabledCommandIds: [...current].sort((a, b) => String(a).localeCompare(String(b))),
        },
      };

      await saveRepoStudioLocalOverrides(localOverrides);
      baseConfig = await loadRepoStudioConfig();
      config = mergeRuntimeConfig(baseConfig, localOverrides);
      commandsCache = await buildAllowedCommands(config);

      json(res, 200, {
        ok: true,
        disabled,
        commandId,
        disabledCommandIds: config.commandPolicy.disabledCommandIds,
      });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/commands/view') {
      const body = await readBody(req);
      const commandView = {
        query: String(body.query || ''),
        source: String(body.source || 'all'),
        status: String(body.status || 'all'),
        tab: String(body.tab || 'recommended'),
        sort: String(body.sort || 'id'),
      };

      localOverrides = {
        ...(localOverrides || {}),
        commandView,
      };
      await saveRepoStudioLocalOverrides(localOverrides);
      json(res, 200, { ok: true, commandView });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/assistant/status') {
      const assistant = await assistantStatusFromConfig(config);
      json(res, 200, {
        ok: true,
        assistant,
      });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/runtime/status') {
      const runtime = await loadActiveRuntimeState({ cleanupStale: true });
      json(res, 200, {
        ok: true,
        running: runtime.running,
        state: runtime.state,
        stale: runtime.stale === true,
        url: runtime.state ? runtimeUrlFor(runtime.state) : null,
      });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/runtime/stop') {
      const runtime = await readRuntimeState();
      if (!runtime) {
        json(res, 200, { ok: true, stopped: false, message: 'RepoStudio is not running.' });
        return;
      }

      if (Number(runtime.pid) === process.pid) {
        json(res, 200, {
          ok: true,
          stopped: true,
          message: `Stopping current RepoStudio runtime pid ${runtime.pid}.`,
          state: runtime,
        });
        setTimeout(() => {
          clearRuntimeState().finally(() => process.exit(0));
        }, 80);
        return;
      }

      const result = await stopRuntime();
      json(res, result.ok ? 200 : 500, result);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/assistant/chat') {
      const body = await readBody(req);
      const assistant = await assistantStatusFromConfig(config);
      if (!assistant.enabled) {
        json(res, 400, { ok: false, message: assistant.message });
        return;
      }

      if (assistant.routeMode === 'codex') {
        if (!assistant.ready) {
          json(res, 400, { ok: false, message: assistant.message });
          return;
        }

        const result = await runCodexExec(config, {
          messages: body.messages,
          input: body.input,
          prompt: body.prompt,
        });
        json(res, result.ok ? 200 : 500, {
          ok: result.ok,
          message: result.message || (result.ok ? 'Codex completed.' : 'Codex failed.'),
          code: result.code,
          stderr: result.stderr,
          command: result.command,
        });
        return;
      }

      if (assistant.routeMode === 'openrouter') {
        if (!assistant.hasOpenRouterKey) {
          json(res, 400, { ok: false, message: assistant.message });
          return;
        }

        const input = String(body.input || '').trim();
        const messages = Array.isArray(body.messages)
          ? body.messages
          : [{ role: 'user', content: input }];

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          },
          body: JSON.stringify({
            model: assistant.defaultModel,
            messages,
          }),
        }).catch((error) => ({ ok: false, status: 500, text: async () => String(error?.message || 'Request failed') }));

        const raw = await response.text();
        if (!response.ok) {
          json(res, response.status || 500, {
            ok: false,
            message: raw || 'OpenRouter request failed.',
          });
          return;
        }

        let payload = null;
        try {
          payload = JSON.parse(raw);
        } catch {
          payload = null;
        }

        const text = payload?.choices?.[0]?.message?.content || '';
        json(res, 200, {
          ok: true,
          message: text,
          payload,
        });
        return;
      }

      if (assistant.routeMode === 'proxy') {
        if (!assistant.ready) {
          json(res, 400, { ok: false, message: assistant.message });
          return;
        }

        const response = await fetch(assistant.routePath, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify(body || {}),
        }).catch((error) => ({ ok: false, status: 500, text: async () => String(error?.message || 'Proxy request failed') }));

        const raw = await response.text();
        if (!response.ok) {
          json(res, response.status || 500, { ok: false, message: raw || 'Assistant proxy request failed.' });
          return;
        }

        try {
          json(res, 200, JSON.parse(raw));
        } catch {
          json(res, 200, { ok: true, message: raw });
        }
        return;
      }

      json(res, 501, {
        ok: false,
        message: 'Local assistant mode is available in the Next.js RepoStudio app runtime.',
      });
      return;
    }

    json(res, 404, { ok: false, message: 'Not found' });
  });

  await new Promise((resolve) => server.listen(port, HOST, resolve));
  const url = `http://${HOST}:${port}`;

  if (options.openBrowser !== false) {
    const launcher = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
    spawn(launcher, [url], { shell: process.platform === 'win32', stdio: 'ignore' });
  }

  return { ok: true, url, server };
}
