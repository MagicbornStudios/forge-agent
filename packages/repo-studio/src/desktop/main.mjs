import path from 'node:path';
import { appendFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

import { createDesktopWatcher } from './watcher.mjs';
import { DESKTOP_IPC, DESKTOP_RUNTIME_EVENT_TYPES } from './ipc-channels.mjs';
import { resolveRepoStudioSqlite } from '../core/runtime/sqlite-paths.mjs';
import { startRepoStudioNextServer } from './next-server.mjs';
import { createCredentialManager } from '../security/credential-manager.mjs';
import { normalizeBaseUrl, toSafeMessage } from '../security/contracts.mjs';

const electron = globalThis.__REPO_STUDIO_ELECTRON__;

if (!electron || typeof electron !== 'object') {
  throw new Error('RepoStudio desktop main runtime failed to resolve Electron APIs.');
}

const {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  safeStorage,
} = electron;

app.setName('RepoStudio');

function parseArgs(argv = process.argv.slice(2)) {
  const args = new Map();
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === '--') continue;
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
  if (safeMode) params.set('safeMode', '1');
  if (verboseStartup) params.set('verboseStartup', '1');
  const query = params.toString();
  return `http://127.0.0.1:${port}${query ? `/?${query}` : ''}`;
}

const argv = parseArgs();
const appPort = Number(argv.get('app-port') || 3020);
const workspaceRoot = path.resolve(String(argv.get('workspace-root') || process.cwd()));
const view = String(argv.get('view') || 'planning');
const profile = String(argv.get('profile') || 'forge-loop');
const desktopDev = argv.get('desktop-dev') === true;
const safeMode = argv.get('safe-mode') === true || process.env.REPO_STUDIO_SAFE_MODE === '1';
const verboseStartup = argv.get('verbose-startup') === true || process.env.REPO_STUDIO_VERBOSE_STARTUP === '1';
const useCustomWindowFrame = process.platform === 'win32';

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
let splashWindow = null;
let watcher = null;
let stopping = false;
let credentialManager = null;
let fatalDesktopErrorHandled = false;

function resolveDesktopAssetPath(...segments) {
  const currentFile = fileURLToPath(import.meta.url);
  return path.resolve(path.dirname(currentFile), ...segments);
}

function resolveDesktopLogoPath() {
  return resolveDesktopAssetPath('assets', 'logo.png');
}

function resolveDesktopIconPath() {
  if (process.platform === 'win32') {
    return resolveDesktopAssetPath('..', '..', 'build', 'repo-studio.ico');
  }
  return resolveDesktopLogoPath();
}

function resolveDesktopStartupLogPath() {
  const basePath = app.isReady()
    ? app.getPath('userData')
    : path.join(workspaceRoot, '.repo-studio');
  return path.join(basePath, 'desktop-startup.log');
}

function appendDesktopLogEntry(title, body = '') {
  const logPath = resolveDesktopStartupLogPath();
  const entry = [
    `[${new Date().toISOString()}] ${title}`,
    String(body || '').trim(),
    '',
  ].join('\n');

  try {
    mkdirSync(path.dirname(logPath), { recursive: true });
    appendFileSync(logPath, `${entry}\n`, 'utf8');
  } catch {
    // ignore log write failures
  }

  return logPath;
}

function formatDesktopError(error) {
  if (error instanceof Error) {
    const stack = String(error.stack || '').trim();
    if (stack) return stack;
    return error.message || 'Unknown Error';
  }
  if (typeof error === 'object' && error !== null) {
    try {
      return JSON.stringify(error, null, 2);
    } catch {
      return String(error);
    }
  }
  return String(error || 'Unknown error');
}

function logDesktopFailure(context, error) {
  return appendDesktopLogEntry(context, formatDesktopError(error));
}

function logDesktopVerbose(message, details = '') {
  if (!verboseStartup) return;
  appendDesktopLogEntry(`startup: ${message}`, details);
}

function showDesktopFailureDialog(context, safeMessage, logPath) {
  const details = `${context}\n\n${safeMessage}\n\nLog: ${logPath}`;
  if (app.isReady()) {
    dialog.showErrorBox('RepoStudio Startup Error', details);
    return;
  }
  // eslint-disable-next-line no-console
  console.error(details);
}

async function handleFatalDesktopError(context, error) {
  if (fatalDesktopErrorHandled) return;
  fatalDesktopErrorHandled = true;

  const logPath = logDesktopFailure(context, error);
  const safeMessage = toSafeMessage(error, 'Unknown desktop startup error.');

  emitRuntimeEvent({
    type: DESKTOP_RUNTIME_EVENT_TYPES.watcherHealth,
    status: 'error',
    reason: safeMessage,
    timestamp: new Date().toISOString(),
  });

  closeSplashWindow();
  showDesktopFailureDialog(context, safeMessage, logPath);

  try {
    await stopResources();
  } catch {
    // ignore cleanup errors; they are secondary to the fatal startup error
  }

  app.exit(1);
}

function emitRuntimeEvent(payload) {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.webContents.send(DESKTOP_IPC.runtimeEvent, payload);
}

function getMainWindowState() {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return {
      customFrame: useCustomWindowFrame,
      platform: process.platform,
      isMaximized: false,
      isMinimized: false,
      isFocused: false,
    };
  }

  return {
    customFrame: useCustomWindowFrame,
    platform: process.platform,
    isMaximized: mainWindow.isMaximized(),
    isMinimized: mainWindow.isMinimized(),
    isFocused: mainWindow.isFocused(),
  };
}

function emitMainWindowState() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.webContents.send(DESKTOP_IPC.windowStateChanged, getMainWindowState());
}

function closeSplashWindow() {
  if (!splashWindow || splashWindow.isDestroyed()) {
    splashWindow = null;
    return;
  }
  splashWindow.close();
  splashWindow = null;
}

async function stopResources() {
  if (stopping) return;
  stopping = true;
  closeSplashWindow();
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
    safeMode,
    verboseStartup,
    standaloneRoot: app.isPackaged
      ? path.join(process.resourcesPath, 'next', 'standalone')
      : undefined,
    databaseUri: sqlite.databaseUri,
    stdio: 'pipe',
    onStdout: verboseStartup
      ? (chunk) => appendDesktopLogEntry('next-server stdout', chunk)
      : undefined,
    onStderr: (chunk) => appendDesktopLogEntry('next-server stderr', chunk),
    onExit: (code, signal) => {
      appendDesktopLogEntry(
        'next-server exit',
        `code=${code ?? 'null'} signal=${signal ?? 'null'}`,
      );
    },
  });
  runtimeServerPid = started.pid;
  ownsServer = true;
}

async function createSplashWindow() {
  const logoPath = resolveDesktopLogoPath();
  const logoUrl = pathToFileURL(logoPath).href;
  const html = `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>RepoStudio Loading</title>
        <style>
          body {
            margin: 0;
            background: #071227;
            color: #f8fafc;
            font-family: "Segoe UI", sans-serif;
            display: flex;
            min-height: 100vh;
            align-items: center;
            justify-content: center;
          }
          .shell {
            width: 100%;
            height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 16px;
            background:
              radial-gradient(circle at top, rgba(56, 189, 248, 0.18), transparent 45%),
              linear-gradient(180deg, #071227 0%, #09182f 100%);
          }
          img {
            width: 120px;
            height: 120px;
            object-fit: contain;
            filter: drop-shadow(0 12px 28px rgba(0, 0, 0, 0.45));
          }
          h1 {
            margin: 0;
            font-size: 22px;
            font-weight: 700;
            letter-spacing: 0.02em;
          }
          p {
            margin: 0;
            max-width: 320px;
            text-align: center;
            font-size: 13px;
            color: rgba(226, 232, 240, 0.82);
          }
          .meta {
            font-size: 11px;
            color: rgba(148, 163, 184, 0.9);
            text-transform: uppercase;
            letter-spacing: 0.08em;
          }
        </style>
      </head>
      <body>
        <div class="shell">
          <img src="${logoUrl}" alt="RepoStudio logo" />
          <div class="meta">RepoStudio</div>
          <h1>Starting your coding agent workspace</h1>
          <p>Booting the embedded runtime, checking desktop services, and preparing your project tools.</p>
        </div>
      </body>
    </html>
  `;

  splashWindow = new BrowserWindow({
    width: 520,
    height: 420,
    frame: false,
    resizable: false,
    maximizable: false,
    minimizable: false,
    fullscreenable: false,
    show: false,
    backgroundColor: '#071227',
    alwaysOnTop: true,
    autoHideMenuBar: true,
    icon: resolveDesktopIconPath(),
    webPreferences: {
      sandbox: false,
      contextIsolation: false,
      nodeIntegration: false,
    },
  });

  splashWindow.on('closed', () => {
    splashWindow = null;
  });
  splashWindow.once('ready-to-show', () => {
    splashWindow?.show();
  });
  await splashWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
  return splashWindow;
}

async function createMainWindow() {
  const currentFile = fileURLToPath(import.meta.url);
  const preloadPath = path.resolve(path.dirname(currentFile), 'preload.cjs');
  const url = runtimeUrl(appPort, view, profile);

  mainWindow = new BrowserWindow({
    width: 1680,
    height: 980,
    minWidth: 1200,
    minHeight: 760,
    frame: !useCustomWindowFrame,
    autoHideMenuBar: true,
    show: false,
    backgroundColor: '#071227',
    icon: resolveDesktopIconPath(),
    webPreferences: {
      contextIsolation: true,
      preload: preloadPath,
      nodeIntegration: false,
      sandbox: false,
    },
  });
  if (useCustomWindowFrame) {
    mainWindow.setMenuBarVisibility(false);
    mainWindow.removeMenu();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
  mainWindow.on('maximize', () => emitMainWindowState());
  mainWindow.on('unmaximize', () => emitMainWindowState());
  mainWindow.on('minimize', () => emitMainWindowState());
  mainWindow.on('restore', () => emitMainWindowState());
  mainWindow.on('focus', () => emitMainWindowState());
  mainWindow.on('blur', () => emitMainWindowState());
  mainWindow.once('ready-to-show', () => {
    logDesktopVerbose('Main window ready to show.');
    mainWindow?.show();
    emitMainWindowState();
    closeSplashWindow();
  });

  mainWindow.webContents.on('render-process-gone', (_event, details) => {
    const error = new Error(
      `Renderer process exited (${details.reason || 'unknown'}; exitCode=${details.exitCode ?? 'n/a'}).`,
    );
    handleFatalDesktopError('RepoStudio renderer process crashed.', error).catch(() => {});
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
    userDataPath: app.getPath('userData'),
    startupLogPath: resolveDesktopStartupLogPath(),
    serverPid: runtimeServerPid,
    ownsServer,
    customWindowFrame: useCustomWindowFrame,
    safeMode,
    verboseStartup,
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

  ipcMain.handle(DESKTOP_IPC.windowState, () => getMainWindowState());

  ipcMain.handle(DESKTOP_IPC.windowMinimize, () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.minimize();
    }
    return getMainWindowState();
  });

  ipcMain.handle(DESKTOP_IPC.windowToggleMaximize, () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
    }
    return getMainWindowState();
  });

  ipcMain.handle(DESKTOP_IPC.windowClose, () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.close();
    }
    return { ok: true };
  });

  ipcMain.handle(DESKTOP_IPC.projectPickFolder, async () => {
    const targetWindow = mainWindow && !mainWindow.isDestroyed() ? mainWindow : null;
    try {
      const result = await dialog.showOpenDialog(targetWindow || undefined, {
        properties: ['openDirectory'],
        title: 'Open Project Folder',
      });
      if (result.canceled || !Array.isArray(result.filePaths) || result.filePaths.length === 0) {
        return {
          ok: false,
          canceled: true,
          message: 'Folder selection canceled.',
        };
      }
      return {
        ok: true,
        canceled: false,
        path: String(result.filePaths[0] || ''),
      };
    } catch (error) {
      return {
        ok: false,
        canceled: false,
        message: toSafeMessage(error, 'Unable to open folder picker.'),
      };
    }
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
  appendDesktopLogEntry('window-all-closed', 'All windows closed; app may quit depending on platform.');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  appendDesktopLogEntry('before-quit', 'Desktop runtime stopping resources.');
  stopResources().catch(() => {});
});

app.on('quit', () => {
  stopResources().catch(() => {});
});

process.on('uncaughtException', (error) => {
  handleFatalDesktopError('Uncaught exception in RepoStudio main process.', error).catch(() => {});
});

process.on('unhandledRejection', (reason) => {
  handleFatalDesktopError('Unhandled rejection in RepoStudio main process.', reason).catch(() => {});
});

app.whenReady()
  .then(async () => {
    appendDesktopLogEntry('startup-begin', `safeMode=${safeMode} verboseStartup=${verboseStartup} desktopDev=${desktopDev}`);
    logDesktopVerbose('Desktop bootstrap starting.', `safeMode=${safeMode} verboseStartup=${verboseStartup} desktopDev=${desktopDev}`);
    await createSplashWindow();
    logDesktopVerbose('Splash window created.');
    credentialManager = await createCredentialManager({
      workspaceRoot,
      userDataPath: app.getPath('userData'),
      safeStorage,
    });
    logDesktopVerbose('Credential manager initialized.');
    await ensureServerReady();
    logDesktopVerbose('Embedded Next server is ready.', `pid=${runtimeServerPid}`);
    registerIpcHandlers();
    logDesktopVerbose('IPC handlers registered.');
    await createMainWindow();
    appendDesktopLogEntry('startup-complete', `appPort=${appPort} view=${view} profile=${profile}`);
    logDesktopVerbose('Main window created.');
    if (safeMode) {
      emitRuntimeEvent({
        type: DESKTOP_RUNTIME_EVENT_TYPES.watcherHealth,
        status: 'disabled',
        reason: 'Desktop safe mode enabled.',
        timestamp: new Date().toISOString(),
      });
      logDesktopVerbose('Watcher skipped because safe mode is enabled.');
      return;
    }
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
    logDesktopVerbose('Desktop watcher started.', JSON.stringify({
      mode: watcher?.mode || '',
      watchedRoots: watcher?.watchedRoots || [],
    }));
  })
  .catch((error) => {
    handleFatalDesktopError('RepoStudio failed to start.', error).catch(() => {});
  });
