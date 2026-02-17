import fs from 'node:fs';
import path from 'node:path';
import chokidar from 'chokidar';

import { DESKTOP_RUNTIME_EVENT_TYPES } from './ipc-channels.mjs';

export const DEFAULT_DESKTOP_WATCHER_SETTINGS = {
  enabled: true,
  fallbackPolling: true,
  pollingIntervalMs: 1200,
  watchedRoots: ['.planning', 'apps', 'packages', 'content/story'],
};

function normalizeRelPath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\/+/, '').trim();
}

function normalizeWatchedRoots(workspaceRoot, roots = []) {
  const normalized = [...new Set(
    (Array.isArray(roots) ? roots : [])
      .map((item) => normalizeRelPath(item))
      .filter(Boolean),
  )];
  const selected = normalized.length > 0
    ? normalized
    : [...DEFAULT_DESKTOP_WATCHER_SETTINGS.watchedRoots];

  const resolved = [];
  for (const relPath of selected) {
    const absolute = path.resolve(workspaceRoot, relPath);
    if (absolute !== workspaceRoot && !absolute.startsWith(`${workspaceRoot}${path.sep}`)) continue;
    if (!fs.existsSync(absolute)) continue;
    resolved.push({ relPath, absolute });
  }
  return resolved;
}

function relativeToWorkspace(workspaceRoot, absolutePath) {
  const value = path.relative(workspaceRoot, absolutePath).replace(/\\/g, '/');
  return value || '.';
}

function createEventEmitter(emit) {
  let timer = null;
  let lastPayload = null;

  return (payload) => {
    lastPayload = payload;
    if (timer) return;
    timer = setTimeout(() => {
      timer = null;
      const next = lastPayload;
      lastPayload = null;
      emit(next);
    }, 150);
  };
}

export async function createDesktopWatcher(options = {}) {
  const workspaceRoot = path.resolve(String(options.workspaceRoot || process.cwd()));
  const settings = {
    ...DEFAULT_DESKTOP_WATCHER_SETTINGS,
    ...(options.settings || {}),
  };
  const emitEvent = typeof options.emitEvent === 'function' ? options.emitEvent : () => {};
  const watched = normalizeWatchedRoots(workspaceRoot, settings.watchedRoots);
  const watchedPaths = watched.map((item) => item.absolute);
  const watchedRoots = watched.map((item) => item.relPath);

  if (settings.enabled === false || watchedPaths.length === 0) {
    emitEvent({
      type: DESKTOP_RUNTIME_EVENT_TYPES.watcherHealth,
      status: 'disabled',
      watchedRoots,
      polling: false,
      timestamp: new Date().toISOString(),
      reason: settings.enabled === false ? 'disabled-by-config' : 'no-watchable-roots',
    });
    return {
      mode: 'disabled',
      watchedRoots,
      close: async () => {},
    };
  }

  let usePolling = false;
  let activeWatcher = null;
  const emitChange = createEventEmitter((payload) => emitEvent(payload));

  const emitHealth = (status, reason = '') => {
    emitEvent({
      type: DESKTOP_RUNTIME_EVENT_TYPES.watcherHealth,
      status,
      reason,
      watchedRoots,
      polling: usePolling,
      timestamp: new Date().toISOString(),
    });
  };

  const attachWatcher = () => {
    const watcher = chokidar.watch(watchedPaths, {
      ignoreInitial: true,
      persistent: true,
      usePolling,
      interval: Number(settings.pollingIntervalMs || DEFAULT_DESKTOP_WATCHER_SETTINGS.pollingIntervalMs),
      awaitWriteFinish: {
        stabilityThreshold: 180,
        pollInterval: 60,
      },
    });

    watcher.on('all', (eventName, filePath) => {
      const normalized = relativeToWorkspace(workspaceRoot, filePath);
      emitChange({
        type: DESKTOP_RUNTIME_EVENT_TYPES.treeChanged,
        eventName,
        path: normalized,
        timestamp: new Date().toISOString(),
      });
      emitChange({
        type: DESKTOP_RUNTIME_EVENT_TYPES.searchInvalidated,
        eventName,
        path: normalized,
        timestamp: new Date().toISOString(),
      });
      emitChange({
        type: DESKTOP_RUNTIME_EVENT_TYPES.gitStatusInvalidated,
        eventName,
        path: normalized,
        timestamp: new Date().toISOString(),
      });
    });

    watcher.on('error', async (error) => {
      if (!usePolling && settings.fallbackPolling) {
        usePolling = true;
        emitHealth('recovering', String(error?.message || error));
        try {
          await watcher.close();
        } catch {
          // ignore close failures during fallback
        }
        activeWatcher = attachWatcher();
        emitHealth('active', 'polling-fallback');
        return;
      }
      emitHealth('error', String(error?.message || error));
    });

    return watcher;
  };

  activeWatcher = attachWatcher();
  emitHealth('active');

  return {
    mode: usePolling ? 'polling' : 'native',
    watchedRoots,
    close: async () => {
      if (!activeWatcher) return;
      try {
        await activeWatcher.close();
      } finally {
        activeWatcher = null;
        emitHealth('stopped');
      }
    },
  };
}

