import fs from 'node:fs';
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
    exePath: String(args.get('exe') || '').trim(),
    port: Number(args.get('port') || 3020),
    timeoutMs: Number(args.get('timeout-ms') || 120000),
  };
}

function defaultExePath(packageRoot) {
  return path.join(packageRoot, 'dist', 'desktop', 'win-unpacked', 'RepoStudio.exe');
}

async function waitForHealth(port, timeoutMs) {
  const startedAt = Date.now();
  const targetUrl = `http://127.0.0.1:${Number(port)}/api/repo/health`;

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(targetUrl);
      if (response.ok) {
        return {
          ok: true,
          status: response.status,
          body: await response.text(),
          elapsedMs: Date.now() - startedAt,
        };
      }
    } catch {
      // keep waiting
    }

    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  return {
    ok: false,
    status: null,
    body: '',
    elapsedMs: Date.now() - startedAt,
  };
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

export async function runLaunchSmoke(options = {}) {
  const packageRoot = resolvePackageRoot();
  const exePath = path.resolve(options.exePath || defaultExePath(packageRoot));
  if (!fs.existsSync(exePath)) {
    throw new Error(`Executable not found: ${exePath}`);
  }

  const child = spawn(exePath, [], {
    cwd: path.dirname(exePath),
    stdio: 'ignore',
    windowsHide: true,
    env: (() => {
      const nextEnv = { ...process.env };
      delete nextEnv.ELECTRON_RUN_AS_NODE;
      return nextEnv;
    })(),
  });

  const health = await waitForHealth(Number(options.port || 3020), Number(options.timeoutMs || 120000));
  stopProcess(child);

  return {
    ok: health.ok,
    exePath,
    pid: child.pid || null,
    health,
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  runLaunchSmoke(parseArgs())
    .then((result) => {
      // eslint-disable-next-line no-console
      console.log(`${JSON.stringify(result, null, 2)}\n`);
      process.exitCode = result.ok ? 0 : 1;
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error(`repo-studio launch smoke failed: ${error.message}`);
      process.exitCode = 1;
    });
}
