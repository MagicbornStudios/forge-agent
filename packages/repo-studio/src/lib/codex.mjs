import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { spawn, spawnSync } from 'node:child_process';

import { readJson, writeJson } from './io.mjs';
import { isProcessAlive } from './runtime-manager.mjs';

const DEFAULT_CODEX_WS_URL = 'ws://127.0.0.1:3789';
const DEFAULT_CODEX_COMMAND = 'codex';
const CODEX_RUNTIME_PATH = path.join(process.cwd(), '.repo-studio', 'codex-runtime.json');

const requireForCodex = createRequire(import.meta.url);

function normalizeWhitespace(value) {
  return String(value || '').replace(/\r\n/g, '\n').trim();
}

function parseCodexVersion(output) {
  const text = normalizeWhitespace(output);
  const match = /codex(?:-cli)?\s+([^\s]+)/i.exec(text);
  return match ? match[1] : null;
}

function runCodexSync(command, args, options = {}) {
  const commandText = String(command || '');
  const forceShell = process.platform === 'win32' && /\\.(cmd|bat)$/i.test(commandText);
  const result = spawnSync(command, args, {
    cwd: options.cwd || process.cwd(),
    encoding: 'utf8',
    shell: options.shell === true || forceShell,
    timeout: options.timeoutMs || 120000,
  });
  const stdout = String(result.stdout || '');
  const stderr = String(result.stderr || '');
  const errorMessage = result.error instanceof Error ? result.error.message : '';
  return {
    ok: (result.status ?? 1) === 0,
    code: result.status ?? 1,
    command: [command, ...args].join(' ').trim(),
    stdout,
    stderr: [stderr, errorMessage].filter(Boolean).join('\n').trim(),
    spawnFailed: Boolean(result.error),
  };
}

function runCodexInvocationSync(invocation, args, options = {}) {
  const mergedArgs = [...(invocation?.args || []), ...args];
  return runCodexSync(invocation.command, mergedArgs, options);
}

function parseCodexLoginStatus(output) {
  const text = normalizeWhitespace(output);
  if (!text) {
    return {
      loggedIn: false,
      authType: 'none',
      raw: text,
    };
  }

  if (/logged in using chatgpt/i.test(text)) {
    return {
      loggedIn: true,
      authType: 'chatgpt',
      raw: text,
    };
  }

  if (/logged in/i.test(text)) {
    return {
      loggedIn: true,
      authType: 'other',
      raw: text,
    };
  }

  if (/not logged in/i.test(text)) {
    return {
      loggedIn: false,
      authType: 'none',
      raw: text,
    };
  }

  return {
    loggedIn: false,
    authType: 'unknown',
    raw: text,
  };
}

function normalizeCodexMode(value) {
  return value === 'app-server' ? 'app-server' : 'exec';
}

function normalizeApprovalMode(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'never' || normalized === 'untrusted') return normalized;
  return 'on-request';
}

function normalizeSandboxMode(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'danger-full-access' || normalized === 'read-only') return normalized;
  return 'workspace-write';
}

export function resolveCodexConfig(config = {}) {
  const assistant = config?.assistant || {};
  const codex = assistant?.codex || {};
  return {
    enabled: codex.enabled !== false,
    cliCommand: String(codex.cliCommand || DEFAULT_CODEX_COMMAND).trim() || DEFAULT_CODEX_COMMAND,
    authPolicy: String(codex.authPolicy || 'chatgpt-strict').trim() || 'chatgpt-strict',
    mode: normalizeCodexMode(codex.mode),
    appServerUrl: String(codex.appServerUrl || DEFAULT_CODEX_WS_URL).trim() || DEFAULT_CODEX_WS_URL,
    defaultModel: String(codex.defaultModel || assistant.defaultModel || 'gpt-5').trim() || 'gpt-5',
    approvalMode: normalizeApprovalMode(codex.approvalMode),
    sandboxMode: normalizeSandboxMode(codex.sandboxMode),
  };
}

function resolveBundledCodexScript(options = {}) {
  if (typeof options.resolveBundledScript === 'function') {
    try {
      return options.resolveBundledScript();
    } catch {
      return null;
    }
  }

  try {
    return requireForCodex.resolve('@openai/codex/bin/codex.js');
  } catch {
    return null;
  }
}

function normalizeExplicitInvocation(value) {
  if (!value || typeof value !== 'object') return null;
  const record = value;
  const command = String(record.command || '').trim();
  if (!command) return null;
  const args = Array.isArray(record.args)
    ? record.args.map((item) => String(item || '').trim()).filter(Boolean)
    : [];
  const source = String(record.source || '').trim() || 'configured';
  const display = String(record.display || '').trim() || [command, ...args].join(' ');
  return {
    command,
    args,
    source,
    display,
    bundleMissing: record.bundleMissing === true,
  };
}

function invocationReport(invocation) {
  return {
    command: invocation.command,
    args: [...(invocation.args || [])],
    source: invocation.source,
    display: invocation.display,
    bundleMissing: invocation.bundleMissing === true,
  };
}

export function resolveCodexInvocation(codexConfig = {}, options = {}) {
  const configuredCommand = String(codexConfig.cliCommand || DEFAULT_CODEX_COMMAND).trim() || DEFAULT_CODEX_COMMAND;
  const bundledScript = resolveBundledCodexScript(options);
  const defaultCommand = configuredCommand === DEFAULT_CODEX_COMMAND;

  if (defaultCommand && bundledScript) {
    const nodeCommand = String(options.nodeCommand || process.execPath).trim() || process.execPath;
    return {
      command: nodeCommand,
      args: [bundledScript],
      source: 'bundled',
      display: [nodeCommand, bundledScript].join(' '),
      configuredCommand,
      bundledScript,
      bundleMissing: false,
    };
  }

  return {
    command: configuredCommand,
    args: [],
    source: 'configured',
    display: configuredCommand,
    configuredCommand,
    bundledScript,
    bundleMissing: defaultCommand && !bundledScript,
  };
}

export function getCodexCliStatus(codexConfig = {}, options = {}) {
  const invocation = normalizeExplicitInvocation(options.invocation) || resolveCodexInvocation(codexConfig);
  const versionResult = runCodexInvocationSync(invocation, ['--version']);
  const version = parseCodexVersion(versionResult.stdout || versionResult.stderr);
  const installed = versionResult.ok;
  const warnings = [];

  if (invocation.bundleMissing) {
    warnings.push('Bundled Codex package (@openai/codex) was not resolved; falling back to configured command.');
  }

  return {
    installed,
    version,
    source: invocation.source,
    invocation: invocationReport(invocation),
    warnings,
    remediation: invocation.bundleMissing
      ? 'Run `pnpm install` to restore bundled Codex CLI resolution.'
      : null,
    details: versionResult,
  };
}

export function getCodexLoginStatus(codexConfig = {}, options = {}) {
  const invocation = normalizeExplicitInvocation(options.invocation) || resolveCodexInvocation(codexConfig);
  const loginResult = runCodexInvocationSync(invocation, ['login', 'status']);
  const parsed = parseCodexLoginStatus(`${loginResult.stdout}\n${loginResult.stderr}`);
  return {
    ...parsed,
    ok: loginResult.ok,
    source: invocation.source,
    invocation: invocationReport(invocation),
    details: loginResult,
  };
}

export function evaluateCodexReadiness(config = {}, options = {}) {
  const codex = resolveCodexConfig(config);
  const invocation = normalizeExplicitInvocation(options.invocation);
  const cli = getCodexCliStatus(codex, { invocation });
  const login = cli.installed ? getCodexLoginStatus(codex, { invocation }) : null;
  const requiresChatgpt = codex.authPolicy === 'chatgpt-strict';
  const requireLogin = options.requireLogin !== false;

  const missing = [];
  if (!codex.enabled) missing.push('codex_disabled');
  if (!cli.installed) missing.push('codex_cli_installed');
  if (codex.enabled && requiresChatgpt && requireLogin) {
    if (!login?.loggedIn || login.authType !== 'chatgpt') {
      missing.push('codex_chatgpt_login');
    }
  }

  const warnings = [];
  if (login?.loggedIn && login.authType !== 'chatgpt') {
    warnings.push('Codex is logged in, but auth is not ChatGPT. chatgpt-strict requires ChatGPT login.');
  }
  if (codex.enabled && requiresChatgpt && !requireLogin && (!login?.loggedIn || login.authType !== 'chatgpt')) {
    warnings.push('Codex login is missing or non-ChatGPT. Doctor is running in non-strict login mode.');
  }
  if (cli.invocation.bundleMissing) {
    warnings.push('Bundled Codex package was not resolved. Install workspace dependencies to restore onboard Codex.');
  }

  const ok = codex.enabled && missing.length === 0;
  return {
    ok,
    codex,
    cli,
    login,
    missing,
    warnings,
    requireLogin,
  };
}

async function readCodexRuntime() {
  return readJson(CODEX_RUNTIME_PATH, null);
}

async function writeCodexRuntime(state) {
  await writeJson(CODEX_RUNTIME_PATH, state);
  return state;
}

export async function clearCodexRuntime() {
  try {
    await fs.unlink(CODEX_RUNTIME_PATH);
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') return;
    throw error;
  }
}

function wsUrlFromPort(port) {
  const numeric = Number(port || 0);
  if (!Number.isInteger(numeric) || numeric <= 0) return DEFAULT_CODEX_WS_URL;
  return `ws://127.0.0.1:${numeric}`;
}

function portFromWsUrl(wsUrl) {
  try {
    const parsed = new URL(wsUrl);
    const port = Number(parsed.port || 0);
    return Number.isInteger(port) && port > 0 ? port : 3789;
  } catch {
    return 3789;
  }
}

async function stopPid(pid) {
  const numeric = Number(pid || 0);
  if (!Number.isInteger(numeric) || numeric <= 0) {
    return { ok: false, message: 'Invalid PID.' };
  }

  if (process.platform === 'win32') {
    const result = spawnSync('taskkill', ['/PID', String(numeric), '/T', '/F'], { encoding: 'utf8' });
    const stdout = String(result.stdout || '').trim();
    const stderr = String(result.stderr || '').trim();
    if (result.status === 0) return { ok: true, stdout, stderr };
    if (/not found|no running instance/i.test(`${stdout}\n${stderr}`)) return { ok: true, stdout, stderr };
    return { ok: false, stdout, stderr };
  }

  try {
    process.kill(numeric, 'SIGTERM');
    return { ok: true, stdout: '', stderr: '' };
  } catch (error) {
    return { ok: false, stdout: '', stderr: String(error?.message || error) };
  }
}

function spawnDetached(command, args, options = {}) {
  const child = spawn(command, args, {
    cwd: options.cwd || process.cwd(),
    detached: true,
    stdio: 'ignore',
    shell: options.shell === true,
  });
  child.unref();
  return child.pid;
}

function spawnDetachedInvocation(invocation, args, options = {}) {
  if (
    process.platform === 'win32'
    && invocation.command === DEFAULT_CODEX_COMMAND
    && (!invocation.args || invocation.args.length === 0)
  ) {
    const commandText = [invocation.command, ...args].join(' ').trim();
    return spawnDetached('cmd.exe', ['/d', '/s', '/c', commandText], {
      shell: false,
      cwd: options.cwd,
    });
  }

  const invocationArgs = [...(invocation.args || []), ...args];
  return spawnDetached(invocation.command, invocationArgs, {
    shell: false,
    cwd: options.cwd,
  });
}

export async function startCodexServer(config = {}, options = {}) {
  const readiness = evaluateCodexReadiness(config);
  if (!readiness.ok) {
    return {
      ok: false,
      message: `Codex is not ready (${readiness.missing.join(', ')}). Run "codex login" first.`,
      readiness,
    };
  }

  const codex = readiness.codex;
  if (codex.mode !== 'app-server') {
    return {
      ok: false,
      message: 'assistant.codex.mode is not "app-server". Set mode to app-server to launch codex-start.',
      readiness,
    };
  }

  const existing = await readCodexRuntime();
  if (options.reuse !== false && existing?.pid && isProcessAlive(existing.pid)) {
    return {
      ok: true,
      reused: true,
      runtime: existing,
      wsUrl: existing.wsUrl,
      pid: existing.pid,
      message: `Reused Codex app-server at ${existing.wsUrl} (pid ${existing.pid}).`,
    };
  }

  const wsUrl = options.wsPort
    ? wsUrlFromPort(options.wsPort)
    : String(codex.appServerUrl || DEFAULT_CODEX_WS_URL);

  const invocation = resolveCodexInvocation(codex);
  const appServerArgs = ['app-server', '--listen', wsUrl];
  const pid = spawnDetachedInvocation(invocation, appServerArgs, { cwd: process.cwd() });

  if (!isProcessAlive(pid)) {
    return {
      ok: false,
      message: 'Failed to start Codex app-server process.',
      invocation: invocationReport(invocation),
    };
  }

  const runtime = await writeCodexRuntime({
    pid,
    wsUrl,
    port: portFromWsUrl(wsUrl),
    mode: 'app-server',
    cliCommand: codex.cliCommand,
    invocation: invocationReport(invocation),
    workspaceRoot: process.cwd(),
    startedAt: new Date().toISOString(),
  });

  return {
    ok: true,
    reused: false,
    runtime,
    wsUrl: runtime.wsUrl,
    pid: runtime.pid,
    message: `Started Codex app-server at ${runtime.wsUrl} (pid ${runtime.pid}).`,
  };
}

export async function stopCodexServer() {
  const runtime = await readCodexRuntime();
  if (!runtime) {
    return {
      ok: true,
      stopped: false,
      message: 'Codex server is not running.',
    };
  }

  if (!isProcessAlive(runtime.pid)) {
    await clearCodexRuntime();
    return {
      ok: true,
      stopped: true,
      stale: true,
      message: 'Removed stale Codex runtime state.',
      runtime,
    };
  }

  const stopped = await stopPid(runtime.pid);
  if (!stopped.ok) {
    return {
      ok: false,
      stopped: false,
      message: `Failed to stop Codex runtime pid ${runtime.pid}.`,
      stdout: stopped.stdout,
      stderr: stopped.stderr,
      runtime,
    };
  }

  await clearCodexRuntime();
  return {
    ok: true,
    stopped: true,
    message: `Stopped Codex runtime pid ${runtime.pid}.`,
    stdout: stopped.stdout,
    stderr: stopped.stderr,
    runtime,
  };
}

function extractPromptFromMessages(messages) {
  const list = Array.isArray(messages) ? messages : [];
  for (let index = list.length - 1; index >= 0; index -= 1) {
    const message = list[index];
    if (!message || typeof message !== 'object') continue;
    if (String(message.role || '') !== 'user') continue;

    if (typeof message.content === 'string' && message.content.trim()) {
      return message.content.trim();
    }

    if (Array.isArray(message.content)) {
      const text = message.content
        .map((part) => (part && typeof part === 'object' && part.type === 'text' ? String(part.text || '') : ''))
        .join(' ')
        .trim();
      if (text) return text;
    }
  }
  return '';
}

function buildExecArgs(codex, prompt, outputPath) {
  const args = [
    'exec',
    '--output-last-message',
    outputPath,
    '--ask-for-approval',
    codex.approvalMode,
    '--sandbox',
    codex.sandboxMode,
  ];
  if (codex.defaultModel) {
    args.push('--model', codex.defaultModel);
  }
  if (prompt) args.push(prompt);
  return args;
}

export async function runCodexExec(config = {}, options = {}) {
  const readiness = evaluateCodexReadiness(config);
  if (!readiness.ok) {
    return {
      ok: false,
      message: `Codex is not ready (${readiness.missing.join(', ')}).`,
      readiness,
    };
  }

  const codex = readiness.codex;
  const prompt = String(
    options.prompt
      || extractPromptFromMessages(options.messages)
      || options.input
      || '',
  ).trim();

  if (!prompt) {
    return {
      ok: false,
      message: 'Missing prompt input for Codex exec.',
      readiness,
    };
  }

  const outputPath = path.join(os.tmpdir(), `repo-studio-codex-${Date.now()}-${Math.random().toString(16).slice(2)}.txt`);
  const args = buildExecArgs(codex, prompt, outputPath);
  const invocation = resolveCodexInvocation(codex);
  const result = runCodexInvocationSync(invocation, args, {
    cwd: options.cwd || process.cwd(),
    timeoutMs: options.timeoutMs || 300000,
  });

  let message = '';
  try {
    message = normalizeWhitespace(await fs.readFile(outputPath, 'utf8'));
  } catch {
    message = '';
  }
  await fs.unlink(outputPath).catch(() => {});

  if (!message) {
    message = normalizeWhitespace(result.stdout);
  }
  if (!message) {
    message = normalizeWhitespace(result.stderr);
  }

  return {
    ok: result.ok,
    code: result.code,
    command: result.command,
    invocation: invocationReport(invocation),
    message,
    stdout: result.stdout,
    stderr: result.stderr,
    readiness,
  };
}

export function parseCodexAuthUrl(output) {
  const text = String(output || '');
  const authMatch = text.match(/https:\/\/auth\.openai\.com\/oauth\/authorize[^\s\"')]+/i);
  if (authMatch) return authMatch[0];

  const genericMatch = text.match(/https?:\/\/[^\s\"')]+/i);
  return genericMatch ? genericMatch[0] : null;
}

export async function runCodexLogin(config = {}, options = {}) {
  const codex = resolveCodexConfig(config);
  const invocation = normalizeExplicitInvocation(options.invocation) || resolveCodexInvocation(codex);
  const cli = getCodexCliStatus(codex, { invocation });

  if (!cli.installed) {
    return {
      ok: false,
      message: cli.invocation.bundleMissing
        ? 'Codex CLI is missing. Install workspace dependencies with `pnpm install` to use bundled Codex.'
        : `Codex CLI command is unavailable (${codex.cliCommand}).`,
      authUrl: null,
      stdout: cli.details.stdout,
      stderr: cli.details.stderr,
      readiness: evaluateCodexReadiness(config),
      invocation: cli.invocation,
    };
  }

  const loginResult = runCodexInvocationSync(invocation, ['login'], {
    cwd: options.cwd || process.cwd(),
    timeoutMs: options.timeoutMs || 300000,
  });

  const combinedOutput = [loginResult.stdout, loginResult.stderr].filter(Boolean).join('\n');
  const authUrl = parseCodexAuthUrl(combinedOutput);
  const readiness = evaluateCodexReadiness(config, { invocation });

  let message;
  if (loginResult.ok && readiness.ok) {
    message = 'Codex login completed and readiness checks are satisfied.';
  } else if (loginResult.ok) {
    message = readiness.missing.length > 0
      ? `Codex login finished, but readiness is still blocked (${readiness.missing.join(', ')}).`
      : 'Codex login finished.';
  } else {
    message = 'Codex login failed.';
  }

  return {
    ok: loginResult.ok,
    code: loginResult.code,
    command: loginResult.command,
    invocation: invocationReport(invocation),
    authUrl,
    stdout: loginResult.stdout,
    stderr: loginResult.stderr,
    readiness,
    message,
  };
}

export async function getCodexStatus(config = {}, options = {}) {
  const readiness = evaluateCodexReadiness(config, {
    requireLogin: options.requireLogin !== false,
  });

  const runtime = await readCodexRuntime();
  const running = runtime?.pid ? isProcessAlive(runtime.pid) : false;
  if (runtime && !running) {
    await clearCodexRuntime();
  }

  return {
    ok: readiness.ok,
    readiness,
    runtime: running ? runtime : null,
    running,
    message: readiness.ok
      ? (running ? `Codex ready; app-server running at ${runtime.wsUrl}.` : 'Codex ready.')
      : `Codex not ready: ${readiness.missing.join(', ')}`,
  };
}
