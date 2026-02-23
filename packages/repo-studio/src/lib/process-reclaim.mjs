import fs from 'node:fs/promises';
import path from 'node:path';

import { readJson } from './io.mjs';
import { buildProcessInventory } from './process-inventory.mjs';
import {
  REPO_STUDIO_APP_DEFAULT_PORT,
  REPO_STUDIO_PACKAGE_DEFAULT_PORT,
  REPO_STUDIO_DESKTOP_DEFAULT_PORT,
  findListeningPidByPort,
  stopProcessTree,
  isProcessAlive,
} from './runtime-manager.mjs';

export const RECLAIM_SCOPE_REPO_STUDIO = 'repo-studio';
export const RECLAIM_SCOPE_REPO = 'repo';
export const RECLAIM_SCOPES = new Set([RECLAIM_SCOPE_REPO_STUDIO, RECLAIM_SCOPE_REPO]);

const SAFE_PORTS = [
  REPO_STUDIO_APP_DEFAULT_PORT,
  REPO_STUDIO_PACKAGE_DEFAULT_PORT,
  REPO_STUDIO_DESKTOP_DEFAULT_PORT,
  3789,
];

const REPO_EXTRA_PORTS = [3000, 3001, 3002];

function normalizeScope(value) {
  const scope = String(value || RECLAIM_SCOPE_REPO_STUDIO).trim().toLowerCase();
  return RECLAIM_SCOPES.has(scope) ? scope : RECLAIM_SCOPE_REPO_STUDIO;
}

function normalizePort(value) {
  const port = Number(value);
  return Number.isInteger(port) && port > 0 ? port : null;
}

function normalizePortList(values = []) {
  return [...new Set(values.map((value) => normalizePort(value)).filter(Boolean))].sort((a, b) => a - b);
}

function portFromWsUrl(value) {
  if (!value) return null;
  try {
    const parsed = new URL(String(value));
    return normalizePort(parsed.port);
  } catch {
    return null;
  }
}

function runtimeStatePaths(repoRoot) {
  const root = path.resolve(String(repoRoot || process.cwd()));
  return {
    runtime: path.join(root, '.repo-studio', 'runtime.json'),
    codexRuntime: path.join(root, '.repo-studio', 'codex-runtime.json'),
    codexSession: path.join(root, '.repo-studio', 'codex-session.json'),
  };
}

export function resolveReclaimPorts(config = {}, scope = RECLAIM_SCOPE_REPO_STUDIO) {
  const normalizedScope = normalizeScope(scope);
  const codexPort = portFromWsUrl(config?.assistant?.codex?.appServerUrl);
  const configuredRuntimePort = normalizePort(config?.runtime?.defaultPort);
  const configuredDesktopPort = normalizePort(config?.runtime?.desktopDefaultPort);
  const ports = [
    ...SAFE_PORTS,
    configuredRuntimePort,
    configuredDesktopPort,
    codexPort,
  ];
  if (normalizedScope === RECLAIM_SCOPE_REPO) {
    ports.push(...REPO_EXTRA_PORTS);
  }
  return normalizePortList(ports);
}

function isRuntimeToolProcess(record) {
  const name = String(record?.name || '').toLowerCase();
  if (/(^|[\\/])(node|electron|esbuild)(\.exe)?$/.test(name)) return true;
  return /(node|electron|esbuild)/.test(name);
}

function isRepoStudioCandidate(record, safePorts, trackedPids) {
  const hasKnownSafePort = Array.isArray(record.knownPorts)
    && record.knownPorts.some((port) => safePorts.has(Number(port)));
  const tracked = trackedPids.has(Number(record.pid));
  if (record?.repoStudioOwned && (hasKnownSafePort || tracked)) return true;
  if (record?.repoOwned && hasKnownSafePort) return true;
  return false;
}

function dedupeReasons(reasons = []) {
  return [...new Set(reasons.map((value) => String(value || '').trim()).filter(Boolean))];
}

function normalizePidSet(values = []) {
  return new Set(
    values
      .map((value) => Number(value))
      .filter((value) => Number.isInteger(value) && value > 0),
  );
}

function addSkippedByPid(skipped, item) {
  const pid = Number(item?.pid || 0);
  if (!Number.isInteger(pid) || pid <= 0) return;
  if (skipped.some((entry) => Number(entry.pid) === pid && entry.reason === item.reason)) return;
  skipped.push(item);
}

async function readTrackedPids(paths) {
  const runtime = await readJson(paths.runtime, null);
  const codexRuntime = await readJson(paths.codexRuntime, null);
  const pids = normalizePidSet([
    runtime?.pid,
    runtime?.desktop?.electronPid,
    runtime?.desktop?.serverPid,
    codexRuntime?.pid,
  ]);
  return [...pids];
}

export async function buildReclaimPlan(options = {}) {
  const scope = normalizeScope(options.scope);
  const force = options.force === true;
  const dryRun = options.dryRun === true;
  const repoRoot = path.resolve(String(options.repoRoot || process.cwd()));
  const config = options.config || {};
  const safePorts = resolveReclaimPorts(config, RECLAIM_SCOPE_REPO_STUDIO);
  const knownPorts = Array.isArray(options.knownPorts)
    ? normalizePortList(options.knownPorts)
    : resolveReclaimPorts(config, scope);
  const paths = runtimeStatePaths(repoRoot);
  const trackedPids = normalizePidSet(
    Array.isArray(options.trackedPids)
      ? options.trackedPids
      : await readTrackedPids(paths),
  );

  const protectedPids = normalizePidSet([
    process.pid,
    process.ppid,
    ...(Array.isArray(options.excludePids) ? options.excludePids : []),
  ]);

  const inventory = options.inventory && typeof options.inventory === 'object'
    ? options.inventory
    : buildProcessInventory({
      repoRoot,
      knownPorts,
      pidByPortResolver: options.pidByPortResolver || findListeningPidByPort,
      processes: options.processes,
      platform: options.platform,
    });

  const safePortSet = new Set(safePorts);
  const knownPortSet = new Set(knownPorts);
  const targets = [];
  const skipped = [];

  for (const record of inventory.processes || []) {
    const pid = Number(record.pid || 0);
    if (!Number.isInteger(pid) || pid <= 0) continue;
    const ports = normalizePortList(record.knownPorts || []);
    const hasSafeKnownPort = ports.some((port) => safePortSet.has(port));
    const hasScopeKnownPort = ports.some((port) => knownPortSet.has(port));
    const matchedReasons = [];

    const repoStudioCandidate = isRepoStudioCandidate(
      { ...record, knownPorts: ports },
      safePortSet,
      trackedPids,
    );
    if (repoStudioCandidate) matchedReasons.push('repo-studio');

    if (scope === RECLAIM_SCOPE_REPO) {
      if (record.repoOwned && isRuntimeToolProcess(record)) {
        matchedReasons.push('repo-runtime-process');
      } else if (record.repoOwned && hasScopeKnownPort) {
        matchedReasons.push('repo-known-port');
      }
    }

    const reasons = dedupeReasons(matchedReasons);
    if (reasons.length === 0) {
      if (hasScopeKnownPort && !record.repoOwned) {
        addSkippedByPid(skipped, {
          ...record,
          knownPorts: ports,
          action: 'skip',
          reason: 'known-port-not-repo-owned',
        });
      }
      continue;
    }

    if (protectedPids.has(pid)) {
      addSkippedByPid(skipped, {
        ...record,
        knownPorts: ports,
        action: 'skip',
        reason: 'protected-pid',
      });
      continue;
    }

    targets.push({
      ...record,
      knownPorts: ports,
      action: dryRun ? 'would-kill' : 'kill',
      reason: reasons.join(','),
    });
  }

  targets.sort((a, b) => a.pid - b.pid);
  skipped.sort((a, b) => a.pid - b.pid);

  return {
    ok: true,
    scope,
    force,
    dryRun,
    repoRoot,
    knownPorts,
    safePorts,
    inventory,
    trackedPids: [...trackedPids].sort((a, b) => a - b),
    protectedPids: [...protectedPids].sort((a, b) => a - b),
    targets,
    skipped,
    paths,
  };
}

async function unlinkIfExists(filePath) {
  try {
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return false;
    }
    throw error;
  }
}

export async function clearReclaimStateFiles(options = {}) {
  const paths = runtimeStatePaths(options.repoRoot || process.cwd());
  const removed = [];
  if (await unlinkIfExists(paths.runtime)) removed.push(paths.runtime);
  if (await unlinkIfExists(paths.codexRuntime)) removed.push(paths.codexRuntime);
  if (options.includeCodexSession === true && await unlinkIfExists(paths.codexSession)) {
    removed.push(paths.codexSession);
  }
  return {
    ok: true,
    removed,
  };
}

export async function executeReclaimPlan(plan, options = {}) {
  const normalizedPlan = plan && typeof plan === 'object' ? plan : null;
  if (!normalizedPlan) {
    return {
      ok: false,
      dryRun: false,
      stopped: [],
      failed: [],
      clearedState: { ok: true, removed: [] },
      message: 'Missing reclaim plan.',
    };
  }

  if (normalizedPlan.dryRun === true) {
    return {
      ok: true,
      dryRun: true,
      stopped: [],
      failed: [],
      clearedState: { ok: true, removed: [] },
      message: `Dry-run: ${normalizedPlan.targets.length} process(es) would be reclaimed.`,
    };
  }

  const stopFn = typeof options.stopProcessTree === 'function'
    ? options.stopProcessTree
    : stopProcessTree;
  const isAliveFn = typeof options.isProcessAlive === 'function'
    ? options.isProcessAlive
    : isProcessAlive;

  const stopped = [];
  const failed = [];
  for (const target of normalizedPlan.targets) {
    // eslint-disable-next-line no-await-in-loop
    const outcome = await stopFn(target.pid);
    const stillAlive = isAliveFn(target.pid);
    const ok = outcome?.ok === true && !stillAlive;
    const entry = {
      ...target,
      ok,
      alive: stillAlive,
      stdout: String(outcome?.stdout || ''),
      stderr: String(outcome?.stderr || ''),
    };
    if (ok) {
      stopped.push(entry);
    } else {
      failed.push(entry);
    }
  }

  const clearedState = stopped.length > 0 && failed.length === 0
    ? await clearReclaimStateFiles({
      repoRoot: normalizedPlan.repoRoot,
      includeCodexSession: true,
    })
    : { ok: true, removed: [] };

  const ok = failed.length === 0;
  const message = ok
    ? `Reclaimed ${stopped.length} process(es).`
    : `Failed to reclaim ${failed.length} process(es); reclaimed ${stopped.length}.`;

  return {
    ok,
    dryRun: false,
    stopped,
    failed,
    clearedState,
    message,
  };
}
