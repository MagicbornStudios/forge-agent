import fs from 'node:fs';
import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import {
  firstExistingPath,
  getActualInstallLocation,
  resolveKnownInstallDirectories,
  resolveInstalledExeCandidates,
} from './install-locations.mjs';
import { runRepairInstall } from './repair-install.mjs';

const REQUIRED_INSTALL_PATHS = [
  'RepoStudio.exe',
  'Uninstall RepoStudio.exe',
  path.join('resources', 'app.asar'),
  path.join('resources', 'next', 'BUILD_ID'),
  path.join('resources', 'next', 'standalone', 'server.js'),
  path.join('resources', 'next', 'standalone', 'node_modules', 'next', 'package.json'),
  path.join('resources', 'next', 'standalone', 'node_modules', 'next', 'dist', 'server', 'next.js'),
];

function resolvePackageRoot() {
  const currentFile = fileURLToPath(import.meta.url);
  return path.resolve(path.dirname(currentFile), '..', '..');
}

function defaultTimeoutMs(kind) {
  return kind === 'attended' ? 180000 : 600000;
}

function defaultIdleTimeoutMs(kind) {
  return kind === 'attended' ? 30000 : 180000;
}

function parseArgs(argv = process.argv.slice(2)) {
  const args = new Map();
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const next = argv[index + 1];
    if (next && !next.startsWith('--')) {
      args.set(key, next);
      index += 1;
      continue;
    }
    args.set(key, true);
  }
  const kind = String(args.get('kind') || 'silent');
  return {
    kind,
    installDir: String(args.get('install-dir') || '').trim(),
    timeoutMs: Number(args.get('timeout-ms') || defaultTimeoutMs(kind)),
    idleTimeoutMs: Number(args.get('idle-timeout-ms') || defaultIdleTimeoutMs(kind)),
    pollIntervalMs: Number(args.get('poll-interval-ms') || 5000),
    currentUser: args.get('current-user') !== 'false',
    keepInstallDir: args.get('keep-install-dir') === true,
    launch: args.get('launch') === true,
    launchAnyway: args.get('launch-anyway') === true,
    port: Number(args.get('port') || 3020),
    healthTimeoutMs: Number(args.get('health-timeout-ms') || 120000),
    repairExisting: args.get('repair-existing') === true,
  };
}

function resolveArtifactPath(packageRoot, kind) {
  const distRoot = path.join(packageRoot, 'dist', 'desktop');
  if (!fs.existsSync(distRoot)) {
    throw new Error(`Desktop dist directory not found: ${distRoot}`);
  }

  const patterns = kind === 'attended'
    ? [/^RepoStudio Setup .*\.exe$/i]
    : [/^RepoStudio Silent Setup .*\.exe$/i];

  const candidates = fs.readdirSync(distRoot)
    .filter((name) => patterns.some((pattern) => pattern.test(name)))
    .map((name) => ({
      name,
      fullPath: path.join(distRoot, name),
      mtimeMs: fs.statSync(path.join(distRoot, name)).mtimeMs,
    }))
    .sort((a, b) => b.mtimeMs - a.mtimeMs);

  if (!candidates.length) {
    throw new Error(`No ${kind} installer found in ${distRoot}`);
  }

  return candidates[0].fullPath;
}

function defaultProbeInstallDir(kind) {
  return path.join(os.tmpdir(), kind === 'attended' ? 'RepoStudioInstallSmoke' : 'RepoStudioSilentInstallSmoke');
}

function normalizePath(input) {
  return path.resolve(String(input || '')).replace(/[\\/]+$/, '');
}

function uniquePaths(candidates = []) {
  const seen = new Set();
  const list = [];
  for (const candidate of candidates) {
    if (!candidate) continue;
    const normalized = normalizePath(candidate);
    const key = normalized.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    list.push(normalized);
  }
  return list;
}

async function waitForDelay(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function collectPathEntries(targetPath, limit = 200) {
  if (!fs.existsSync(targetPath)) {
    return [];
  }

  const entries = [];
  const queue = [targetPath];

  while (queue.length > 0 && entries.length < limit) {
    const current = queue.shift();
    const children = await fsp.readdir(current, { withFileTypes: true }).catch(() => []);
    for (const child of children) {
      const fullPath = path.join(current, child.name);
      entries.push(fullPath);
      if (entries.length >= limit) break;
      if (child.isDirectory()) {
        queue.push(fullPath);
      }
    }
  }

  return entries;
}

async function collectInstallSnapshot(installDir) {
  if (!fs.existsSync(installDir)) {
    return {
      fileCount: 0,
      totalBytes: 0,
      missingRequiredPaths: [...REQUIRED_INSTALL_PATHS],
      ready: false,
    };
  }

  let fileCount = 0;
  let totalBytes = 0;
  const queue = [installDir];

  while (queue.length > 0) {
    const current = queue.shift();
    const children = await fsp.readdir(current, { withFileTypes: true }).catch(() => []);
    for (const child of children) {
      const fullPath = path.join(current, child.name);
      if (child.isDirectory()) {
        queue.push(fullPath);
        continue;
      }
      if (!child.isFile()) continue;

      fileCount += 1;
      const stats = await fsp.stat(fullPath).catch(() => null);
      if (stats) {
        totalBytes += Number(stats.size || 0);
      }
    }
  }

  const missingRequiredPaths = REQUIRED_INSTALL_PATHS
    .map((relativePath) => ({
      relativePath,
      fullPath: path.join(installDir, relativePath),
    }))
    .filter(({ fullPath }) => !fs.existsSync(fullPath))
    .map(({ relativePath }) => relativePath);

  return {
    fileCount,
    totalBytes,
    missingRequiredPaths,
    ready: missingRequiredPaths.length === 0,
  };
}

function monitoredSnapshotsMatch(previous, current) {
  if (!previous || !current) return false;
  return previous.signature === current.signature;
}

async function collectMonitoredInstallSnapshot(monitorDirs = []) {
  const dirs = uniquePaths(monitorDirs);
  const snapshots = [];
  for (const dirPath of dirs) {
    // eslint-disable-next-line no-await-in-loop
    const snapshot = await collectInstallSnapshot(dirPath);
    snapshots.push({
      dirPath,
      snapshot,
    });
  }

  let primary = null;
  for (const entry of snapshots) {
    if (!primary) {
      primary = entry;
      continue;
    }

    const currentReady = entry.snapshot.ready === true;
    const primaryReady = primary.snapshot.ready === true;
    if (currentReady && !primaryReady) {
      primary = entry;
      continue;
    }

    if (currentReady === primaryReady && entry.snapshot.totalBytes > primary.snapshot.totalBytes) {
      primary = entry;
    }
  }

  const aggregate = {
    fileCount: snapshots.reduce((sum, entry) => sum + entry.snapshot.fileCount, 0),
    totalBytes: snapshots.reduce((sum, entry) => sum + entry.snapshot.totalBytes, 0),
    readyDirs: snapshots.filter((entry) => entry.snapshot.ready).length,
  };

  const signature = snapshots
    .map((entry) => `${entry.dirPath.toLowerCase()}|${entry.snapshot.fileCount}|${entry.snapshot.totalBytes}|${entry.snapshot.ready ? 1 : 0}|${entry.snapshot.missingRequiredPaths.join(',')}`)
    .join('||');

  return {
    dirs,
    snapshots,
    primary,
    aggregate: {
      ...aggregate,
      ready: aggregate.readyDirs > 0,
    },
    signature,
  };
}

function resolveMonitorDirs(installDir) {
  const registryInstallDir = process.platform === 'win32' ? getActualInstallLocation() : null;
  return uniquePaths(resolveKnownInstallDirectories({
    installDir,
    registryInstallDir,
  }));
}

async function waitForInstallerState(child, installDir, options = {}) {
  const timeoutMs = Number(options.timeoutMs || defaultTimeoutMs(options.kind || 'silent'));
  const idleTimeoutMs = Number(options.idleTimeoutMs || 30000);
  const pollIntervalMs = Number(options.pollIntervalMs || 5000);
  const startedAt = Date.now();

  let exit = null;
  child.once('exit', (code, signal) => {
    exit = {
      timedOut: false,
      stalled: false,
      exitCode: Number(code ?? 0),
      signal: signal ?? null,
      reason: 'process-exit',
    };
  });

  let monitorDirs = resolveMonitorDirs(installDir);
  let monitoring = await collectMonitoredInstallSnapshot(monitorDirs);
  let lastProgressAt = Date.now();
  let hasObservedProgress = monitoring.aggregate.totalBytes > 0;

  while (exit == null) {
    const now = Date.now();
    if (now - startedAt >= timeoutMs) {
      exit = {
        timedOut: true,
        stalled: false,
        exitCode: null,
        signal: null,
        reason: 'timeout',
      };
      break;
    }

    await waitForDelay(pollIntervalMs);
    const refreshedDirs = resolveMonitorDirs(installDir);
    monitorDirs = uniquePaths([...monitorDirs, ...refreshedDirs]);
    const nextMonitoring = await collectMonitoredInstallSnapshot(monitorDirs);
    if (!monitoredSnapshotsMatch(monitoring, nextMonitoring)) {
      lastProgressAt = Date.now();
    } else if (!hasObservedProgress && Date.now() - lastProgressAt >= idleTimeoutMs) {
      exit = {
        timedOut: false,
        stalled: true,
        exitCode: null,
        signal: null,
        reason: 'stalled-before-progress',
      };
      monitoring = nextMonitoring;
      break;
    }
    if (nextMonitoring.aggregate.totalBytes > 0) {
      hasObservedProgress = true;
    }
    monitoring = nextMonitoring;
  }

  return { exit, monitoring };
}

async function maybeWriteFailureArtifact(result, prefix = 'repostudio-smoke-result') {
  const normalized = result && typeof result === 'object'
    ? { ...result }
    : { ok: false, message: 'Unknown smoke result payload.' };
  if (normalized.ok === true || process.env.CI !== 'true') {
    return { ...normalized, failureArtifactPath: null };
  }

  const runnerTemp = String(process.env.RUNNER_TEMP || '').trim();
  if (!runnerTemp) {
    return { ...normalized, failureArtifactPath: null };
  }

  const artifactPath = path.join(runnerTemp, `${prefix}-${Date.now()}.json`);
  try {
    await fsp.writeFile(artifactPath, `${JSON.stringify(normalized, null, 2)}\n`, 'utf8');
    return { ...normalized, failureArtifactPath: artifactPath };
  } catch {
    return { ...normalized, failureArtifactPath: null };
  }
}

async function waitForHealth(port, timeoutMs = 120000) {
  const startedAt = Date.now();
  const deadline = startedAt + timeoutMs;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/api/repo/health`);
      if (response.ok) {
        return {
          ok: true,
          status: response.status,
          body: await response.text(),
          elapsedMs: Date.now() - startedAt,
        };
      }
    } catch {
      // keep polling
    }
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  return {
    ok: false,
    status: null,
    body: '',
    elapsedMs: Date.now() - startedAt,
  };
}

async function stopProcess(child) {
  if (!child?.pid) return;
  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], {
      stdio: 'ignore',
    });
    return;
  }
  try {
    process.kill(child.pid, 'SIGKILL');
  } catch {
    // ignore already-exited process errors
  }
}

export async function runInstallerSmoke(options = {}) {
  const packageRoot = resolvePackageRoot();
  const artifactPath = resolveArtifactPath(packageRoot, options.kind || 'silent');
  const installDir = path.resolve(options.installDir || defaultProbeInstallDir(options.kind || 'silent'));
  const repair = options.repairExisting === true
    ? await runRepairInstall({
      installDir,
      includeLegacyDirs: true,
      skipUninstall: false,
      skipProcessStop: false,
    })
    : null;

  await fsp.rm(installDir, { recursive: true, force: true });
  await fsp.mkdir(installDir, { recursive: true });

  const installerArgs = [];
  if (options.kind !== 'attended') {
    installerArgs.push('/S');
  }
  if (options.currentUser !== false) {
    installerArgs.push('/CURRENTUSER');
  }
  installerArgs.push(`/D=${installDir}`);

  const child = spawn(artifactPath, installerArgs, {
    cwd: packageRoot,
    stdio: 'ignore',
    windowsHide: true,
  });

  const { exit, monitoring } = await waitForInstallerState(child, installDir, options);
  if (exit.timedOut || exit.stalled) {
    await stopProcess(child);
  }

  const requestedInstallEntries = await collectPathEntries(installDir);
  let installedExePath = firstExistingPath(resolveInstalledExeCandidates(installDir));
  if (!installedExePath && process.platform === 'win32') {
    const regDir = getActualInstallLocation();
    const regExePath = regDir ? path.join(regDir, 'RepoStudio.exe') : null;
    if (regExePath && fs.existsSync(regExePath)) {
      installedExePath = regExePath;
    }
  }
  const effectiveInstallDir = installedExePath ? path.dirname(installedExePath) : installDir;
  const effectiveSnapshot = await collectInstallSnapshot(effectiveInstallDir);
  const effectiveInstallEntries = effectiveInstallDir !== installDir
    ? await collectPathEntries(effectiveInstallDir)
    : requestedInstallEntries;
  const warnings = [];
  if (repair && repair.ok === false) {
    warnings.push('Repair pre-step reported warnings/errors; install proceeded with best-effort cleanup.');
  }
  if (installedExePath && normalizePath(effectiveInstallDir) !== normalizePath(installDir)) {
    warnings.push(`Installer wrote to a different location than requested (/D): ${effectiveInstallDir}`);
  }

  const result = {
    ok: exit.exitCode === 0 && Boolean(installedExePath) && effectiveSnapshot.ready,
    artifactPath,
    kind: options.kind || 'silent',
    installerArgs,
    installDir,
    exit,
    installCompleted: exit.exitCode === 0,
    installReady: effectiveSnapshot.ready,
    installCopiedFiles: Boolean(installedExePath),
    hangAfterInstall: (exit.timedOut || exit.stalled) && Boolean(installedExePath) && effectiveSnapshot.ready,
    installProgress: effectiveSnapshot,
    installedExePath,
    effectiveInstallDir,
    requestedInstallEntries,
    effectiveInstallEntries,
    installMonitoring: monitoring,
    repair,
    warnings,
    launch: null,
  };

  if (
    !installedExePath
    || options.launch !== true
    || ((!exit.timedOut && !exit.stalled) ? false : options.launchAnyway !== true)
    || !effectiveSnapshot.ready
  ) {
    return maybeWriteFailureArtifact(result);
  }

  const launched = spawn(installedExePath, [], {
    cwd: path.dirname(installedExePath),
    stdio: 'ignore',
    windowsHide: true,
    env: (() => {
      const nextEnv = { ...process.env };
      delete nextEnv.ELECTRON_RUN_AS_NODE;
      return nextEnv;
    })(),
  });

  const healthTimeoutMs = Number(options.healthTimeoutMs ?? 120000);
  const health = await waitForHealth(Number(options.port || 3020), healthTimeoutMs);
  await stopProcess(launched);

  const finalResult = {
    ...result,
    launch: {
      pid: launched.pid || null,
      health,
    },
    ok: result.ok && health.ok,
  };
  return maybeWriteFailureArtifact(finalResult);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  runInstallerSmoke(parseArgs())
    .then((result) => {
      // eslint-disable-next-line no-console
      console.log(`${JSON.stringify(result, null, 2)}\n`);
      process.exitCode = result.ok ? 0 : 1;
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error(`repo-studio installer smoke failed: ${error.message}`);
      process.exitCode = 1;
    });
}
