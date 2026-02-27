import { randomUUID } from 'node:crypto';
import { EventEmitter } from 'node:events';
import { resolveRepoRoot } from '@/lib/repo-files';

type PtyLike = {
  pid: number;
  write: (data: string) => void;
  resize: (cols: number, rows: number) => void;
  kill: () => void;
  onData: (listener: (data: string) => void) => void;
  onExit: (listener: (event: { exitCode: number; signal?: number }) => void) => void;
};

type TerminalSessionState = {
  sessionId: string;
  profileId: string;
  name: string;
  startupCommand: string;
  shell: string;
  cwd: string;
  pty: PtyLike;
  degraded: boolean;
  fallbackReason: string | null;
  createdAt: string;
  lastActivityAt: string;
  running: boolean;
  exitCode: number | null;
  buffer: string;
  emitter: EventEmitter;
};

declare global {
  // eslint-disable-next-line no-var
  var __repoStudioTerminalSessions__: Map<string, TerminalSessionState> | undefined;
  // eslint-disable-next-line no-var
  var __repoStudioActiveTerminalSessionId__: string | undefined;
}

const MAX_BUFFER_CHARS = 200_000;
const STALE_SESSION_MS = 30_000;

function nowIso() {
  return new Date().toISOString();
}

function getSessionsStore() {
  if (!global.__repoStudioTerminalSessions__) {
    global.__repoStudioTerminalSessions__ = new Map();
  }
  return global.__repoStudioTerminalSessions__;
}

function resolveShell() {
  if (process.platform === 'win32') {
    return {
      shell: 'powershell.exe',
      args: ['-NoLogo'],
    };
  }
  return {
    shell: process.env.SHELL || '/bin/bash',
    args: ['-l'],
  };
}

function shellEscapeArg(value: string) {
  const text = String(value || '');
  if (!text) return '""';
  if (/^[A-Za-z0-9_./:\\-]+$/.test(text)) return text;
  return `"${text.replace(/(["`$\\])/g, '\\$1')}"`;
}

function buildStartupCommand(command?: string, args?: string[]) {
  const binary = String(command || '').trim();
  if (!binary) return '';
  const commandArgs = Array.isArray(args)
    ? args.map((arg) => String(arg || '').trim()).filter(Boolean)
    : [];
  return [binary, ...commandArgs.map(shellEscapeArg)].join(' ').trim();
}

function toErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error || 'unknown error');
}

function createFallbackPty() {
  const emitter = new EventEmitter();
  let running = true;
  return {
    pid: -1,
    write(data: string) {
      if (!running) return;
      const text = String(data || '');
      if (!text) return;
      emitter.emit('data', text);
    },
    resize() {
      // no-op in fallback mode
    },
    kill() {
      if (!running) return;
      running = false;
      emitter.emit('exit', { exitCode: 0, signal: 0 });
    },
    onData(listener: (data: string) => void) {
      emitter.on('data', listener);
    },
    onExit(listener: (event: { exitCode: number; signal?: number }) => void) {
      emitter.on('exit', listener);
    },
  } satisfies PtyLike;
}

let spawnPtyFn:
  | ((file: string, args: string[], options: Record<string, unknown>) => PtyLike)
  | null = null;

function ensurePtySpawn() {
  if (spawnPtyFn) return spawnPtyFn;
  const req = eval('require') as NodeRequire;
  const loaded = req('node-pty') as {
    spawn: (file: string, args: string[], options: Record<string, unknown>) => PtyLike;
  };
  spawnPtyFn = loaded.spawn;
  return spawnPtyFn;
}

function normalizeBuffer(value: string) {
  if (value.length <= MAX_BUFFER_CHARS) return value;
  return value.slice(value.length - MAX_BUFFER_CHARS);
}

function serializeSession(session: TerminalSessionState) {
  return {
    sessionId: session.sessionId,
    profileId: session.profileId,
    name: session.name,
    startupCommand: session.startupCommand,
    running: session.running,
    pid: session.pty?.pid || null,
    cwd: session.cwd,
    shell: session.shell,
    degraded: session.degraded,
    fallbackReason: session.fallbackReason,
    createdAt: session.createdAt,
    lastActivityAt: session.lastActivityAt,
    exitCode: session.exitCode,
  };
}

function cleanupStaleSessions() {
  const sessions = getSessionsStore();
  const now = Date.now();
  for (const [sessionId, session] of sessions.entries()) {
    if (session.running) continue;
    const age = now - new Date(session.lastActivityAt).getTime();
    if (age <= STALE_SESSION_MS) continue;
    sessions.delete(sessionId);
    if (global.__repoStudioActiveTerminalSessionId__ === sessionId) {
      global.__repoStudioActiveTerminalSessionId__ = undefined;
    }
  }
}

function touchSession(session: TerminalSessionState) {
  session.lastActivityAt = nowIso();
}

export function startTerminalSession(input: {
  reuse?: boolean;
  cwd?: string;
  cols?: number;
  rows?: number;
  command?: string;
  args?: string[];
  profileId?: string;
  name?: string;
  setActive?: boolean;
} = {}) {
  cleanupStaleSessions();
  const sessions = getSessionsStore();
  const activeSessionId = global.__repoStudioActiveTerminalSessionId__;
  const activeSession = activeSessionId ? sessions.get(activeSessionId) : null;

  if (input.reuse !== false && activeSession?.running) {
    touchSession(activeSession);
    return {
      ok: true,
      reused: true,
      session: serializeSession(activeSession),
    };
  }

  const cwd = String(input.cwd || '').trim() || resolveRepoRoot();
  const cols = Number.isInteger(input.cols) ? Math.max(20, Number(input.cols)) : 120;
  const rows = Number.isInteger(input.rows) ? Math.max(8, Number(input.rows)) : 32;
  const shell = resolveShell();
  const startupCommand = buildStartupCommand(input.command, input.args);
  const profileId = String(input.profileId || '').trim() || (startupCommand ? 'command' : 'shell');
  const sessionName = String(input.name || '').trim() || (startupCommand ? startupCommand : profileId);
  let degraded = false;
  let fallbackReason: string | null = null;
  let pty: PtyLike;
  try {
    pty = ensurePtySpawn()(shell.shell, shell.args, {
      name: 'xterm-color',
      cwd,
      cols,
      rows,
      env: {
        ...process.env,
        TERM: process.env.TERM || 'xterm-256color',
      },
    });
  } catch (error) {
    degraded = true;
    fallbackReason = toErrorMessage(error);
    pty = createFallbackPty();
  }

  const degradedBanner = degraded
    ? `[terminal fallback] PTY unavailable; running in degraded mode.\r\n${fallbackReason}\r\n`
    : '';

  const session: TerminalSessionState = {
    sessionId: randomUUID(),
    profileId,
    name: sessionName,
    startupCommand,
    shell: shell.shell,
    cwd,
    pty,
    degraded,
    fallbackReason,
    createdAt: nowIso(),
    lastActivityAt: nowIso(),
    running: true,
    exitCode: null,
    buffer: degradedBanner,
    emitter: new EventEmitter(),
  };

  pty.onData((chunk) => {
    const text = String(chunk || '');
    if (!text) return;
    touchSession(session);
    session.buffer = normalizeBuffer(`${session.buffer}${text}`);
    session.emitter.emit('output', text);
  });

  pty.onExit(({ exitCode }) => {
    session.running = false;
    session.exitCode = Number.isInteger(exitCode) ? Number(exitCode) : null;
    touchSession(session);
    session.emitter.emit('exit', {
      exitCode: session.exitCode,
      session: serializeSession(session),
    });
  });

  sessions.set(session.sessionId, session);
  if (input.setActive !== false) {
    global.__repoStudioActiveTerminalSessionId__ = session.sessionId;
  }
  if (startupCommand) {
    session.pty.write(`${startupCommand}\r`);
  }
  return {
    ok: true,
    reused: false,
    session: serializeSession(session),
    message: degraded
      ? 'Terminal started in fallback mode (PTY unavailable).'
      : 'Terminal session started.',
  };
}

export function listTerminalSessions() {
  cleanupStaleSessions();
  const sessions = [...getSessionsStore().values()]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map((session) => serializeSession(session));
  return {
    ok: true,
    activeSessionId: global.__repoStudioActiveTerminalSessionId__ || null,
    sessions,
  };
}

export function getTerminalSession(sessionId: string) {
  const session = getSessionsStore().get(String(sessionId || '').trim());
  if (!session) return null;
  return {
    session: serializeSession(session),
    buffer: session.buffer,
  };
}

export function writeTerminalInput(sessionId: string, data: string) {
  const session = getSessionsStore().get(String(sessionId || '').trim());
  if (!session) {
    return { ok: false, message: `Unknown terminal session: ${sessionId}` };
  }
  if (!session.running) {
    return { ok: false, message: `Terminal session ${sessionId} is stopped.` };
  }
  session.pty.write(String(data || ''));
  touchSession(session);
  return { ok: true };
}

export function resizeTerminalSession(sessionId: string, cols: number, rows: number) {
  const session = getSessionsStore().get(String(sessionId || '').trim());
  if (!session) {
    return { ok: false, message: `Unknown terminal session: ${sessionId}` };
  }
  if (!session.running) {
    return { ok: false, message: `Terminal session ${sessionId} is stopped.` };
  }
  session.pty.resize(Math.max(20, Math.floor(cols)), Math.max(8, Math.floor(rows)));
  touchSession(session);
  return { ok: true };
}

export function stopTerminalSession(sessionId: string) {
  const normalized = String(sessionId || '').trim();
  const sessions = getSessionsStore();
  const session = sessions.get(normalized);
  if (!session) {
    return {
      ok: true,
      stopped: false,
      message: `Terminal session ${sessionId} is already stopped.`,
      session: null,
    };
  }

  if (session.running) {
    try {
      session.pty.kill();
    } catch {
      // no-op
    }
    session.running = false;
    touchSession(session);
  }

  sessions.delete(normalized);
  if (global.__repoStudioActiveTerminalSessionId__ === normalized) {
    global.__repoStudioActiveTerminalSessionId__ = undefined;
  }

  return {
    ok: true,
    stopped: true,
    message: `Terminal session ${sessionId} stopped.`,
    session: serializeSession(session),
  };
}

export function subscribeTerminalSession(
  sessionId: string,
  callbacks: {
    onOutput: (chunk: string) => void;
    onExit: (payload: { exitCode: number | null; session: ReturnType<typeof serializeSession> }) => void;
  },
) {
  const session = getSessionsStore().get(String(sessionId || '').trim());
  if (!session) return null;
  const handleOutput = (chunk: string) => callbacks.onOutput(chunk);
  const handleExit = (payload: { exitCode: number | null; session: ReturnType<typeof serializeSession> }) => callbacks.onExit(payload);

  session.emitter.on('output', handleOutput);
  session.emitter.on('exit', handleExit);
  return () => {
    session.emitter.off('output', handleOutput);
    session.emitter.off('exit', handleExit);
  };
}
