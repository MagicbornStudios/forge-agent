import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

import { ensureDir, readJson, writeJson } from './io.mjs';

export const REPO_STUDIO_RUNTIME_PATH = path.join(process.cwd(), '.repo-studio', 'runtime.json');
export const REPO_STUDIO_RUNS_DIR = path.join(process.cwd(), '.repo-studio', 'runs');
export const REPO_STUDIO_APP_DEFAULT_PORT = 3010;
export const REPO_STUDIO_PACKAGE_DEFAULT_PORT = 3864;
export const REPO_STUDIO_DESKTOP_DEFAULT_PORT = 3020;

const RUNTIME_MODES = new Set(['app', 'package', 'desktop']);

function normalizeWorkspaceRoot(value) {
  return path.resolve(String(value || process.cwd())).replace(/\\/g, '/').toLowerCase();
}

function normalizeRuntimeMode(value) {
  const mode = String(value || 'package').trim().toLowerCase();
  return RUNTIME_MODES.has(mode) ? mode : 'package';
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
  if (!state || typeof state !== 'object') return null;
  const mode = normalizeRuntimeMode(state.mode);
  const portCandidate = mode === 'desktop'
    ? Number(state?.desktop?.appPort || state.port || 0)
    : Number(state.port || 0);
  if (!Number.isFinite(portCandidate) || portCandidate <= 0) return null;
  return `http://127.0.0.1:${portCandidate}`;
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

function normalizeDesktopMetadata(value = {}) {
  return {
    appPort: Number(value.appPort || 0),
    serverPid: Number(value.serverPid || 0),
    electronPid: Number(value.electronPid || 0),
    serverMode: String(value.serverMode || ''),
    watcher: value.watcher && typeof value.watcher === 'object' ? value.watcher : null,
    sqlite: value.sqlite && typeof value.sqlite === 'object' ? value.sqlite : null,
  };
}

function normalizeRuntimeState(state) {
  const mode = normalizeRuntimeMode(state?.mode);
  const desktop = mode === 'desktop' ? normalizeDesktopMetadata(state?.desktop || {}) : null;
  const normalized = {
    pid: Number(state?.pid || process.pid),
    port: Number(state?.port || 0),
    mode,
    startedAt: String(state?.startedAt || new Date().toISOString()),
    workspaceRoot: String(state?.workspaceRoot || process.cwd()),
    view: String(state?.view || 'planning'),
    profile: String(state?.profile || 'forge-loop'),
    ...(desktop ? { desktop } : {}),
  };
  return {
    ...normalized,
    url: runtimeUrlFor(normalized),
  };
}

export async function readRuntimeState() {
  const state = await readJson(REPO_STUDIO_RUNTIME_PATH, null);
  if (!state || typeof state !== 'object') return null;
  return normalizeRuntimeState(state);
}

export async function writeRuntimeState(state) {
  const normalized = normalizeRuntimeState(state || {});
  const persisted = {
    pid: normalized.pid,
    port: normalized.port,
    mode: normalized.mode,
    startedAt: normalized.startedAt,
    workspaceRoot: normalized.workspaceRoot,
    view: normalized.view,
    profile: normalized.profile,
    ...(normalized.desktop ? { desktop: normalized.desktop } : {}),
  };
  await writeJson(REPO_STUDIO_RUNTIME_PATH, persisted);
  return normalized;
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

function isDesktopRuntimeHealthy(state) {
  const electronPid = Number(state?.desktop?.electronPid || state?.pid || 0);
  const serverPid = Number(state?.desktop?.serverPid || 0);
  const appPort = Number(state?.desktop?.appPort || state?.port || 0);
  const electronAlive = isProcessAlive(electronPid);
  const serverAlive = isProcessAlive(serverPid);
  const listeningPid = findListeningPidByPort(appPort);
  const portAlive = Number.isInteger(listeningPid) && listeningPid > 0;
  const running = electronAlive || serverAlive || portAlive;
  return {
    running,
    details: {
      electronAlive,
      serverAlive,
      portAlive,
      listeningPid: listeningPid || null,
    },
  };
}

function isRuntimeHealthy(state) {
  const mode = normalizeRuntimeMode(state?.mode);
  if (mode === 'desktop') return isDesktopRuntimeHealthy(state);
  const pidAlive = isProcessAlive(state?.pid);
  const listeningPid = findListeningPidByPort(state?.port);
  const runtimeMatchesPort = Number.isInteger(listeningPid) && Number(listeningPid) === Number(state?.pid);
  return {
    running: pidAlive && runtimeMatchesPort,
    details: {
      pidAlive,
      runtimeMatchesPort,
      listeningPid: listeningPid || null,
    },
  };
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

  const health = isRuntimeHealthy(state);
  if (health.running) {
    return {
      running: true,
      state,
      stale: false,
      health: health.details,
    };
  }

  if (options.cleanupStale !== false) {
    await clearRuntimeState();
  }

  return {
    running: false,
    state,
    stale: true,
    health: health.details,
  };
}

export async function detectRuntimeByPort(options = {}) {
  const mode = normalizeRuntimeMode(options.mode === 'app' ? 'app' : 'package');
  const port = Number(
    options.port
    || (mode === 'app' ? REPO_STUDIO_APP_DEFAULT_PORT : REPO_STUDIO_PACKAGE_DEFAULT_PORT),
  );
  const pid = findListeningPidByPort(port);
  if (!pid || !isProcessAlive(pid)) {
    return null;
  }

  const state = normalizeRuntimeState({
    pid,
    port,
    mode,
    startedAt: new Date().toISOString(),
    workspaceRoot: process.cwd(),
    view: 'planning',
    profile: 'forge-loop',
  });

  return state;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function stopProcessTree(pid) {
  const numeric = Number(pid);
  if (!Number.isInteger(numeric) || numeric <= 0) {
    return { ok: false, message: 'Invalid PID.', stdout: '', stderr: '' };
  }

  if (process.platform === 'win32') {
    const result = spawnSync('taskkill', ['/PID', String(numeric), '/T', '/F'], {
      encoding: 'utf8',
    });
    const stderr = String(result.stderr || '').trim();
    const stdout = String(result.stdout || '').trim();
    if (result.status === 0) {
      await sleep(160);
      if (isProcessAlive(numeric)) {
        return {
          ok: false,
          stdout,
          stderr: `${stderr}\nPID still alive after taskkill.`.trim(),
        };
      }
      return { ok: true, stdout, stderr };
    }
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
    // ignore if already gone
  }
  return { ok: true, stdout: '', stderr: '' };
}

function gatherDesktopPids(runtime) {
  const pids = new Set();
  const primary = Number(runtime?.pid || 0);
  const electronPid = Number(runtime?.desktop?.electronPid || 0);
  const serverPid = Number(runtime?.desktop?.serverPid || 0);
  for (const pid of [primary, electronPid, serverPid]) {
    if (Number.isInteger(pid) && pid > 0) pids.add(pid);
  }
  return [...pids];
}

export async function stopRuntime(options = {}) {
  const requestedMode = options.mode ? normalizeRuntimeMode(options.mode) : null;
  const runtime = await readRuntimeState();
  if (!runtime) {
    const fallbackMode = requestedMode && requestedMode !== 'desktop' ? requestedMode : 'app';
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

  if (requestedMode && runtime.mode !== requestedMode) {
    return {
      ok: false,
      running: true,
      stopped: false,
      message: `Runtime mode mismatch: running ${runtime.mode}, requested ${requestedMode}.`,
      state: runtime,
    };
  }

  const targetPids = runtime.mode === 'desktop'
    ? gatherDesktopPids(runtime)
    : [Number(runtime.pid || 0)].filter((pid) => Number.isInteger(pid) && pid > 0);

  const results = [];
  for (const pid of targetPids) {
    // eslint-disable-next-line no-await-in-loop
    const outcome = await stopProcessTree(pid);
    results.push({ pid, ...outcome });
  }

  const alive = targetPids.filter((pid) => isProcessAlive(pid));
  if (alive.length > 0) {
    return {
      ok: false,
      running: true,
      stopped: false,
      message: `Runtime PID(s) still alive after stop attempt: ${alive.join(', ')}.`,
      stdout: results.map((item) => item.stdout).filter(Boolean).join('\n'),
      stderr: results.map((item) => item.stderr).filter(Boolean).join('\n'),
      state: runtime,
    };
  }

  await clearRuntimeState();
  return {
    ok: true,
    running: false,
    stopped: true,
    message: runtime.mode === 'desktop'
      ? `Stopped RepoStudio desktop runtime (electron pid ${runtime.desktop?.electronPid || runtime.pid}).`
      : `Stopped RepoStudio runtime pid ${runtime.pid}.`,
    stdout: results.map((item) => item.stdout).filter(Boolean).join('\n'),
    stderr: results.map((item) => item.stderr).filter(Boolean).join('\n'),
    state: runtime,
  };
}

export function isSameWorkspace(runtimeState, cwd = process.cwd()) {
  if (!runtimeState?.workspaceRoot) return true;
  return normalizeWorkspaceRoot(runtimeState.workspaceRoot) === normalizeWorkspaceRoot(cwd);
}

