import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

import { app, BrowserWindow, ipcMain, safeStorage } from 'electron';

import { createDesktopWatcher } from './watcher.mjs';
import { DESKTOP_IPC, DESKTOP_RUNTIME_EVENT_TYPES } from './ipc-channels.mjs';
import { resolveRepoStudioSqlite } from '../core/runtime/sqlite-paths.mjs';
import { startRepoStudioNextServer } from './next-server.mjs';
import { createCredentialManager } from '../security/credential-manager.mjs';
import { normalizeBaseUrl, toSafeMessage } from '../security/contracts.mjs';

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
  return args;
}

function killProcessTree(pid) {
  const numeric = Number(pid || 0);
  if (!Number.isInteger(numeric) || numeric <= 0) return;

  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/PID', String(numeric), '/T', '/F'], {
      encoding: 'utf8',
    });
    return;
  }

  try {
    process.kill(numeric, 'SIGTERM');
  } catch {
    // ignore missing process errors
  }
}

function runtimeUrl(port, view, profile) {
  const params = new URLSearchParams();
  if (view) params.set('view', view);
  if (profile) params.set('profile', profile);
  const query = params.toString();
  return `http://127.0.0.1:${port}${query ? `/?${query}` : ''}`;
}

const argv = parseArgs();
const appPort = Number(argv.get('app-port') || 3020);
const workspaceRoot = path.resolve(String(argv.get('workspace-root') || process.cwd()));
const view = String(argv.get('view') || 'planning');
const profile = String(argv.get('profile') || 'forge-loop');
const desktopDev = argv.get('desktop-dev') === true;

let ownsServer = argv.get('owns-server') === true;
let runtimeServerPid = Number(argv.get('server-pid') || 0);
const watcherSettings = (() => {
  const raw = String(argv.get('watcher-settings') || '').trim();
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
})();

let mainWindow = null;
let watcher = null;
let stopping = false;
let credentialManager = null;

function emitRuntimeEvent(payload) {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.webContents.send(DESKTOP_IPC.runtimeEvent, payload);
}

async function stopResources() {
  if (stopping) return;
  stopping = true;
  if (watcher) {
    try {
      await watcher.close();
    } catch {
      // ignore watcher close errors
    }
    watcher = null;
  }
  if (ownsServer && runtimeServerPid > 0) {
    killProcessTree(runtimeServerPid);
  }
}

async function ensureServerReady() {
  if (runtimeServerPid > 0) return;

  const sqlite = resolveRepoStudioSqlite({
    runtime: 'desktop',
    workspaceRoot,
    explicitDatabaseUri: process.env.REPO_STUDIO_DATABASE_URI,
  });
  const started = await startRepoStudioNextServer({
    workspaceRoot,
    port: appPort,
    dev: desktopDev,
    standaloneRoot: app.isPackaged
      ? path.join(process.resourcesPath, 'next', 'standalone')
      : undefined,
    databaseUri: sqlite.databaseUri,
    stdio: 'ignore',
  });
  runtimeServerPid = started.pid;
  ownsServer = true;
}

async function createMainWindow() {
  const currentFile = fileURLToPath(import.meta.url);
  const preloadPath = path.resolve(path.dirname(currentFile), 'preload.mjs');
  const url = runtimeUrl(appPort, view, profile);

  mainWindow = new BrowserWindow({
    width: 1680,
    height: 980,
    minWidth: 1200,
    minHeight: 760,
    backgroundColor: '#071227',
    webPreferences: {
      contextIsolation: true,
      preload: preloadPath,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  await mainWindow.loadURL(url);
  return mainWindow;
}

async function parseJsonResponse(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function validatePlatformConnection(manager, input = {}) {
  const credential = (() => {
    const inputBase = normalizeBaseUrl(input.baseUrl);
    const inputToken = String(input.token || '').trim();
    if (inputBase && inputToken) {
      return { baseUrl: inputBase, token: inputToken };
    }
    return null;
  })() || await manager.getCredential();

  if (!credential) {
    return {
      ok: false,
      connected: false,
      baseUrl: '',
      provider: manager.provider,
      capabilities: {
        connect: false,
        read: false,
        write: false,
      },
      lastValidatedAt: null,
      message: 'No desktop token configured. Connect with a Studio API key first.',
    };
  }

  const endpoint = `${credential.baseUrl}/api/repo-studio/desktop/connection`;
  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'x-api-key': credential.token,
      },
    });
    const payload = await parseJsonResponse(response);
    const capabilities = {
      connect: payload?.capabilities?.connect === true,
      read: payload?.capabilities?.read === true,
      write: payload?.capabilities?.write === true,
    };
    const validatedAt = new Date().toISOString();

    if (!response.ok) {
      const message = String(payload?.message || `Validation failed (${response.status}).`);
      const state = await manager.validate({
        connected: false,
        capabilities: { connect: false, read: false, write: false },
        lastValidatedAt: validatedAt,
        message,
      });
      return {
        ...state,
        ok: false,
        status: response.status,
        baseUrl: credential.baseUrl,
      };
    }

    const state = await manager.validate({
      connected: true,
      capabilities,
      lastValidatedAt: validatedAt,
      message: 'Connection validated.',
    });
    return {
      ...state,
      ok: true,
      status: response.status,
      baseUrl: credential.baseUrl,
      authType: payload?.authType || 'api_key',
      userId: Number(payload?.userId || 0) || null,
      organizationId: Number(payload?.organizationId || 0) || null,
      scopes: Array.isArray(payload?.scopes) ? payload.scopes : [],
      serverTime: payload?.serverTime || null,
    };
  } catch (error) {
    const message = `Connection failed: ${toSafeMessage(error, 'Unknown network error.')}`;
    const state = await manager.validate({
      connected: false,
      capabilities: { connect: false, read: false, write: false },
      lastValidatedAt: new Date().toISOString(),
      message,
    });
    return {
      ...state,
      ok: false,
      status: 503,
      baseUrl: credential.baseUrl,
      message,
    };
  }
}

function registerIpcHandlers() {
  ipcMain.handle(DESKTOP_IPC.runtimeStatus, () => ({
    ok: true,
    appPort,
    workspaceRoot,
    serverPid: runtimeServerPid,
    ownsServer,
    watcher: watcher
      ? {
        mode: watcher.mode,
        watchedRoots: watcher.watchedRoots,
      }
      : null,
  }));

  ipcMain.handle(DESKTOP_IPC.runtimeStop, async () => {
    app.quit();
    return { ok: true, message: 'Desktop runtime stop requested.' };
  });

  ipcMain.handle(DESKTOP_IPC.authStatus, async () => {
    if (!credentialManager) {
      return {
        ok: false,
        connected: false,
        baseUrl: '',
        provider: 'memory',
        capabilities: { connect: false, read: false, write: false },
        lastValidatedAt: null,
        message: 'Credential manager is not initialized.',
      };
    }
    return credentialManager.status();
  });

  ipcMain.handle(DESKTOP_IPC.authConnect, async (_event, payload) => {
    if (!credentialManager) {
      return {
        ok: false,
        connected: false,
        message: 'Credential manager is not initialized.',
      };
    }

    const baseUrl = normalizeBaseUrl(payload?.baseUrl);
    const token = String(payload?.token || '').trim();
    if (!baseUrl) {
      return {
        ok: false,
        connected: false,
        message: 'A valid platform base URL is required.',
      };
    }
    if (!token) {
      return {
        ok: false,
        connected: false,
        message: 'A non-empty API key token is required.',
      };
    }

    try {
      await credentialManager.connect({
        baseUrl,
        token,
        message: 'Connected. Validation pending.',
      });
      return validatePlatformConnection(credentialManager, { baseUrl, token });
    } catch (error) {
      return {
        ok: false,
        connected: false,
        message: toSafeMessage(error, 'Failed to save desktop credentials.'),
      };
    }
  });

  ipcMain.handle(DESKTOP_IPC.authValidate, async (_event, payload) => {
    if (!credentialManager) {
      return {
        ok: false,
        connected: false,
        message: 'Credential manager is not initialized.',
      };
    }
    const baseUrl = normalizeBaseUrl(payload?.baseUrl);
    const token = String(payload?.token || '').trim();
    const input = baseUrl && token ? { baseUrl, token } : {};
    return validatePlatformConnection(credentialManager, input);
  });

  ipcMain.handle(DESKTOP_IPC.authDisconnect, async () => {
    if (!credentialManager) {
      return {
        ok: false,
        connected: false,
        message: 'Credential manager is not initialized.',
      };
    }
    return credentialManager.disconnect();
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  stopResources().catch(() => {});
});

app.on('quit', () => {
  stopResources().catch(() => {});
});

app.whenReady()
  .then(async () => {
    credentialManager = await createCredentialManager({
      workspaceRoot,
      userDataPath: app.getPath('userData'),
      safeStorage,
    });
    await ensureServerReady();
    registerIpcHandlers();
    await createMainWindow();
    watcher = await createDesktopWatcher({
      workspaceRoot,
      settings: watcherSettings,
      emitEvent: emitRuntimeEvent,
    });
    emitRuntimeEvent({
      type: DESKTOP_RUNTIME_EVENT_TYPES.watcherHealth,
      status: 'active',
      watchedRoots: watcher?.watchedRoots || [],
      polling: watcher?.mode === 'polling',
      timestamp: new Date().toISOString(),
    });
  })
  .catch((error) => {
    emitRuntimeEvent({
      type: DESKTOP_RUNTIME_EVENT_TYPES.watcherHealth,
      status: 'error',
      reason: String(error?.message || error),
      timestamp: new Date().toISOString(),
    });
    app.quit();
  });
