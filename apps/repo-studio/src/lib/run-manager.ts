import { randomUUID } from 'node:crypto';
import { spawn, spawnSync, type ChildProcess } from 'node:child_process';
import { EventEmitter } from 'node:events';

type RunStatus = 'running' | 'completed' | 'failed' | 'stopped';

export type RepoRun = {
  id: string;
  commandId: string;
  command: string;
  status: RunStatus;
  code: number | null;
  startedAt: string;
  endedAt: string | null;
  output: Array<{ ts: string; stream: 'stdout' | 'stderr'; text: string }>;
  emitter: EventEmitter;
  child: ChildProcess | null;
};

type RepoRunStore = Map<string, RepoRun>;

declare global {
  // eslint-disable-next-line no-var
  var __repoStudioRunStore__: RepoRunStore | undefined;
}

function getStore(): RepoRunStore {
  if (!global.__repoStudioRunStore__) {
    global.__repoStudioRunStore__ = new Map();
  }
  return global.__repoStudioRunStore__;
}

function nowIso() {
  return new Date().toISOString();
}

function spawnShell(commandText: string) {
  if (process.platform === 'win32') {
    return spawn('cmd.exe', ['/d', '/s', '/c', commandText], {
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    });
  }
  return spawn('sh', ['-lc', commandText], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function appendOutput(run: RepoRun, stream: 'stdout' | 'stderr', chunk: Buffer | string) {
  const text = String(chunk || '');
  if (!text) return;
  const record = { ts: nowIso(), stream, text };
  run.output.push(record);
  run.emitter.emit('output', record);
}

function setFinished(run: RepoRun, status: RunStatus, code: number | null) {
  run.status = status;
  run.code = code;
  run.endedAt = nowIso();
  run.child = null;
  run.emitter.emit('end', {
    id: run.id,
    status: run.status,
    code: run.code,
    endedAt: run.endedAt,
  });
}

export function startRepoRun(commandId: string, commandText: string) {
  const run: RepoRun = {
    id: randomUUID(),
    commandId,
    command: commandText,
    status: 'running',
    code: null,
    startedAt: nowIso(),
    endedAt: null,
    output: [],
    emitter: new EventEmitter(),
    child: null,
  };

  const child = spawnShell(commandText);
  run.child = child;

  child.stdout.on('data', (chunk) => appendOutput(run, 'stdout', chunk));
  child.stderr.on('data', (chunk) => appendOutput(run, 'stderr', chunk));
  child.on('error', (error) => {
    appendOutput(run, 'stderr', String(error?.message || error));
    setFinished(run, 'failed', 1);
  });
  child.on('exit', (exitCode) => {
    if (run.status === 'stopped') return;
    const code = Number.isInteger(exitCode) ? Number(exitCode) : 1;
    setFinished(run, code === 0 ? 'completed' : 'failed', code);
  });

  getStore().set(run.id, run);
  return run;
}

function stopPidTree(pid: number) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  if (process.platform === 'win32') {
    const result = spawnSync('taskkill', ['/PID', String(pid), '/T', '/F'], { encoding: 'utf8' });
    return result.status === 0;
  }
  try {
    process.kill(pid, 'SIGTERM');
    return true;
  } catch {
    return false;
  }
}

export function stopRepoRun(runId: string) {
  const run = getStore().get(runId);
  if (!run) return { ok: false, message: `Unknown run id: ${runId}` };
  if (run.status !== 'running' || !run.child?.pid) {
    return { ok: true, run, message: `Run ${runId} is not active.` };
  }

  const stopped = stopPidTree(run.child.pid);
  if (stopped) {
    setFinished(run, 'stopped', null);
    return { ok: true, run, message: `Stopped run ${runId}.` };
  }
  return { ok: false, run, message: `Unable to stop run ${runId}.` };
}

export function getRepoRun(runId: string) {
  return getStore().get(runId) || null;
}

export function serializeRun(run: RepoRun) {
  return {
    id: run.id,
    commandId: run.commandId,
    command: run.command,
    status: run.status,
    code: run.code,
    startedAt: run.startedAt,
    endedAt: run.endedAt,
    output: run.output,
  };
}
