import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { loadRepoStudioConfig } from '../lib/config.mjs';
import {
  REPO_STUDIO_APP_DEFAULT_PORT,
  REPO_STUDIO_DESKTOP_DEFAULT_PORT,
  REPO_STUDIO_PACKAGE_DEFAULT_PORT,
  clearRuntimeState,
  detectRuntimeByPort,
  findListeningPidByPort,
  isProcessAlive,
  isSameWorkspace,
  loadActiveRuntimeState,
  runtimeUrlFor,
  writeRuntimeState,
} from '../lib/runtime-manager.mjs';
import { runRepoStudioServer } from '../server/server.mjs';
import { runDesktopBoot } from '../desktop/boot.mjs';

function openInBrowser(url) {
  if (!url) return;
  const launcher = process.platform === 'win32'
    ? 'start'
    : process.platform === 'darwin'
      ? 'open'
      : 'xdg-open';
  spawn(launcher, [url], {
    shell: process.platform === 'win32',
    stdio: 'ignore',
  });
}

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function detectForgeAgentWorkspace(cwd = process.cwd()) {
  const packageJsonPath = path.join(cwd, 'package.json');
  const repoStudioAppPath = path.join(cwd, 'apps', 'repo-studio', 'package.json');
  if (!(await pathExists(packageJsonPath))) return false;
  if (!(await pathExists(repoStudioAppPath))) return false;

  try {
    const raw = await fs.readFile(packageJsonPath, 'utf8');
    const pkg = JSON.parse(raw);
    return pkg?.name === 'forge-agent';
  } catch {
    return false;
  }
}

function resolveRequestedMode(options, config, isForgeAgentWorkspace) {
  if (options.desktopRuntime === true) return 'desktop';
  if (options.appRuntime === true) return 'app';
  if (options.packageRuntime === true) return 'package';

  const configured = String(config?.runtime?.defaultMode || 'auto').toLowerCase();
  if (configured === 'desktop' || configured === 'app' || configured === 'package') return configured;
  if (isForgeAgentWorkspace) return 'app';
  return 'package';
}

function resolvePort(options, config, mode) {
  if (Number.isFinite(Number(options.port)) && Number(options.port) > 0) {
    return Number(options.port);
  }

  if (mode === 'desktop') {
    const configured = Number(config?.runtime?.desktopDefaultPort || 0);
    if (configured > 0) return configured;
    return REPO_STUDIO_DESKTOP_DEFAULT_PORT;
  }

  if (mode === 'app') {
    const configured = Number(config?.runtime?.defaultPort || 0);
    if (configured > 0 && configured !== REPO_STUDIO_PACKAGE_DEFAULT_PORT) {
      return configured;
    }
    return REPO_STUDIO_APP_DEFAULT_PORT;
  }

  const configured = Number(config?.runtime?.defaultPort || 0);
  if (configured > 0) return configured;
  return REPO_STUDIO_PACKAGE_DEFAULT_PORT;
}

function cliPath() {
  const currentFile = fileURLToPath(import.meta.url);
  return path.resolve(path.dirname(currentFile), '..', 'cli.mjs');
}

function spawnDetached(command, args, options = {}) {
  const child = spawn(command, args, {
    cwd: options.cwd || process.cwd(),
    detached: true,
    stdio: 'ignore',
    shell: options.shell === true,
  });
  child.unref();
  return child;
}

async function ensureStartupAlive(child) {
  await new Promise((resolve) => setTimeout(resolve, 1200));
  if (isProcessAlive(child.pid)) return;
  throw new Error('RepoStudio runtime exited during startup. Check .repo-studio/runs and app logs.');
}

function buildAppRuntimeCommand(port) {
  const appDir = path.join(process.cwd(), 'apps', 'repo-studio');
  const nextBin = path.join(appDir, 'node_modules', 'next', 'dist', 'bin', 'next');
  if (fsSync.existsSync(nextBin)) {
    return {
      command: process.execPath,
      args: [nextBin, 'dev', '--turbopack', '-p', String(port)],
      shell: false,
      cwd: appDir,
    };
  }

  const args = ['--filter', '@forge/repo-studio-app', 'dev', '--', '--port', String(port)];
  return {
    command: process.platform === 'win32' ? 'cmd.exe' : 'pnpm',
    args: process.platform === 'win32'
      ? ['/d', '/s', '/c', ['pnpm', ...args].join(' ')]
      : args,
    shell: false,
    cwd: process.cwd(),
  };
}

async function writeRuntimeRecord({ pid, port, mode, view, profile, desktop }) {
  return writeRuntimeState({
    pid,
    port,
    mode,
    view,
    profile,
    desktop,
    workspaceRoot: process.cwd(),
    startedAt: new Date().toISOString(),
  });
}

async function reuseIfPossible(options) {
  const active = await loadActiveRuntimeState({ cleanupStale: true });
  if (!active.running || !active.state) return null;
  if (!isSameWorkspace(active.state, process.cwd())) return null;
  if (active.state.mode !== options.mode) {
    return null;
  }

  const url = runtimeUrlFor(active.state);
  if (options.openBrowser && active.state.mode !== 'desktop') openInBrowser(url);
  return {
    ok: true,
    reused: true,
    mode: active.state.mode,
    pid: active.state.pid,
    port: active.state.port,
    url,
    runtime: active.state,
    message: `Reused RepoStudio runtime (${active.state.mode}) at ${url} (pid ${active.state.pid}).`,
  };
}

async function reuseByPortFallback(options) {
  if (options.mode === 'desktop') return null;
  const detected = await detectRuntimeByPort({
    mode: options.mode,
    port: options.port,
  });
  if (!detected) return null;
  await writeRuntimeState(detected);
  const url = runtimeUrlFor(detected);
  if (options.openBrowser) openInBrowser(url);
  return {
    ok: true,
    reused: true,
    mode: detected.mode,
    pid: detected.pid,
    port: detected.port,
    url,
    runtime: detected,
    message: `Reused RepoStudio runtime detected on port ${detected.port} (pid ${detected.pid}).`,
  };
}

async function runPackageRuntimeForeground(options) {
  const started = await runRepoStudioServer({
    profile: options.profile,
    mode: options.mode,
    view: options.view,
    port: options.port,
    openBrowser: options.openBrowser,
  });

  const runtime = await writeRuntimeRecord({
    pid: process.pid,
    port: options.port,
    mode: 'package',
    view: options.view,
    profile: options.profile,
  });

  const runtimeUrl = started.url || runtimeUrlFor(runtime);
  return {
    ok: true,
    reused: false,
    detached: false,
    mode: 'package',
    pid: process.pid,
    port: options.port,
    url: runtimeUrl,
    message: `RepoStudio package runtime running at ${runtimeUrl} (pid ${process.pid}).`,
  };
}

async function runPackageRuntimeDetached(options) {
  const args = [
    'open',
    '--package-runtime',
    '--foreground',
    '--runtime-child',
    '--no-browser',
    '--no-reuse',
    '--profile',
    options.profile,
    '--mode',
    options.mode,
    '--view',
    options.view,
    '--port',
    String(options.port),
  ];

  const child = spawnDetached(process.execPath, [cliPath(), ...args], {
    cwd: process.cwd(),
  });

  if (!isProcessAlive(child.pid)) {
    throw new Error('Failed to start detached RepoStudio package runtime.');
  }
  await ensureStartupAlive(child);
  const runtimePid = findListeningPidByPort(options.port) || child.pid;

  const runtime = await writeRuntimeRecord({
    pid: runtimePid,
    port: options.port,
    mode: 'package',
    view: options.view,
    profile: options.profile,
  });

  const url = runtimeUrlFor(runtime);
  if (options.openBrowser) openInBrowser(url);

  return {
    ok: true,
    reused: false,
    detached: true,
    mode: 'package',
    pid: runtimePid,
    port: options.port,
    url,
    runtime,
    message: `RepoStudio package runtime started at ${url} (pid ${runtimePid}).`,
  };
}

async function runAppRuntimeForeground(options) {
  const command = buildAppRuntimeCommand(options.port);
  const child = spawn(command.command, command.args, {
    cwd: command.cwd || process.cwd(),
    shell: command.shell,
    stdio: 'inherit',
  });

  await writeRuntimeRecord({
    pid: child.pid,
    port: options.port,
    mode: 'app',
    view: options.view,
    profile: options.profile,
  });

  const url = `http://127.0.0.1:${options.port}`;
  if (options.openBrowser) openInBrowser(url);

  const code = await new Promise((resolve) => {
    child.once('exit', (exitCode) => resolve(Number(exitCode ?? 0)));
  });
  await clearRuntimeState();

  return {
    ok: code === 0,
    reused: false,
    detached: false,
    mode: 'app',
    pid: child.pid,
    port: options.port,
    url,
    exitCode: code,
    message: code === 0
      ? 'RepoStudio app runtime exited cleanly.'
      : `RepoStudio app runtime exited with code ${code}.`,
  };
}

async function runAppRuntimeDetached(options) {
  const command = buildAppRuntimeCommand(options.port);
  const child = spawnDetached(command.command, command.args, {
    cwd: command.cwd || process.cwd(),
    shell: command.shell,
  });

  if (!isProcessAlive(child.pid)) {
    throw new Error('Failed to start detached RepoStudio app runtime.');
  }
  await ensureStartupAlive(child);
  const runtimePid = findListeningPidByPort(options.port) || child.pid;

  const runtime = await writeRuntimeRecord({
    pid: runtimePid,
    port: options.port,
    mode: 'app',
    view: options.view,
    profile: options.profile,
  });

  const url = `http://127.0.0.1:${runtime.port}`;
  if (options.openBrowser) openInBrowser(url);

  return {
    ok: true,
    reused: false,
    detached: true,
    mode: 'app',
    pid: runtimePid,
    port: runtime.port,
    url,
    runtime,
    message: `RepoStudio app runtime started at ${url} (pid ${runtimePid}).`,
  };
}

async function runDesktopRuntimeForeground(options) {
  return runDesktopBoot({
    workspaceRoot: process.cwd(),
    appPort: options.port,
    profile: options.profile,
    view: options.view,
    detach: false,
    dev: options.desktopDev === true,
  });
}

async function runDesktopRuntimeDetached(options) {
  const args = [
    'open',
    '--desktop-runtime',
    '--foreground',
    '--runtime-child',
    '--no-browser',
    '--no-reuse',
    '--profile',
    options.profile,
    '--mode',
    options.mode,
    '--view',
    options.view,
    '--port',
    String(options.port),
  ];

  if (options.desktopDev === true) args.push('--desktop-dev');
  const child = spawnDetached(process.execPath, [cliPath(), ...args], {
    cwd: process.cwd(),
  });

  if (!isProcessAlive(child.pid)) {
    throw new Error('Failed to start detached RepoStudio desktop runtime.');
  }
  await ensureStartupAlive(child);

  const runtime = await loadActiveRuntimeState({ cleanupStale: false });
  const state = runtime.state;
  const url = state ? runtimeUrlFor(state) : `http://127.0.0.1:${options.port}`;

  return {
    ok: true,
    reused: false,
    detached: true,
    mode: 'desktop',
    pid: state?.desktop?.electronPid || state?.pid || child.pid,
    port: state?.desktop?.appPort || options.port,
    url,
    runtime: state || null,
    message: `RepoStudio desktop runtime started at ${url} (electron pid ${state?.desktop?.electronPid || child.pid}).`,
  };
}

export async function runOpen(options = {}) {
  const config = await loadRepoStudioConfig();
  const forgeAgentWorkspace = await detectForgeAgentWorkspace();
  const selectedMode = resolveRequestedMode(options, config, forgeAgentWorkspace);

  const reuseByDefault = config?.runtime?.reuseByDefault !== false;
  const reuse = options.reuse === true || (options.reuse !== false && reuseByDefault);
  const detach = options.foreground === true ? false : options.detach !== false;
  const profile = String(options.profile || 'forge-loop');
  const envMode = String(options.mode || 'local');
  const view = String(options.view || config?.views?.defaultView || config?.ui?.defaultView || 'planning');
  const port = resolvePort(options, config, selectedMode);
  const openBrowser = options.openBrowser !== false;

  if (reuse) {
    const reused = await reuseIfPossible({
      mode: selectedMode,
      openBrowser,
    });
    if (reused) return reused;

    const byPort = await reuseByPortFallback({
      mode: selectedMode,
      port,
      openBrowser,
    });
    if (byPort) return byPort;
  }

  if (selectedMode === 'desktop') {
    if (detach) {
      return runDesktopRuntimeDetached({
        profile,
        mode: envMode,
        view,
        port,
        desktopDev: options.desktopDev === true,
      });
    }
    return runDesktopRuntimeForeground({
      profile,
      mode: envMode,
      view,
      port,
      desktopDev: options.desktopDev === true,
    });
  }

  if (selectedMode === 'package') {
    if (detach) {
      return runPackageRuntimeDetached({
        profile,
        mode: envMode,
        view,
        port,
        openBrowser,
      });
    }
    return runPackageRuntimeForeground({
      profile,
      mode: envMode,
      view,
      port,
      openBrowser,
    });
  }

  if (detach) {
    return runAppRuntimeDetached({
      profile,
      mode: envMode,
      view,
      port,
      openBrowser,
    });
  }

  return runAppRuntimeForeground({
    profile,
    mode: envMode,
    view,
    port,
    openBrowser,
  });
}
