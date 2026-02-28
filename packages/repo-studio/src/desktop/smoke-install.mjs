import fs from 'node:fs';
import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
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
    kind: String(args.get('kind') || 'silent'),
    installDir: String(args.get('install-dir') || '').trim(),
    timeoutMs: Number(args.get('timeout-ms') || 90000),
    currentUser: args.get('current-user') !== 'false',
    keepInstallDir: args.get('keep-install-dir') === true,
    launch: args.get('launch') === true,
    launchAnyway: args.get('launch-anyway') === true,
    port: Number(args.get('port') || 3020),
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

async function waitForProcessExit(child, timeoutMs) {
  return await new Promise((resolve) => {
    let settled = false;
    const timeout = setTimeout(() => {
      if (settled) return;
      settled = true;
      resolve({
        timedOut: true,
        exitCode: null,
        signal: null,
      });
    }, timeoutMs);

    child.once('exit', (code, signal) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      resolve({
        timedOut: false,
        exitCode: Number(code ?? 0),
        signal: signal ?? null,
      });
    });
  });
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

function resolveInstalledExeCandidates(installDir) {
  const localPrograms = process.env.LOCALAPPDATA
    ? path.join(process.env.LOCALAPPDATA, 'Programs')
    : null;

  return [
    path.join(installDir, 'RepoStudio.exe'),
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

  const exit = await waitForProcessExit(child, options.timeoutMs || 90000);
  if (exit.timedOut) {
    await stopProcess(child);
  }

  const installEntries = await collectPathEntries(installDir);
  const installedExeCandidates = resolveInstalledExeCandidates(installDir);
  const installedExePath = firstExistingPath(installedExeCandidates);

  const result = {
    ok: !exit.timedOut && exit.exitCode === 0 && Boolean(installedExePath),
    artifactPath,
    kind: options.kind || 'silent',
    installerArgs,
    installDir,
    exit,
    installCompleted: !exit.timedOut && exit.exitCode === 0,
    installCopiedFiles: Boolean(installedExePath),
    hangAfterInstall: exit.timedOut && Boolean(installedExePath),
    installedExePath,
    installedExeCandidates,
    installEntries,
    launch: null,
  };

  if (!installedExePath || options.launch !== true || (exit.timedOut && options.launchAnyway !== true)) {
    return result;
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

  const health = await waitForHealth(Number(options.port || 3020), 120000);
  await stopProcess(launched);

  return {
    ...result,
    launch: {
      pid: launched.pid || null,
      health,
    },
    ok: result.ok && health.ok,
  };
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
