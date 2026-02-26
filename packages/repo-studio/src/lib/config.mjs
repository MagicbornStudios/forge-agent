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
    desktopDefaultPort: 3020,
    desktopWatcher: {
      enabled: true,
      fallbackPolling: true,
      pollingIntervalMs: 1200,
      watchedRoots: ['.planning', 'apps', 'packages', 'content/story'],
    },
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
    order: ['planning', 'env', 'commands', 'story', 'git', 'assistant', 'diff', 'code', 'review-queue'],
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
    defaultTarget: 'forge',
    targets: ['forge', 'codex'],
    routeMode: 'codex',
    routePath: '/api/assistant-chat',
    routes: {
      forge: {
        mode: 'shared-runtime',
        routePath: '/api/assistant-chat',
      },
      codex: {
        mode: 'codex',
        transport: 'app-server',
        execFallbackAllowed: false,
      },
    },
    defaultModel: 'gpt-5',
    attachContextMaxFiles: 6,
    attachContextMaxChars: 16000,
    codex: {
      enabled: true,
      cliCommand: 'codex',
      authPolicy: 'chatgpt-strict',
      mode: 'app-server',
      transport: 'app-server',
      execFallbackAllowed: false,
      appServerUrl: 'ws://127.0.0.1:3789',
      defaultModel: 'gpt-5',
      approvalMode: 'on-request',
      sandboxMode: 'workspace-write',
    },
    applyPolicy: {
      mode: 'review-queue',
      allowPlanningWrites: true,
      requireApproval: true,
    },
  },
  domains: {
    story: {
      roots: ['content/story'],
      scopePolicy: 'hard-with-override',
      naming: {
        parseMode: 'dual',
        canonicalCreate: 'act-01/chapter-01/page-001.md',
      },
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
  reviewQueue: {
    collapsed: false,
    selectedProposalId: null,
  },
  story: {
    activePath: '',
    reader: {
      lastPagePath: '',
    },
    scopeOverride: {
      lastTokenId: '',
    },
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

  const assistant = normalized.assistant || {};
  const codex = assistant.codex || {};
  const routes = assistant.routes || {};
  const defaultTarget = String(assistant.defaultTarget || 'forge').trim().toLowerCase();
  const targets = Array.isArray(assistant.targets)
    ? assistant.targets.map((entry) => String(entry || '').trim().toLowerCase()).filter(Boolean)
    : [];

  assistant.codex = {
    ...DEFAULT_REPO_STUDIO_CONFIG.assistant.codex,
    ...codex,
    transport: codex.transport === 'exec' ? 'exec' : 'app-server',
    execFallbackAllowed: codex.execFallbackAllowed === true,
  };

  assistant.defaultTarget = defaultTarget === 'codex' ? 'codex' : 'forge';
  assistant.targets = [...new Set(
    targets.filter((entry) => entry === 'forge' || entry === 'codex'),
  )];
  if (assistant.targets.length === 0) {
    assistant.targets = [...DEFAULT_REPO_STUDIO_CONFIG.assistant.targets];
  }

  assistant.routes = {
    forge: {
      ...DEFAULT_REPO_STUDIO_CONFIG.assistant.routes.forge,
      ...(routes.forge || {}),
    },
    codex: {
      ...DEFAULT_REPO_STUDIO_CONFIG.assistant.routes.codex,
      ...(routes.codex || {}),
      transport: String(routes.codex?.transport || assistant.codex.transport || 'app-server') === 'exec'
        ? 'exec'
        : 'app-server',
      execFallbackAllowed: routes.codex?.execFallbackAllowed === true || assistant.codex.execFallbackAllowed === true,
    },
  };
  assistant.applyPolicy = {
    ...DEFAULT_REPO_STUDIO_CONFIG.assistant.applyPolicy,
    ...(assistant.applyPolicy || {}),
    mode: 'review-queue',
    requireApproval: true,
    allowPlanningWrites: assistant.applyPolicy?.allowPlanningWrites !== false,
  };
  normalized.assistant = assistant;

  const domains = normalized.domains || {};
  normalized.domains = {
    ...DEFAULT_REPO_STUDIO_CONFIG.domains,
    ...domains,
    story: {
      ...DEFAULT_REPO_STUDIO_CONFIG.domains.story,
      ...(domains.story || {}),
      roots: Array.isArray(domains.story?.roots) && domains.story.roots.length > 0
        ? [...domains.story.roots]
        : [...DEFAULT_REPO_STUDIO_CONFIG.domains.story.roots],
      scopePolicy: String(domains.story?.scopePolicy || DEFAULT_REPO_STUDIO_CONFIG.domains.story.scopePolicy),
      naming: {
        ...DEFAULT_REPO_STUDIO_CONFIG.domains.story.naming,
        ...(domains.story?.naming || {}),
      },
    },
  };

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
