import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { spawn } from 'node:child_process';

const DEFAULT_START_TIMEOUT_MS = 60000;

function exists(filePath) {
  try {
    fs.accessSync(filePath);
    return true;
  } catch {
    return false;
  }
}

export function resolveRepoStudioStandaloneServer(workspaceRoot = process.cwd(), options = {}) {
  const appRoot = path.join(workspaceRoot, 'apps', 'repo-studio');
  const standaloneRoot = options?.standaloneRoot
    ? path.resolve(String(options.standaloneRoot))
    : path.join(appRoot, '.next', 'standalone');
  const candidates = [
    path.join(standaloneRoot, 'apps', 'repo-studio', 'server.js'),
    path.join(standaloneRoot, 'server.js'),
  ];
  const resolved = candidates.find((candidate) => exists(candidate)) || null;
  return {
    appRoot,
    standaloneRoot,
    candidates,
    resolved,
  };
}

function buildDevCommand(workspaceRoot, port) {
  const appRoot = path.join(workspaceRoot, 'apps', 'repo-studio');
  const nextBin = path.join(appRoot, 'node_modules', 'next', 'dist', 'bin', 'next');
  if (exists(nextBin)) {
    return {
      command: process.execPath,
      args: [nextBin, 'dev', '--turbopack', '-p', String(port)],
      cwd: appRoot,
      shell: false,
      mode: 'dev',
    };
  }

  const sharedArgs = ['--filter', '@forge/repo-studio-app', 'dev', '--', '--port', String(port)];
  if (process.platform === 'win32') {
    return {
      command: 'cmd.exe',
      args: ['/d', '/s', '/c', ['pnpm', ...sharedArgs].join(' ')],
      cwd: workspaceRoot,
      shell: false,
      mode: 'dev',
    };
  }

  return {
    command: 'pnpm',
    args: sharedArgs,
    cwd: workspaceRoot,
    shell: false,
    mode: 'dev',
  };
}

function buildProdCommand(workspaceRoot, port, options = {}) {
  const standalone = resolveRepoStudioStandaloneServer(workspaceRoot, options);
  if (!standalone.resolved) return null;
  return {
    command: process.execPath,
    args: [standalone.resolved],
    cwd: path.dirname(standalone.resolved),
    shell: false,
    mode: 'prod',
    standalone,
    env: process.versions?.electron
      ? { ELECTRON_RUN_AS_NODE: '1' }
      : {},
  };
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForPort(port, timeoutMs = DEFAULT_START_TIMEOUT_MS) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const connected = await new Promise((resolve) => {
      const socket = new net.Socket();
      const cleanup = () => socket.destroy();
      socket.setTimeout(700);
      socket.once('connect', () => {
        cleanup();
        resolve(true);
      });
      socket.once('timeout', () => {
        cleanup();
        resolve(false);
      });
      socket.once('error', () => {
        cleanup();
        resolve(false);
      });
      socket.connect(Number(port), '127.0.0.1');
    });

    if (connected) return true;
    // eslint-disable-next-line no-await-in-loop
    await wait(250);
  }
  return false;
}

async function waitForHealth(port, child, timeoutMs = DEFAULT_START_TIMEOUT_MS) {
  const startedAt = Date.now();
  const targetUrl = `http://127.0.0.1:${Number(port)}/api/repo/health`;

  while (Date.now() - startedAt < timeoutMs) {
    if (child?.exitCode != null || child?.killed === true) {
      return {
        ok: false,
        reason: `RepoStudio Next server exited before becoming healthy (exitCode=${child?.exitCode ?? 'null'}).`,
      };
    }

    try {
      const response = await fetch(targetUrl);
      if (response.ok) {
        return { ok: true };
      }
    } catch {
      // keep waiting
    }

    // eslint-disable-next-line no-await-in-loop
    await wait(500);
  }

  return {
    ok: false,
    reason: `RepoStudio Next server did not become healthy within ${timeoutMs}ms.`,
  };
}

function spawnServer(command, args, options = {}) {
  const child = spawn(command, args, {
    cwd: options.cwd || process.cwd(),
    shell: options.shell === true,
    stdio: options.stdio || 'ignore',
    env: {
      ...process.env,
      ...options.env,
    },
  });

  return child;
}

export async function startRepoStudioNextServer(options = {}) {
  const workspaceRoot = path.resolve(String(options.workspaceRoot || process.cwd()));
  const port = Number(options.port || 3020);
  const forceDev = options.dev === true;
  const sqliteUri = String(options.databaseUri || '').trim();
  const stdio = options.stdio || 'ignore';

  const prodCommand = forceDev
    ? null
    : buildProdCommand(workspaceRoot, port, { standaloneRoot: options.standaloneRoot });
  const command = prodCommand || buildDevCommand(workspaceRoot, port);

  const child = spawnServer(command.command, command.args, {
    cwd: command.cwd,
    shell: command.shell,
    stdio,
    env: {
      ...(command.env || {}),
      PORT: String(port),
      HOSTNAME: '127.0.0.1',
      REPO_STUDIO_DESKTOP: '1',
      ...(options.safeMode === true ? { REPO_STUDIO_SAFE_MODE: '1' } : {}),
      ...(options.verboseStartup === true ? { REPO_STUDIO_VERBOSE_STARTUP: '1' } : {}),
      ...(sqliteUri ? { REPO_STUDIO_DATABASE_URI: sqliteUri } : {}),
    },
  });

  if (typeof options.onStdout === 'function' && child.stdout) {
    child.stdout.on('data', (chunk) => {
      options.onStdout(String(chunk || ''));
    });
  }

  if (typeof options.onStderr === 'function' && child.stderr) {
    child.stderr.on('data', (chunk) => {
      options.onStderr(String(chunk || ''));
    });
  }

  if (typeof options.onExit === 'function') {
    child.on('exit', (code, signal) => {
      options.onExit(code, signal);
    });
  }

  if (!child.pid) {
    throw new Error('Failed to spawn RepoStudio Next server process.');
  }

  const listening = await waitForPort(port);
  if (!listening) {
    try {
      child.kill('SIGTERM');
    } catch {
      // ignore
    }
    throw new Error(`RepoStudio Next server did not start listening on port ${port}.`);
  }

  const health = await waitForHealth(port, child);
  if (!health.ok) {
    try {
      child.kill('SIGTERM');
    } catch {
      // ignore
    }
    throw new Error(health.reason);
  }

  return {
    pid: child.pid,
    port,
    mode: command.mode,
    command: command.command,
    args: command.args,
    cwd: command.cwd,
    standalone: command.standalone || resolveRepoStudioStandaloneServer(workspaceRoot, {
      standaloneRoot: options.standaloneRoot,
    }),
    process: child,
  };
}
