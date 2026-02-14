import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

import { ensureDir, readJson, writeJson } from './io.mjs';

export const REPO_STUDIO_RUNTIME_PATH = path.join(process.cwd(), '.repo-studio', 'runtime.json');
export const REPO_STUDIO_RUNS_DIR = path.join(process.cwd(), '.repo-studio', 'runs');
export const REPO_STUDIO_APP_DEFAULT_PORT = 3010;
export const REPO_STUDIO_PACKAGE_DEFAULT_PORT = 3864;

function normalizeWorkspaceRoot(value) {
  return path.resolve(String(value || process.cwd())).replace(/\\/g, '/').toLowerCase();
}

function parseNetstatPid(line, port) {
  const text = String(line || '').trim();
  if (!text) return null;
  const portPattern = new RegExp(`[:.]${port}\\s+`);
  if (!portPattern.test(text)) return null;
  const columns = text.split(/\s+/);
  const pid = Number(columns[columns.length - 1] || 0);
  if (!Number.isInteger(pid) || pid <= 0) return null;
  return pid;
}

export function findListeningPidByPort(port) {
  const numeric = Number(port);
  if (!Number.isInteger(numeric) || numeric <= 0) return null;

  if (process.platform === 'win32') {
    const result = spawnSync('netstat', ['-ano', '-p', 'tcp'], { encoding: 'utf8' });
    const lines = String(result.stdout || '').split(/\r?\n/);
    for (const line of lines) {
      if (!/LISTENING/i.test(line)) continue;
      const pid = parseNetstatPid(line, numeric);
      if (pid) return pid;
    }
    return null;
  }

  const lsof = spawnSync('lsof', ['-nP', `-iTCP:${numeric}`, '-sTCP:LISTEN', '-t'], { encoding: 'utf8' });
  const candidate = Number(String(lsof.stdout || '').trim().split(/\s+/)[0] || 0);
  if (Number.isInteger(candidate) && candidate > 0) return candidate;
  return null;
}

export function runtimeUrlFor(state) {
  const port = Number(state?.port || 0);
  if (!Number.isFinite(port) || port <= 0) return null;
  return `http://127.0.0.1:${port}`;
}

export function isProcessAlive(pid) {
  const numeric = Number(pid);
  if (!Number.isInteger(numeric) || numeric <= 0) return false;

  if (process.platform === 'win32') {
    const result = spawnSync('tasklist', ['/FI', `PID eq ${numeric}`, '/FO', 'CSV', '/NH'], {
      encoding: 'utf8',
    });
    if (result.status !== 0) return false;
    const stdout = String(result.stdout || '').trim();
    if (!stdout) return false;
    if (/no tasks are running/i.test(stdout)) return false;
    const lines = stdout.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    return lines.some((line) => line.startsWith('"') && line.includes(`,"${numeric}",`));
  }

  try {
    process.kill(numeric, 0);
    return true;
  } catch {
    return false;
  }
}

export async function readRuntimeState() {
  const state = await readJson(REPO_STUDIO_RUNTIME_PATH, null);
  if (!state || typeof state !== 'object') return null;
  return {
    ...state,
    url: runtimeUrlFor(state),
  };
}

export async function writeRuntimeState(state) {
  const normalized = {
    pid: Number(state?.pid || process.pid),
    port: Number(state?.port || 0),
    mode: state?.mode === 'app' ? 'app' : 'package',
    startedAt: String(state?.startedAt || new Date().toISOString()),
    workspaceRoot: String(state?.workspaceRoot || process.cwd()),
    view: String(state?.view || 'planning'),
    profile: String(state?.profile || 'forge-loop'),
  };
  await writeJson(REPO_STUDIO_RUNTIME_PATH, normalized);
  return {
    ...normalized,
    url: runtimeUrlFor(normalized),
  };
}

export async function clearRuntimeState() {
  try {
    await fs.unlink(REPO_STUDIO_RUNTIME_PATH);
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return;
    }
    throw error;
  }
}

export async function ensureRunLogsDir() {
  await ensureDir(REPO_STUDIO_RUNS_DIR);
  return REPO_STUDIO_RUNS_DIR;
}

export async function loadActiveRuntimeState(options = {}) {
  const state = await readRuntimeState();
  if (!state) {
    return {
      running: false,
      state: null,
      stale: false,
    };
  }

  const pidAlive = isProcessAlive(state.pid);
  const listeningPid = findListeningPidByPort(state.port);
  const runtimeMatchesPort = Number.isInteger(listeningPid) && Number(listeningPid) === Number(state.pid);

  if (pidAlive && runtimeMatchesPort) {
    return {
      running: true,
      state,
      stale: false,
    };
  }

  if (options.cleanupStale !== false) {
    await clearRuntimeState();
  }

  return {
    running: false,
    state,
    stale: true,
  };
}

export async function detectRuntimeByPort(options = {}) {
  const mode = options.mode === 'app' ? 'app' : 'package';
  const port = Number(options.port || (mode === 'app' ? REPO_STUDIO_APP_DEFAULT_PORT : REPO_STUDIO_PACKAGE_DEFAULT_PORT));
  const pid = findListeningPidByPort(port);
  if (!pid || !isProcessAlive(pid)) {
    return null;
  }

  return {
    pid,
    port,
    mode,
    startedAt: new Date().toISOString(),
    workspaceRoot: process.cwd(),
    view: 'planning',
    profile: 'forge-loop',
    url: runtimeUrlFor({ port }),
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function stopProcessTree(pid) {
  const numeric = Number(pid);
  if (!Number.isInteger(numeric) || numeric <= 0) {
    return { ok: false, message: 'Invalid PID.' };
  }

  if (process.platform === 'win32') {
    const result = spawnSync('taskkill', ['/PID', String(numeric), '/T', '/F'], {
      encoding: 'utf8',
    });
    const stderr = String(result.stderr || '').trim();
    const stdout = String(result.stdout || '').trim();
    if (result.status === 0) {
      await sleep(150);
      if (isProcessAlive(numeric)) {
        return { ok: false, stdout, stderr: `${stderr}\nPID still alive after taskkill.`.trim() };
      }
      return { ok: true, stdout, stderr };
    }
    // "process not found" from taskkill should be treated as already-stopped.
    if (/not found|no running instance/i.test(`${stdout}\n${stderr}`)) {
      return { ok: true, stdout, stderr };
    }
    return { ok: false, stdout, stderr };
  }

  try {
    process.kill(numeric, 'SIGTERM');
  } catch {
    return { ok: true, stdout: '', stderr: '' };
  }

  const timeoutAt = Date.now() + 2000;
  while (Date.now() < timeoutAt) {
    if (!isProcessAlive(numeric)) {
      return { ok: true, stdout: '', stderr: '' };
    }
    // eslint-disable-next-line no-await-in-loop
    await sleep(50);
  }

  try {
    process.kill(numeric, 'SIGKILL');
  } catch {
    // Ignore if already gone.
  }
  return { ok: true, stdout: '', stderr: '' };
}

export async function stopRuntime(options = {}) {
  const runtime = await readRuntimeState();
  if (!runtime) {
    const fallbackMode = options.mode === 'app' ? 'app' : 'package';
    const fallback = await detectRuntimeByPort({
      mode: fallbackMode,
      port: options.port,
    });
    if (fallback) {
      const stopped = await stopProcessTree(fallback.pid);
      return {
        ok: stopped.ok,
        running: false,
        stopped: stopped.ok,
        message: stopped.ok
          ? `Stopped untracked RepoStudio runtime on port ${fallback.port} (pid ${fallback.pid}).`
          : `Failed to stop untracked runtime on port ${fallback.port}.`,
        stdout: stopped.stdout,
        stderr: stopped.stderr,
        state: fallback,
      };
    }

    return {
      ok: true,
      running: false,
      message: 'RepoStudio is not running.',
      stopped: false,
    };
  }

  if (options.mode && runtime.mode !== options.mode) {
    return {
      ok: false,
      running: true,
      stopped: false,
      message: `Runtime mode mismatch: running ${runtime.mode}, requested ${options.mode}.`,
      state: runtime,
    };
  }

  if (!isProcessAlive(runtime.pid)) {
    await clearRuntimeState();
    return {
      ok: true,
      running: false,
      stopped: true,
      stale: true,
      message: 'Removed stale runtime state file.',
      state: runtime,
    };
  }

  const stopped = await stopProcessTree(runtime.pid);
  if (!stopped.ok) {
    return {
      ok: false,
      running: true,
      stopped: false,
      message: `Failed to stop runtime pid ${runtime.pid}.`,
      stdout: stopped.stdout,
      stderr: stopped.stderr,
      state: runtime,
    };
  }

  if (isProcessAlive(runtime.pid)) {
    return {
      ok: false,
      running: true,
      stopped: false,
      message: `Runtime pid ${runtime.pid} is still alive after stop attempt.`,
      stdout: stopped.stdout,
      stderr: stopped.stderr,
      state: runtime,
    };
  }

  await clearRuntimeState();
  return {
    ok: true,
    running: false,
    stopped: true,
    message: `Stopped RepoStudio runtime pid ${runtime.pid}.`,
    stdout: stopped.stdout,
    stderr: stopped.stderr,
    state: runtime,
  };
}

export function isSameWorkspace(runtimeState, cwd = process.cwd()) {
  if (!runtimeState?.workspaceRoot) return true;
  return normalizeWorkspaceRoot(runtimeState.workspaceRoot) === normalizeWorkspaceRoot(cwd);
}
