import fs from 'node:fs';
import path from 'node:path';
import { execSync, spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

function resolvePackageRoot() {
  const currentFile = fileURLToPath(import.meta.url);
  return path.resolve(path.dirname(currentFile), '..', '..');
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
  return {
    exePath: String(args.get('exe') || '').trim(),
    port: Number(args.get('port') || 3020),
    timeoutMs: Number(args.get('timeout-ms') || 240000),
    pollIntervalMs: Number(args.get('poll-interval-ms') || 3000),
  };
}

function resolveInstalledExeCandidates() {
  const localPrograms = process.env.LOCALAPPDATA
    ? path.join(process.env.LOCALAPPDATA, 'Programs')
    : null;
  return [
    ...(localPrograms ? [
      path.join(localPrograms, 'RepoStudio', 'RepoStudio.exe'),
      path.join(localPrograms, '@forgerepo-studio', 'RepoStudio.exe'),
    ] : []),
  ];
}

function firstExistingPath(paths) {
  for (const candidate of paths) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

function getActualInstallLocation() {
  if (process.platform !== 'win32') return null;
  try {
    const script = [
      "Get-ChildItem 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*' -ErrorAction SilentlyContinue |",
      "ForEach-Object { $p = Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue;",
      "if ($p.DisplayName -eq 'RepoStudio' -and $p.InstallLocation) { $p.InstallLocation.TrimEnd([char]0x5C) } } |",
      'Select-Object -First 1',
    ].join(' ');
    const out = execSync(`powershell -NoProfile -Command "${script}"`, {
      encoding: 'utf8',
      timeout: 5000,
    });
    const installDir = String(out || '').trim();
    if (installDir && fs.existsSync(path.join(installDir, 'RepoStudio.exe'))) {
      return installDir;
    }
  } catch {
    // ignore lookup failures
  }
  return null;
}

function resolveInstalledExePath(explicitPath = '') {
  if (explicitPath) {
    const absPath = path.resolve(explicitPath);
    if (fs.existsSync(absPath)) return absPath;
  }

  const candidates = resolveInstalledExeCandidates();
  const existing = firstExistingPath(candidates);
  if (existing) return existing;

  const regInstallDir = getActualInstallLocation();
  if (regInstallDir) {
    const exePath = path.join(regInstallDir, 'RepoStudio.exe');
    if (fs.existsSync(exePath)) return exePath;
  }

  return null;
}

async function wait(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForCondition(name, timeoutMs, pollIntervalMs, probe) {
  const startedAt = Date.now();
  let lastAttempt = null;

  while (Date.now() - startedAt < timeoutMs) {
    // eslint-disable-next-line no-await-in-loop
    const attempt = await probe();
    lastAttempt = attempt;
    if (attempt.ok) {
      return {
        ok: true,
        name,
        elapsedMs: Date.now() - startedAt,
        attempt,
      };
    }
    // eslint-disable-next-line no-await-in-loop
    await wait(pollIntervalMs);
  }

  return {
    ok: false,
    name,
    elapsedMs: Date.now() - startedAt,
    attempt: lastAttempt,
  };
}

async function getJson(url) {
  try {
    const response = await fetch(url);
    const raw = await response.text();
    let json = null;
    try {
      json = raw ? JSON.parse(raw) : null;
    } catch {
      json = null;
    }
    return {
      ok: response.ok,
      status: response.status,
      body: raw,
      json,
    };
  } catch (error) {
    return {
      ok: false,
      status: null,
      body: '',
      json: null,
      error: error instanceof Error ? error.message : String(error || 'unknown error'),
    };
  }
}

function isCommandAvailable(command) {
  if (!command) return false;
  if (process.platform === 'win32') {
    const result = spawnSync('where', [command], { stdio: 'ignore' });
    return result.status === 0;
  }
  const result = spawnSync('which', [command], { stdio: 'ignore' });
  return result.status === 0;
}

function stopProcess(child) {
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

function maybeWriteFailureArtifact(result, prefix = 'repostudio-runtime-probe') {
  if (result.ok === true || process.env.CI !== 'true') {
    return { ...result, failureArtifactPath: null };
  }
  const runnerTemp = String(process.env.RUNNER_TEMP || '').trim();
  if (!runnerTemp) {
    return { ...result, failureArtifactPath: null };
  }
  const artifactPath = path.join(runnerTemp, `${prefix}-${Date.now()}.json`);
  try {
    fs.writeFileSync(artifactPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
    return { ...result, failureArtifactPath: artifactPath };
  } catch {
    return { ...result, failureArtifactPath: null };
  }
}

export async function runRuntimeReadinessProbe(options = {}) {
  const packageRoot = resolvePackageRoot();
  const exePath = resolveInstalledExePath(options.exePath || '');
  if (!exePath) {
    throw new Error('Installed RepoStudio executable not found. Check installer output before runtime probe.');
  }

  const port = Number(options.port || 3020);
  const timeoutMs = Number(options.timeoutMs || 240000);
  const pollIntervalMs = Number(options.pollIntervalMs || 3000);
  const baseUrl = `http://127.0.0.1:${port}`;

  const launched = spawn(exePath, [], {
    cwd: path.dirname(exePath),
    stdio: 'ignore',
    windowsHide: true,
    env: (() => {
      const nextEnv = { ...process.env };
      delete nextEnv.ELECTRON_RUN_AS_NODE;
      return nextEnv;
    })(),
  });

  let result = {
    ok: false,
    packageRoot,
    exePath,
    pid: launched.pid || null,
    baseUrl,
    checks: {},
    warnings: [],
  };

  try {
    const health = await waitForCondition(
      'health',
      timeoutMs,
      pollIntervalMs,
      async () => {
        const response = await getJson(`${baseUrl}/api/repo/health`);
        return {
          ok: response.ok,
          response,
        };
      },
    );
    result.checks.health = health;
    if (!health.ok) {
      result = { ...result, ok: false, message: 'Health endpoint did not become ready.' };
      return maybeWriteFailureArtifact(result);
    }

    const runtimeDeps = await waitForCondition(
      'runtimeDeps',
      timeoutMs,
      pollIntervalMs,
      async () => {
        const response = await getJson(`${baseUrl}/api/repo/runtime/deps`);
        const desktopRuntimeReady = response.json?.desktopRuntimeReady === true;
        return {
          ok: response.ok && desktopRuntimeReady,
          response,
          desktopRuntimeReady,
        };
      },
    );
    result.checks.runtimeDeps = runtimeDeps;
    if (!runtimeDeps.ok) {
      result = { ...result, ok: false, message: 'Runtime dependency endpoint did not report desktopRuntimeReady=true.' };
      return maybeWriteFailureArtifact(result);
    }

    const codexStatus = await waitForCondition(
      'codexStatus',
      timeoutMs,
      pollIntervalMs,
      async () => {
        const response = await getJson(`${baseUrl}/api/repo/codex/session/status`);
        const codexCliInstalled = response.json?.codex?.readiness?.cli?.installed === true;
        return {
          ok: response.ok && codexCliInstalled,
          response,
          codexCliInstalled,
        };
      },
    );
    result.checks.codexStatus = codexStatus;
    if (!codexStatus.ok) {
      result = { ...result, ok: false, message: 'Codex readiness endpoint did not report CLI installed.' };
      return maybeWriteFailureArtifact(result);
    }

    const login = codexStatus.attempt?.response?.json?.codex?.readiness?.login || null;
    if (!(login?.loggedIn === true)) {
      result.warnings.push('Codex login is not active. This is warning-only for runtime probe.');
    }

    if (!isCommandAvailable('claude')) {
      result.warnings.push('Claude CLI is not available on PATH. This is warning-only.');
    }

    result = {
      ...result,
      ok: true,
      message: 'Runtime readiness probe passed.',
    };
    return maybeWriteFailureArtifact(result);
  } finally {
    stopProcess(launched);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  runRuntimeReadinessProbe(parseArgs())
    .then((result) => {
      // eslint-disable-next-line no-console
      console.log(`${JSON.stringify(result, null, 2)}\n`);
      process.exitCode = result.ok ? 0 : 1;
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error(`repo-studio runtime readiness probe failed: ${error.message}`);
      process.exitCode = 1;
    });
}
