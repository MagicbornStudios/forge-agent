import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { spawn, spawnSync, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { EventEmitter } from 'node:events';
import { createInterface } from 'node:readline';

import {
  markProposalApplied,
  markProposalFailed,
  markProposalRejected,
  type RepoProposal,
  upsertPendingProposal,
} from '@/lib/proposals';

type JsonRpcLike = {
  id?: string | number;
  method?: string;
  params?: any;
  result?: any;
  error?: {
    code?: number;
    message?: string;
    data?: unknown;
  };
};

type PendingRequest = {
  method: string;
  resolve: (value: any) => void;
  reject: (reason: Error) => void;
  timeout: NodeJS.Timeout;
};

export type CodexTurnStreamEvent =
  | {
      type: 'started';
      turnId: string;
      protocolTurnId: string | null;
      createdAt: string;
    }
  | {
      type: 'text-delta';
      turnId: string;
      delta: string;
      ts: string;
    }
  | {
      type: 'approval-request';
      turnId: string;
      approvalToken: string;
      proposal: RepoProposal;
      ts: string;
    }
  | {
      type: 'event';
      turnId: string;
      method: string;
      params: unknown;
      ts: string;
    }
  | {
      type: 'finished';
      turnId: string;
      status: 'completed' | 'failed' | 'cancelled';
      message?: string;
      ts: string;
    };

type CodexTurnState = {
  turnId: string;
  protocolTurnId: string | null;
  editorTarget: string;
  loopId: string;
  domain: string;
  scopeRoots: string[];
  scopeOverrideToken: string;
  prompt: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  completedAt: string | null;
  text: string;
  error: string | null;
  events: CodexTurnStreamEvent[];
  emitter: EventEmitter;
};

type PendingApproval = {
  approvalToken: string;
  requestId: string | number;
  turnId: string;
  proposalId: string;
};

type CodexSessionState = {
  sessionId: string;
  process: ChildProcessWithoutNullStreams;
  startedAt: string;
  protocolInitialized: boolean;
  threadId: string | null;
  nextRequestId: number;
  pendingRequests: Map<string, PendingRequest>;
  turns: Map<string, CodexTurnState>;
  turnByProtocolId: Map<string, string>;
  pendingApprovals: Map<string, PendingApproval>;
  diagnostics: string[];
};

type CodexConfig = {
  cliCommand: string;
  defaultModel: string;
  transport: 'app-server' | 'exec';
  execFallbackAllowed: boolean;
};

type ConfigShape = {
  assistant?: {
    codex?: {
      cliCommand?: string;
      defaultModel?: string;
      transport?: 'app-server' | 'exec' | string;
      execFallbackAllowed?: boolean;
    };
    defaultModel?: string;
  };
};

const CODEX_SESSION_META_PATH = path.join(process.cwd(), '..', '..', '.repo-studio', 'codex-session.json');

declare global {
  // eslint-disable-next-line no-var
  var __repoStudioCodexSession__: CodexSessionState | undefined;
}

function nowIso() {
  return new Date().toISOString();
}

function resolveRepoRoot() {
  return path.resolve(process.cwd(), '..', '..');
}

function messageToText(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    return value.map((entry) => messageToText(entry)).filter(Boolean).join('\n');
  }
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    for (const key of ['text', 'delta', 'message', 'content', 'summary']) {
      if (record[key] != null) {
        const nested = messageToText(record[key]);
        if (nested) return nested;
      }
    }
  }
  return '';
}

function extractPrompt(messages: any[] | undefined, fallbackPrompt?: string) {
  if (typeof fallbackPrompt === 'string' && fallbackPrompt.trim()) return fallbackPrompt.trim();
  const list = Array.isArray(messages) ? messages : [];
  for (let index = list.length - 1; index >= 0; index -= 1) {
    const message = list[index];
    if (!message || typeof message !== 'object') continue;
    if (String((message as { role?: unknown }).role || '') !== 'user') continue;
    const content = (message as { content?: unknown }).content;
    const text = messageToText(content).trim();
    if (text) return text;
  }
  return '';
}

function extractValueByKeyPath(record: unknown, keys: string[]): unknown {
  if (!record || typeof record !== 'object') return undefined;
  const source = record as Record<string, unknown>;
  for (const key of keys) {
    if (source[key] != null) return source[key];
  }
  return undefined;
}

function extractTurnIdFromPayload(payload: unknown): string | null {
  const direct = extractValueByKeyPath(payload, ['turnId', 'turn_id', 'id']);
  if (typeof direct === 'string' && direct.trim()) return direct.trim();
  if (typeof direct === 'number') return String(direct);

  if (payload && typeof payload === 'object') {
    const nestedTurn = extractValueByKeyPath(payload, ['turn']);
    const nestedId = extractValueByKeyPath(nestedTurn, ['id', 'turnId']);
    if (typeof nestedId === 'string' && nestedId.trim()) return nestedId.trim();
    if (typeof nestedId === 'number') return String(nestedId);
  }
  return null;
}

function extractFilesFromUnknown(value: unknown): string[] {
  const files = new Set<string>();
  const queue: unknown[] = [value];

  while (queue.length > 0) {
    const next = queue.shift();
    if (!next) continue;
    if (Array.isArray(next)) {
      for (const item of next) queue.push(item);
      continue;
    }
    if (typeof next !== 'object') continue;

    const record = next as Record<string, unknown>;
    for (const key of ['path', 'filePath', 'targetPath', 'file']) {
      const raw = record[key];
      if (typeof raw === 'string' && raw.trim()) files.add(raw.trim());
    }

    for (const valueEntry of Object.values(record)) {
      if (valueEntry && (typeof valueEntry === 'object' || Array.isArray(valueEntry))) {
        queue.push(valueEntry);
      }
    }
  }

  return [...files];
}

function extractDiffFromUnknown(value: unknown): string {
  const queue: unknown[] = [value];
  while (queue.length > 0) {
    const next = queue.shift();
    if (!next) continue;
    if (Array.isArray(next)) {
      for (const item of next) queue.push(item);
      continue;
    }
    if (typeof next !== 'object') continue;

    const record = next as Record<string, unknown>;
    for (const key of ['diff', 'patch', 'unifiedDiff']) {
      const raw = record[key];
      if (typeof raw === 'string' && raw.trim()) return raw;
    }

    for (const nested of Object.values(record)) {
      if (nested && (typeof nested === 'object' || Array.isArray(nested))) {
        queue.push(nested);
      }
    }
  }
  return '';
}

async function readRepoStudioConfig(): Promise<ConfigShape> {
  try {
    const raw = await fs.readFile(path.join(resolveRepoRoot(), '.repo-studio', 'config.json'), 'utf8');
    return JSON.parse(raw) as ConfigShape;
  } catch {
    return {};
  }
}

async function resolveCodexConfig(): Promise<CodexConfig> {
  const config = await readRepoStudioConfig();
  const codex = config.assistant?.codex || {};
  return {
    cliCommand: String(codex.cliCommand || 'codex').trim() || 'codex',
    defaultModel: String(codex.defaultModel || config.assistant?.defaultModel || 'gpt-5').trim() || 'gpt-5',
    transport: codex.transport === 'exec' ? 'exec' : 'app-server',
    execFallbackAllowed: codex.execFallbackAllowed === true,
  };
}

function runCodexStatusCheck() {
  const cliPath = path.join(resolveRepoRoot(), 'packages', 'repo-studio', 'src', 'cli.mjs');
  const result = spawnSync(process.execPath, [cliPath, 'codex-status', '--json'], {
    cwd: resolveRepoRoot(),
    encoding: 'utf8',
  });
  const parse = (raw: string) => {
    try {
      return JSON.parse(raw) as any;
    } catch {
      return null;
    }
  };
  const payload = parse(String(result.stdout || '').trim()) || parse(String(result.stderr || '').trim()) || {};
  return {
    ok: (result.status ?? 1) === 0 && payload.ok !== false,
    payload,
    stderr: String(result.stderr || ''),
  };
}

async function persistSessionMetadata(session: CodexSessionState | null, extra: Record<string, unknown> = {}) {
  const payload = session ? {
    sessionId: session.sessionId,
    pid: session.process.pid,
    startedAt: session.startedAt,
    protocolInitialized: session.protocolInitialized,
    threadId: session.threadId,
    activeThreadCount: session.threadId ? 1 : 0,
    activeTurnCount: [...session.turns.values()].filter((item) => item.status === 'running').length,
    workspaceRoot: resolveRepoRoot(),
    ...extra,
  } : {
    sessionId: null,
    pid: null,
    startedAt: null,
    protocolInitialized: false,
    threadId: null,
    activeThreadCount: 0,
    activeTurnCount: 0,
    workspaceRoot: resolveRepoRoot(),
    ...extra,
  };

  await fs.mkdir(path.dirname(CODEX_SESSION_META_PATH), { recursive: true });
  await fs.writeFile(CODEX_SESSION_META_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

function getGlobalSession() {
  return global.__repoStudioCodexSession__ || null;
}

function setGlobalSession(session: CodexSessionState | null) {
  if (session) {
    global.__repoStudioCodexSession__ = session;
  } else {
    global.__repoStudioCodexSession__ = undefined;
  }
}

function isRunning(session: CodexSessionState | null) {
  return Boolean(session?.process?.pid && !session.process.killed);
}

function writeLine(session: CodexSessionState, payload: Record<string, unknown>) {
  session.process.stdin.write(`${JSON.stringify(payload)}\n`);
}

function clearPendingRequests(session: CodexSessionState, reason: string) {
  for (const pending of session.pendingRequests.values()) {
    clearTimeout(pending.timeout);
    pending.reject(new Error(reason));
  }
  session.pendingRequests.clear();
}

function emitTurnEvent(turn: CodexTurnState, event: CodexTurnStreamEvent) {
  turn.events.push(event);
  turn.emitter.emit('event', event);
}

function resolveTurn(session: CodexSessionState, turnIdOrProtocolId: string | null): CodexTurnState | null {
  if (!turnIdOrProtocolId) return null;
  const byTurnId = session.turns.get(turnIdOrProtocolId);
  if (byTurnId) return byTurnId;
  const mapped = session.turnByProtocolId.get(turnIdOrProtocolId);
  if (!mapped) return null;
  return session.turns.get(mapped) || null;
}

function findLastRunningTurn(session: CodexSessionState) {
  const running = [...session.turns.values()].filter((entry) => entry.status === 'running');
  running.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  return running[0] || null;
}

function handleResponseMessage(session: CodexSessionState, message: JsonRpcLike) {
  const key = String(message.id);
  const pending = session.pendingRequests.get(key);
  if (!pending) return false;

  session.pendingRequests.delete(key);
  clearTimeout(pending.timeout);
  if (message.error) {
    pending.reject(new Error(String(message.error.message || `${pending.method} failed`)));
  } else {
    pending.resolve(message.result);
  }
  return true;
}

async function handleApprovalRequest(session: CodexSessionState, message: JsonRpcLike) {
  const method = String(message.method || '');
  const requestId = message.id;
  if (requestId == null) return;

  const turnIdHint = extractTurnIdFromPayload(message.params);
  const turn = resolveTurn(session, turnIdHint) || findLastRunningTurn(session);
  const turnId = turn?.turnId || '';
  const proposal = await upsertPendingProposal({
    editorTarget: turn?.editorTarget || 'codex-assistant',
    loopId: turn?.loopId || 'default',
    domain: turn?.domain || '',
    scopeRoots: turn?.scopeRoots || [],
    scopeOverrideToken: turn?.scopeOverrideToken || '',
    threadId: session.threadId || '',
    turnId,
    kind: method,
    summary: messageToText((message.params as any)?.summary || (message.params as any)?.message || method) || method,
    files: extractFilesFromUnknown(message.params),
    diff: extractDiffFromUnknown(message.params),
    approvalToken: String(requestId),
  });

  session.pendingApprovals.set(String(requestId), {
    approvalToken: String(requestId),
    requestId,
    turnId,
    proposalId: proposal.id,
  });

  if (turn) {
    emitTurnEvent(turn, {
      type: 'approval-request',
      turnId: turn.turnId,
      approvalToken: String(requestId),
      proposal,
      ts: nowIso(),
    });
  }
}

async function handleServerRequest(session: CodexSessionState, message: JsonRpcLike) {
  const method = String(message.method || '');
  if (method.toLowerCase().includes('requestapproval')) {
    await handleApprovalRequest(session, message);
    return;
  }

  if (message.id != null) {
    writeLine(session, {
      id: message.id,
      error: {
        code: -32601,
        message: `Unsupported server request: ${method}`,
      },
    });
  }
}

async function handleNotification(session: CodexSessionState, message: JsonRpcLike) {
  const method = String(message.method || '');
  const params = message.params;
  const turnIdHint = extractTurnIdFromPayload(params);
  const turn = resolveTurn(session, turnIdHint) || findLastRunningTurn(session);

  if (turn) {
    emitTurnEvent(turn, {
      type: 'event',
      turnId: turn.turnId,
      method,
      params,
      ts: nowIso(),
    });
  }

  if (!turn) return;

  const text = messageToText(params);
  if (text) {
    turn.text += text;
    emitTurnEvent(turn, {
      type: 'text-delta',
      turnId: turn.turnId,
      delta: text,
      ts: nowIso(),
    });
  }

  if (method === 'turn/completed') {
    turn.status = 'completed';
    turn.completedAt = nowIso();
    emitTurnEvent(turn, {
      type: 'finished',
      turnId: turn.turnId,
      status: 'completed',
      message: text || undefined,
      ts: nowIso(),
    });
    await persistSessionMetadata(session);
    return;
  }

  if (method === 'turn/failed' || method === 'turn/error') {
    turn.status = 'failed';
    turn.error = text || 'Codex turn failed.';
    turn.completedAt = nowIso();
    emitTurnEvent(turn, {
      type: 'finished',
      turnId: turn.turnId,
      status: 'failed',
      message: turn.error,
      ts: nowIso(),
    });
    await persistSessionMetadata(session);
  }
}

async function handleProtocolLine(session: CodexSessionState, line: string) {
  const trimmed = String(line || '').trim();
  if (!trimmed) return;

  let message: JsonRpcLike;
  try {
    message = JSON.parse(trimmed) as JsonRpcLike;
  } catch {
    session.diagnostics.push(`non-json-line: ${trimmed.slice(0, 320)}`);
    session.diagnostics = session.diagnostics.slice(-80);
    return;
  }

  if (message.id != null && (Object.prototype.hasOwnProperty.call(message, 'result') || Object.prototype.hasOwnProperty.call(message, 'error'))) {
    handleResponseMessage(session, message);
    return;
  }

  if (message.id != null && message.method) {
    await handleServerRequest(session, message);
    return;
  }

  if (message.method) {
    await handleNotification(session, message);
    return;
  }

  session.diagnostics.push(`unknown-message-shape: ${trimmed.slice(0, 320)}`);
  session.diagnostics = session.diagnostics.slice(-80);
}

function request(session: CodexSessionState, method: string, params: Record<string, unknown>, timeoutMs = 30000): Promise<any> {
  const id = String(session.nextRequestId++);
  const payload = { id, method, params };
  writeLine(session, payload);

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      session.pendingRequests.delete(id);
      reject(new Error(`${method} timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    session.pendingRequests.set(id, {
      method,
      resolve,
      reject,
      timeout,
    });
  });
}

function notify(session: CodexSessionState, method: string, params: Record<string, unknown> = {}) {
  writeLine(session, { method, params });
}

function spawnCodexAppServer(cliCommand: string) {
  const repoRoot = resolveRepoRoot();
  if (process.platform === 'win32') {
    return spawn('cmd.exe', ['/d', '/s', '/c', `${cliCommand} app-server`], {
      cwd: repoRoot,
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true,
    });
  }
  return spawn(cliCommand, ['app-server'], {
    cwd: repoRoot,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
}

async function initializeSession(session: CodexSessionState) {
  const initializeResult = await request(session, 'initialize', {
    protocolVersion: 1,
    clientInfo: {
      name: 'repo-studio',
      version: '1.6.0',
    },
  });

  notify(session, 'initialized', {});

  const thread = await request(session, 'thread/start', {});
  const threadId = extractTurnIdFromPayload(thread) || String((thread as any)?.threadId || (thread as any)?.id || '');

  session.protocolInitialized = true;
  session.threadId = threadId || null;
  session.diagnostics.push(`initialize: ${JSON.stringify(initializeResult || {})}`.slice(0, 480));
  session.diagnostics = session.diagnostics.slice(-80);
}

function markAllRunningTurnsFailed(session: CodexSessionState, message: string) {
  const ts = nowIso();
  for (const turn of session.turns.values()) {
    if (turn.status !== 'running') continue;
    turn.status = 'failed';
    turn.error = message;
    turn.completedAt = ts;
    emitTurnEvent(turn, {
      type: 'finished',
      turnId: turn.turnId,
      status: 'failed',
      message,
      ts,
    });
  }
}

async function teardownSession(session: CodexSessionState, reason: string) {
  clearPendingRequests(session, reason);
  markAllRunningTurnsFailed(session, reason);
  setGlobalSession(null);
  await persistSessionMetadata(null, { reason });
}

export async function ensureCodexSession() {
  const existing = getGlobalSession();
  if (existing && isRunning(existing) && existing.protocolInitialized && existing.threadId) {
    await persistSessionMetadata(existing);
    return {
      ok: true,
      reused: true,
      sessionId: existing.sessionId,
      protocolInitialized: existing.protocolInitialized,
      threadId: existing.threadId,
      activeThreadCount: existing.threadId ? 1 : 0,
      activeTurnCount: [...existing.turns.values()].filter((entry) => entry.status === 'running').length,
    };
  }

  const readiness = runCodexStatusCheck();
  if (!readiness.ok || readiness.payload?.readiness?.ok !== true) {
    return {
      ok: false,
      message: readiness.payload?.message || 'Codex is not ready. Run `codex login` first.',
      readiness: readiness.payload?.readiness || null,
      stderr: readiness.stderr,
    };
  }

  const codexConfig = await resolveCodexConfig();
  if (codexConfig.transport !== 'app-server') {
    return {
      ok: false,
      message: 'assistant.codex.transport is not "app-server".',
      config: codexConfig,
    };
  }

  const child = spawnCodexAppServer(codexConfig.cliCommand);
  const session: CodexSessionState = {
    sessionId: randomUUID(),
    process: child,
    startedAt: nowIso(),
    protocolInitialized: false,
    threadId: null,
    nextRequestId: 1,
    pendingRequests: new Map(),
    turns: new Map(),
    turnByProtocolId: new Map(),
    pendingApprovals: new Map(),
    diagnostics: [],
  };

  const stdoutLines = createInterface({ input: child.stdout });
  stdoutLines.on('line', (line) => {
    handleProtocolLine(session, line).catch(() => {});
  });

  const stderrLines = createInterface({ input: child.stderr });
  stderrLines.on('line', (line) => {
    const text = String(line || '').trim();
    if (!text) return;
    session.diagnostics.push(`stderr: ${text}`);
    session.diagnostics = session.diagnostics.slice(-80);
  });

  child.on('error', (error) => {
    session.diagnostics.push(`process-error: ${String(error?.message || error)}`);
    session.diagnostics = session.diagnostics.slice(-80);
  });

  child.on('exit', () => {
    teardownSession(session, 'Codex app-server process exited.').catch(() => {});
  });

  setGlobalSession(session);
  try {
    await initializeSession(session);
    await persistSessionMetadata(session);
    return {
      ok: true,
      reused: false,
      sessionId: session.sessionId,
      protocolInitialized: session.protocolInitialized,
      threadId: session.threadId,
      activeThreadCount: session.threadId ? 1 : 0,
      activeTurnCount: 0,
    };
  } catch (error: any) {
    await teardownSession(session, String(error?.message || error));
    return {
      ok: false,
      message: String(error?.message || error),
      diagnostics: session.diagnostics.slice(-20),
    };
  }
}

function safeTurnResult(turn: CodexTurnState) {
  return {
    turnId: turn.turnId,
    protocolTurnId: turn.protocolTurnId,
    editorTarget: turn.editorTarget,
    loopId: turn.loopId,
    domain: turn.domain,
    scopeRoots: turn.scopeRoots,
    scopeOverrideToken: turn.scopeOverrideToken,
    status: turn.status,
    createdAt: turn.createdAt,
    completedAt: turn.completedAt,
    text: turn.text,
    error: turn.error,
  };
}

export async function getCodexSessionStatus() {
  const config = await resolveCodexConfig();
  const readiness = runCodexStatusCheck();
  const session = getGlobalSession();
  const running = Boolean(session && isRunning(session));
  const activeTurnCount = running
    ? [...session!.turns.values()].filter((entry) => entry.status === 'running').length
    : 0;
  const protocolInitialized = running ? session!.protocolInitialized : false;
  const activeThreadCount = running && session!.threadId ? 1 : 0;

  await persistSessionMetadata(running ? session! : null, {
    transport: config.transport,
    execFallbackEnabled: config.execFallbackAllowed,
  }).catch(() => {});

  return {
    ok: readiness.ok && readiness.payload?.readiness?.ok === true,
    running,
    sessionId: running ? session!.sessionId : null,
    protocolInitialized,
    activeThreadCount,
    activeTurnCount,
    threadId: running ? session!.threadId : null,
    execFallbackEnabled: config.execFallbackAllowed,
    readiness: readiness.payload?.readiness || null,
    transport: config.transport,
    diagnostics: running ? session!.diagnostics.slice(-20) : [],
  };
}

export async function stopCodexSession() {
  const session = getGlobalSession();
  if (!session) {
    await persistSessionMetadata(null, { reason: 'No active session.' }).catch(() => {});
    return {
      ok: true,
      stopped: false,
      message: 'Codex session is not running.',
    };
  }

  try {
    session.process.kill('SIGTERM');
  } catch {
    // ignore; teardown handles stale state
  }
  await teardownSession(session, 'Session stopped by user request.');

  return {
    ok: true,
    stopped: true,
    message: 'Codex session stopped.',
  };
}

export async function startCodexTurn(input: {
  prompt?: string;
  messages?: any[];
  loopId?: string;
  editorTarget?: string;
  domain?: string;
  scopeRoots?: string[];
  scopeOverrideToken?: string;
}) {
  const sessionResult = await ensureCodexSession();
  if (!sessionResult.ok) {
    return {
      ok: false,
      message: sessionResult.message || 'Unable to start Codex session.',
      session: sessionResult,
    };
  }

  const session = getGlobalSession();
  if (!session) {
    return {
      ok: false,
      message: 'Codex session is unavailable.',
    };
  }

  const prompt = extractPrompt(input.messages, input.prompt);
  if (!prompt) {
    return {
      ok: false,
      message: 'No user prompt found for Codex turn.',
    };
  }

  const turnId = randomUUID();
  const turn: CodexTurnState = {
    turnId,
    protocolTurnId: null,
    editorTarget: String(input.editorTarget || 'codex-assistant'),
    loopId: String(input.loopId || 'default'),
    domain: String(input.domain || '').trim().toLowerCase(),
    scopeRoots: Array.isArray(input.scopeRoots)
      ? [...new Set(input.scopeRoots.map((value) => String(value || '').trim()).filter(Boolean))]
      : [],
    scopeOverrideToken: String(input.scopeOverrideToken || '').trim(),
    prompt,
    status: 'running',
    createdAt: nowIso(),
    completedAt: null,
    text: '',
    error: null,
    events: [],
    emitter: new EventEmitter(),
  };

  session.turns.set(turnId, turn);
  emitTurnEvent(turn, {
    type: 'started',
    turnId,
    protocolTurnId: null,
    createdAt: turn.createdAt,
  });

  try {
    const response = await request(session, 'turn/start', {
      threadId: session.threadId,
      cwd: resolveRepoRoot(),
      model: (await resolveCodexConfig()).defaultModel,
      input: [
        {
          type: 'text',
          text: prompt,
        },
      ],
      prompt,
      metadata: {
        editorTarget: turn.editorTarget,
        loopId: turn.loopId,
        domain: turn.domain,
        scopeRoots: turn.scopeRoots,
        scopeOverrideToken: turn.scopeOverrideToken,
      },
    }, 45000);

    const protocolTurnId = extractTurnIdFromPayload(response);
    if (protocolTurnId) {
      turn.protocolTurnId = protocolTurnId;
      session.turnByProtocolId.set(protocolTurnId, turnId);
    }

    emitTurnEvent(turn, {
      type: 'started',
      turnId,
      protocolTurnId,
      createdAt: turn.createdAt,
    });
    await persistSessionMetadata(session);
    return {
      ok: true,
      turnId,
      protocolTurnId,
      threadId: session.threadId,
      sessionId: session.sessionId,
    };
  } catch (error: any) {
    turn.status = 'failed';
    turn.error = String(error?.message || error);
    turn.completedAt = nowIso();
    emitTurnEvent(turn, {
      type: 'finished',
      turnId,
      status: 'failed',
      message: turn.error,
      ts: turn.completedAt,
    });
    await persistSessionMetadata(session);
    return {
      ok: false,
      turnId,
      message: turn.error,
    };
  }
}

export function getCodexTurn(turnId: string) {
  const session = getGlobalSession();
  if (!session) return null;
  const turn = session.turns.get(String(turnId || '').trim());
  if (!turn) return null;
  return safeTurnResult(turn);
}

export function listCodexTurns() {
  const session = getGlobalSession();
  if (!session) return [];
  return [...session.turns.values()]
    .map((turn) => safeTurnResult(turn))
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

export function createTurnStream(turnId: string) {
  const session = getGlobalSession();
  if (!session) return null;
  const turn = session.turns.get(String(turnId || '').trim());
  if (!turn) return null;
  return turn;
}

export function snapshotTurnEvents(turnId: string) {
  const turn = createTurnStream(turnId);
  if (!turn) return [];
  return [...turn.events];
}

export function subscribeTurnEvents(
  turnId: string,
  callback: (event: CodexTurnStreamEvent) => void,
) {
  const turn = createTurnStream(turnId);
  if (!turn) return null;
  const handler = (event: CodexTurnStreamEvent) => callback(event);
  turn.emitter.on('event', handler);
  return () => {
    turn.emitter.off('event', handler);
  };
}

export async function resolveApproval(approvalToken: string, decision: 'approve' | 'reject') {
  const session = getGlobalSession();
  if (!session) {
    return {
      ok: false,
      message: 'Codex session is not running.',
    };
  }

  const token = String(approvalToken || '').trim();
  const pending = session.pendingApprovals.get(token);
  if (!pending) {
    return {
      ok: false,
      message: `Unknown approval token: ${token}`,
    };
  }

  const resultValue = {
    approved: decision === 'approve',
    decision: decision === 'approve' ? 'approved' : 'rejected',
  };
  writeLine(session, {
    id: pending.requestId,
    result: resultValue,
  });
  session.pendingApprovals.delete(token);

  if (decision === 'approve') {
    await markProposalApplied(pending.proposalId);
  } else {
    await markProposalRejected(pending.proposalId);
  }

  const turn = session.turns.get(pending.turnId);
  if (turn) {
    emitTurnEvent(turn, {
      type: 'event',
      turnId: turn.turnId,
      method: 'approval/resolved',
      params: {
        approvalToken: token,
        decision,
        proposalId: pending.proposalId,
      },
      ts: nowIso(),
    });
  }

  await persistSessionMetadata(session);
  return {
    ok: true,
    approvalToken: token,
    proposalId: pending.proposalId,
    decision,
    result: resultValue,
  };
}

export async function rejectApprovalWithFailure(approvalToken: string, reason: string) {
  const token = String(approvalToken || '').trim();
  const session = getGlobalSession();
  if (!session) return;
  const pending = session.pendingApprovals.get(token);
  if (!pending) return;

  writeLine(session, {
    id: pending.requestId,
    result: {
      approved: false,
      decision: 'rejected',
      reason,
    },
  });
  session.pendingApprovals.delete(token);
  await markProposalFailed(pending.proposalId, reason).catch(() => {});
}
