import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { resolveCurrentInstallState, resolveLocalProgramsRoot } from './install-locations.mjs';

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
  return {
    installDir: String(args.get('install-dir') || '').trim(),
    includeLegacyDirs: args.get('include-legacy-dirs') !== 'false',
    skipUninstall: args.get('skip-uninstall') === true,
    skipProcessStop: args.get('skip-process-stop') === true,
    processStopTimeoutMs: Number(args.get('process-stop-timeout-ms') || 20000),
    uninstallTimeoutMs: Number(args.get('uninstall-timeout-ms') || 180000),
  };
}

function normalizePath(input) {
  return path.resolve(String(input || '')).replace(/[\\/]+$/, '');
}

function uniquePaths(list = []) {
  const seen = new Set();
  const out = [];
  for (const item of list) {
    if (!item) continue;
    const normalized = normalizePath(item);
    const key = normalized.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(normalized);
  }
  return out;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function maybeWriteFailureArtifact(result, prefix = 'repostudio-repair') {
  const writeArtifacts = process.env.REPOSTUDIO_WRITE_SMOKE_ARTIFACTS === '1';
  if (process.env.CI !== 'true') {
    return { ...result, failureArtifactPath: null };
  }
  if (result.ok === true && !writeArtifacts) {
    return { ...result, failureArtifactPath: null };
  }
  const runnerTemp = String(process.env.RUNNER_TEMP || '').trim();
  if (!runnerTemp) {
    return { ...result, failureArtifactPath: null };
  }
  const state = result.ok === true ? 'ok' : 'fail';
  const artifactPath = path.join(runnerTemp, `${prefix}-${state}-${Date.now()}.json`);
  try {
    fs.writeFileSync(artifactPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
    return { ...result, failureArtifactPath: artifactPath };
  } catch {
    return { ...result, failureArtifactPath: null };
  }
}

function collectLocalProgramCandidates() {
  const localPrograms = resolveLocalProgramsRoot();
  if (!localPrograms) return [];
  return [
    path.join(localPrograms, 'RepoStudio'),
    path.join(localPrograms, '@forgerepo-studio'),
  ];
}

function resolveCleanupTargets(installState, options = {}) {
  const installs = Array.isArray(installState?.installs) ? installState.installs : [];
  const explicitInstallDir = String(options.installDir || '').trim();
  const includeLegacyDirs = options.includeLegacyDirs !== false;
  const targets = [
    ...(explicitInstallDir ? [explicitInstallDir] : []),
    ...installs.map((item) => item.installDir),
    ...(includeLegacyDirs ? collectLocalProgramCandidates() : []),
  ];
  return uniquePaths(targets);
}

function waitForChildExit(child, timeoutMs) {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };
    const timer = setTimeout(() => {
      finish({
        timedOut: true,
        exitCode: null,
        signal: null,
      });
    }, timeoutMs);
    child.once('exit', (code, signal) => {
      clearTimeout(timer);
      finish({
        timedOut: false,
        exitCode: Number(code ?? 0),
        signal: signal ?? null,
      });
    });
  });
}

function parsePidList(raw) {
  return String(raw || '')
    .split(/\r?\n/)
    .map((line) => Number(line.trim()))
    .filter((value) => Number.isInteger(value) && value > 0);
}

function findInstallOwnedPids(installDir) {
  if (process.platform !== 'win32') return [];
  const escapedInstallDir = String(installDir)
    .replace(/'/g, "''")
    .toLowerCase();
  const script = [
    `$target='${escapedInstallDir}'`,
    "Get-CimInstance Win32_Process -ErrorAction SilentlyContinue |",
    'Where-Object {',
    '  ($_.ExecutablePath -and $_.ExecutablePath.ToLower().StartsWith($target)) -or',
    '  ($_.CommandLine -and $_.CommandLine.ToLower().Contains($target))',
    '} | Select-Object -ExpandProperty ProcessId',
  ].join(' ');
  const result = spawnSync('powershell', ['-NoProfile', '-Command', script], {
    encoding: 'utf8',
  });
  if ((result.status ?? 1) !== 0) return [];
  return [...new Set(parsePidList(result.stdout))];
}

async function stopInstallOwnedProcesses(installDir, timeoutMs = 20000) {
  const pids = findInstallOwnedPids(installDir);
  const stopped = [];
  const failed = [];

  for (const pid of pids) {
    const killResult = spawnSync('taskkill', ['/PID', String(pid), '/T', '/F'], {
      encoding: 'utf8',
    });
    const ok = (killResult.status ?? 1) === 0
      || /not found|no running instance/i.test(`${killResult.stdout || ''}\n${killResult.stderr || ''}`);
    if (!ok) {
      failed.push({
        pid,
        stdout: String(killResult.stdout || '').trim(),
        stderr: String(killResult.stderr || '').trim(),
      });
      continue;
    }

    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const check = spawnSync('tasklist', ['/FI', `PID eq ${pid}`, '/FO', 'CSV', '/NH'], {
        encoding: 'utf8',
      });
      const text = String(check.stdout || '').trim();
      if (!text || /no tasks are running/i.test(text)) break;
      // eslint-disable-next-line no-await-in-loop
      await sleep(80);
    }
    stopped.push(pid);
  }

  return {
    foundPids: pids,
    stoppedPids: stopped,
    failedPids: failed,
  };
}

async function runSilentUninstall(uninstallPath, timeoutMs = 180000) {
  if (!uninstallPath || !fs.existsSync(uninstallPath)) {
    return {
      attempted: false,
      timedOut: false,
      exitCode: null,
      signal: null,
      stdout: '',
      stderr: '',
    };
  }

  const child = spawn(uninstallPath, ['/S'], {
    cwd: path.dirname(uninstallPath),
    stdio: 'ignore',
    windowsHide: true,
  });
  const exit = await waitForChildExit(child, timeoutMs);

  if (exit.timedOut && child.pid) {
    spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], {
      stdio: 'ignore',
    });
  }

  return {
    attempted: true,
    ...exit,
    stdout: '',
    stderr: '',
  };
}

async function removeDirectoryWithRetries(dirPath, attempts = 4) {
  let lastError = null;
  for (let index = 0; index < attempts; index += 1) {
    try {
      await fsp.rm(dirPath, { recursive: true, force: true });
      return { ok: true, path: dirPath, removed: true };
    } catch (error) {
      lastError = error;
      await sleep((index + 1) * 250);
    }
  }

  if (!fs.existsSync(dirPath)) {
    return { ok: true, path: dirPath, removed: true };
  }

  return {
    ok: false,
    path: dirPath,
    removed: false,
    error: String(lastError?.message || lastError || 'remove failed'),
  };
}

export async function runRepairInstall(options = {}) {
  const installState = resolveCurrentInstallState({ installDir: options.installDir });
  const primaryInstall = installState.primary;
  const cleanupTargets = resolveCleanupTargets(installState, options);

  const processStop = [];
  if (options.skipProcessStop !== true && process.platform === 'win32') {
    for (const installDir of cleanupTargets) {
      // eslint-disable-next-line no-await-in-loop
      const stopResult = await stopInstallOwnedProcesses(installDir, options.processStopTimeoutMs);
      processStop.push({
        installDir,
        ...stopResult,
      });
    }
  }

  let uninstallResult = {
    attempted: false,
    timedOut: false,
    exitCode: null,
    signal: null,
    stdout: '',
    stderr: '',
  };
  if (options.skipUninstall !== true && primaryInstall?.uninstallExists) {
    uninstallResult = await runSilentUninstall(
      primaryInstall.uninstallPath,
      options.uninstallTimeoutMs,
    );
  }

  const removals = [];
  for (const target of cleanupTargets) {
    // eslint-disable-next-line no-await-in-loop
    const removed = await removeDirectoryWithRetries(target);
    removals.push(removed);
  }

  const failedRemovals = removals.filter((item) => item.ok === false);
  const failedStops = processStop.flatMap((entry) => entry.failedPids || []);
  const ok = failedRemovals.length === 0 && failedStops.length === 0 && !uninstallResult.timedOut;

  const result = {
    ok,
    installState,
    primaryInstall,
    processStop,
    uninstallResult,
    cleanupTargets,
    removals,
    message: ok
      ? 'Repair cleanup completed.'
      : 'Repair cleanup completed with warnings/errors. Check failedPids/failedRemovals.',
  };
  return maybeWriteFailureArtifact(result);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  runRepairInstall(parseArgs())
    .then((result) => {
      // eslint-disable-next-line no-console
      console.log(`${JSON.stringify(result, null, 2)}\n`);
      process.exitCode = result.ok ? 0 : 1;
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error(`repo-studio repair-install failed: ${error.message}`);
      process.exitCode = 1;
    });
}
