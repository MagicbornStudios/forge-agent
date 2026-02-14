import path from 'node:path';

import { readJson, writeJson } from './io.mjs';

export const REPO_STUDIO_DIR = path.join(process.cwd(), '.repo-studio');
export const REPO_STUDIO_CONFIG_PATH = path.join(REPO_STUDIO_DIR, 'config.json');
export const REPO_STUDIO_LOCAL_OVERRIDES_PATH = path.join(REPO_STUDIO_DIR, 'local.overrides.json');

export const DEFAULT_REPO_STUDIO_CONFIG = {
  runtime: {
    defaultMode: 'auto',
    reuseByDefault: true,
    defaultPort: 3864,
  },
  commandPolicy: {
    mode: 'allowlist',
    sources: ['root-scripts', 'workspace-scripts', 'forge-builtins'],
    defaultSources: ['forge-builtins', 'root-scripts'],
    requireConfirm: true,
    denyPatterns: ['rm -rf', 'git reset --hard'],
    disabledCommandIds: [],
    allowTerminal: true,
    terminalAllowlistedOnly: true,
  },
  views: {
    order: ['planning', 'env', 'commands', 'docs', 'loop-assistant', 'codex-assistant', 'diff'],
    hidden: [],
    defaultView: 'planning',
  },
  ui: {
    defaultTheme: 'dark',
    defaultView: 'planning',
    defaultDensity: 'compact',
  },
  assistant: {
    enabled: true,
    defaultEditor: 'loop-assistant',
    editors: ['loop-assistant', 'codex-assistant'],
    routeMode: 'codex',
    routePath: '/api/assistant-chat',
    defaultModel: 'gpt-5',
    attachContextMaxFiles: 6,
    attachContextMaxChars: 16000,
    codex: {
      enabled: true,
      cliCommand: 'codex',
      authPolicy: 'chatgpt-strict',
      mode: 'app-server',
      appServerUrl: 'ws://127.0.0.1:3789',
      defaultModel: 'gpt-5',
      approvalMode: 'on-request',
      sandboxMode: 'workspace-write',
    },
  },
  docs: {
    paths: {
      forgeLoop: 'packages/forge-loop/docs',
      forgeEnv: 'packages/forge-env/docs',
      repoStudio: 'packages/repo-studio/docs',
    },
  },
  loop: {
    paths: {
      planningRoot: '.planning',
      phasesDir: '.planning/phases',
    },
  },
  loops: {
    defaultLoopId: 'default',
    indexPath: '.planning/LOOPS.json',
  },
};

export const DEFAULT_REPO_STUDIO_LOCAL_OVERRIDES = {
  commandPolicy: {
    disabledCommandIds: [],
  },
  commandView: {
    query: '',
    source: 'all',
    status: 'all',
    tab: 'recommended',
    sort: 'id',
  },
  recentRuns: [],
  runtime: {
    lastView: 'planning',
  },
  loops: {
    activeLoopId: 'default',
  },
};

function mergeObjects(base, override) {
  const result = { ...(base || {}) };
  if (!override || typeof override !== 'object') return result;
  for (const [key, value] of Object.entries(override)) {
    if (Array.isArray(value)) {
      result[key] = [...value];
      continue;
    }
    if (value && typeof value === 'object') {
      result[key] = mergeObjects(base?.[key] || {}, value);
      continue;
    }
    result[key] = value;
  }
  return result;
}

function normalizeConfigShape(config) {
  const normalized = mergeObjects(DEFAULT_REPO_STUDIO_CONFIG, config || {});
  const docs = normalized.docs || {};
  const loop = normalized.loop || {};

  if (!docs.paths) {
    normalized.docs = {
      ...docs,
      paths: {
        forgeLoop: docs.forgeLoopPath || DEFAULT_REPO_STUDIO_CONFIG.docs.paths.forgeLoop,
        forgeEnv: docs.forgeEnvPath || DEFAULT_REPO_STUDIO_CONFIG.docs.paths.forgeEnv,
        repoStudio: docs.repoStudioPath || DEFAULT_REPO_STUDIO_CONFIG.docs.paths.repoStudio,
      },
    };
  }

  if (!loop.paths) {
    normalized.loop = {
      ...loop,
      paths: {
        planningRoot: loop.planningRoot || DEFAULT_REPO_STUDIO_CONFIG.loop.paths.planningRoot,
        phasesDir: loop.phasesDir || DEFAULT_REPO_STUDIO_CONFIG.loop.paths.phasesDir,
      },
    };
  }
  if (!normalized.loops || typeof normalized.loops !== 'object') {
    normalized.loops = { ...DEFAULT_REPO_STUDIO_CONFIG.loops };
  } else {
    normalized.loops = {
      defaultLoopId: String(normalized.loops.defaultLoopId || DEFAULT_REPO_STUDIO_CONFIG.loops.defaultLoopId),
      indexPath: String(normalized.loops.indexPath || DEFAULT_REPO_STUDIO_CONFIG.loops.indexPath),
    };
  }

  if (normalized?.views && !Array.isArray(normalized.views.order)) {
    normalized.views.order = [...DEFAULT_REPO_STUDIO_CONFIG.views.order];
  }
  if (normalized?.views && !Array.isArray(normalized.views.hidden)) {
    normalized.views.hidden = [];
  }
  if (!normalized.views.defaultView) {
    normalized.views.defaultView = normalized.ui?.defaultView || DEFAULT_REPO_STUDIO_CONFIG.views.defaultView;
  }
  if (!normalized.ui.defaultView) {
    normalized.ui.defaultView = normalized.views.defaultView;
  }

  return normalized;
}

export async function loadRepoStudioConfig() {
  const onDisk = await readJson(REPO_STUDIO_CONFIG_PATH, null);
  return normalizeConfigShape(onDisk || {});
}

export async function loadRepoStudioLocalOverrides() {
  const onDisk = await readJson(REPO_STUDIO_LOCAL_OVERRIDES_PATH, null);
  return mergeObjects(DEFAULT_REPO_STUDIO_LOCAL_OVERRIDES, onDisk || {});
}

export async function saveRepoStudioLocalOverrides(overrides) {
  const merged = mergeObjects(DEFAULT_REPO_STUDIO_LOCAL_OVERRIDES, overrides || {});
  await writeJson(REPO_STUDIO_LOCAL_OVERRIDES_PATH, merged);
  return merged;
}
