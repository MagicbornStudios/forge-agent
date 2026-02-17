import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

import { loadRepoStudioConfig } from '../lib/config.mjs';
import {
  REPO_STUDIO_DESKTOP_DEFAULT_PORT,
  clearRuntimeState,
  isProcessAlive,
  stopProcessTree,
  writeRuntimeState,
} from '../lib/runtime-manager.mjs';
import { resolveRepoStudioSqlite } from '../core/runtime/sqlite-paths.mjs';
import { startRepoStudioNextServer } from './next-server.mjs';
import { DEFAULT_DESKTOP_WATCHER_SETTINGS } from './watcher.mjs';

const require = createRequire(import.meta.url);

function resolveDesktopMainPath() {
  const currentFile = fileURLToPath(import.meta.url);
  return path.resolve(path.dirname(currentFile), 'main.mjs');
}

function resolveElectronBinary() {
  try {
    return require('electron');
  } catch {
    return null;
  }
}

function normalizeWatcherSettings(config = {}) {
  const configured = config?.runtime?.desktopWatcher || {};
  return {
    ...DEFAULT_DESKTOP_WATCHER_SETTINGS,
    ...(typeof configured === 'object' && configured ? configured : {}),
  };
}

function waitForExit(child) {
  return new Promise((resolve) => {
    child.once('exit', (code) => resolve(Number(code ?? 0)));
  });
}

export async function runDesktopBoot(options = {}) {
  const workspaceRoot = path.resolve(String(options.workspaceRoot || process.cwd()));
  const config = await loadRepoStudioConfig();
  const appPort = Number(
    options.appPort
      || config?.runtime?.desktopDefaultPort
      || REPO_STUDIO_DESKTOP_DEFAULT_PORT,
  );
  const profile = String(options.profile || 'forge-loop');
  const view = String(options.view || 'planning');
  const detach = options.detach === true;

  const electronBinary = resolveElectronBinary();
  if (!electronBinary) {
    throw new Error('Unable to resolve electron binary. Install electron in @forge/repo-studio dependencies.');
  }

  const sqlite = resolveRepoStudioSqlite({
    runtime: 'desktop',
    workspaceRoot,
    explicitDatabaseUri: process.env.REPO_STUDIO_DATABASE_URI,
  });
  const watcherSettings = normalizeWatcherSettings(config);
  const server = await startRepoStudioNextServer({
    workspaceRoot,
    port: appPort,
    dev: options.dev === true,
    databaseUri: sqlite.databaseUri,
    stdio: detach ? 'ignore' : 'inherit',
  });

  const mainPath = resolveDesktopMainPath();
  const mainArgs = [
    mainPath,
    '--workspace-root',
    workspaceRoot,
    '--app-port',
    String(appPort),
    '--server-pid',
    String(server.pid),
    '--owns-server',
    '--view',
    view,
    '--profile',
    profile,
    '--watcher-settings',
    JSON.stringify(watcherSettings),
  ];

  const electronChild = spawn(electronBinary, mainArgs, {
    cwd: workspaceRoot,
    detached: detach,
    stdio: detach ? 'ignore' : 'inherit',
    env: {
      ...process.env,
      REPO_STUDIO_DESKTOP: '1',
      REPO_STUDIO_DATABASE_URI: sqlite.databaseUri,
    },
  });

  if (!electronChild.pid) {
    await stopProcessTree(server.pid);
    throw new Error('Failed to launch Electron desktop process.');
  }

  if (detach) {
    electronChild.unref();
  }

  const runtime = await writeRuntimeState({
    pid: electronChild.pid,
    port: appPort,
    mode: 'desktop',
    view,
    profile,
    workspaceRoot,
    startedAt: new Date().toISOString(),
    desktop: {
      appPort,
      serverPid: server.pid,
      electronPid: electronChild.pid,
      serverMode: server.mode,
      watcher: watcherSettings,
      sqlite,
    },
  });

  const baseResult = {
    ok: true,
    mode: 'desktop',
    pid: electronChild.pid,
    port: appPort,
    url: `http://127.0.0.1:${appPort}`,
    runtime,
    serverPid: server.pid,
    serverMode: server.mode,
    sqlite,
  };

  if (detach) {
    return {
      ...baseResult,
      detached: true,
      message: `RepoStudio desktop runtime started (electron pid ${electronChild.pid}, server pid ${server.pid}).`,
    };
  }

  const exitCode = await waitForExit(electronChild);
  if (isProcessAlive(server.pid)) {
    await stopProcessTree(server.pid);
  }
  await clearRuntimeState();

  return {
    ...baseResult,
    detached: false,
    exitCode,
    ok: exitCode === 0,
    message: exitCode === 0
      ? 'RepoStudio desktop runtime exited cleanly.'
      : `RepoStudio desktop runtime exited with code ${exitCode}.`,
  };
}

