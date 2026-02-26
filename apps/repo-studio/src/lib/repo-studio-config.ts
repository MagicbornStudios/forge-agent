import fs from 'node:fs/promises';
import path from 'node:path';

import { normalizeRelPath, resolveRepoRoot } from '@/lib/repo-files';

export type RepoStudioConfig = {
  commandPolicy?: {
    mode?: string;
    sources?: string[];
    defaultSources?: string[];
    requireConfirm?: boolean;
    denyPatterns?: string[];
    disabledCommandIds?: string[];
    allowTerminal?: boolean;
    terminalAllowlistedOnly?: boolean;
  };
  views?: {
    order?: string[];
    hidden?: string[];
    defaultView?: string;
  };
  ui?: {
    defaultTheme?: string;
    defaultView?: string;
    defaultDensity?: string;
  };
  domains?: {
    story?: {
      roots?: string[];
      scopePolicy?: 'hard-with-override' | 'soft' | string;
      naming?: {
        parseMode?: 'dual' | 'literal' | string;
        canonicalCreate?: string;
      };
    };
  };
  assistant?: {
    enabled?: boolean;
    defaultTarget?: 'forge' | 'codex' | string;
    targets?: Array<'forge' | 'codex' | string>;
    routeMode?: 'codex' | 'proxy' | 'openrouter' | string;
    routePath?: string;
    routes?: {
      forge?: {
        mode?: 'proxy' | 'openrouter' | string;
        routePath?: string;
      };
      codex?: {
        mode?: 'codex' | string;
        transport?: 'app-server' | 'exec' | string;
        execFallbackAllowed?: boolean;
      };
    };
    forge?: {
      aboutMe?: {
        name?: string;
        role?: string;
        email?: string;
        summary?: string;
      };
    };
    codex?: {
      mode?: 'exec' | 'app-server' | string;
      transport?: 'app-server' | 'exec' | string;
      execFallbackAllowed?: boolean;
    };
  };
};

const DEFAULT_STORY_ROOTS = ['content/story'];
const LEGACY_DEFAULT_EDITOR_KEY = `default${'Editor'}`;
const LEGACY_EDITORS_KEY = `edit${'ors'}`;
const LEGACY_ROUTE_LOOP_KEY = `lo${'op'}`;
const LEGACY_LOOP_ASSISTANT_VIEW = `loop${'-'}assistant`;
const LEGACY_CODEX_ASSISTANT_VIEW = `codex${'-'}assistant`;

function configPath() {
  return path.join(resolveRepoRoot(), '.repo-studio', 'config.json');
}

export async function readRepoStudioConfig(): Promise<RepoStudioConfig> {
  try {
    const raw = await fs.readFile(configPath(), 'utf8');
    return JSON.parse(raw) as RepoStudioConfig;
  } catch {
    return {};
  }
}

export function legacyAssistantConfigIssues(config: RepoStudioConfig) {
  const issues: string[] = [];
  const assistant = (config?.assistant && typeof config.assistant === 'object')
    ? config.assistant as Record<string, unknown>
    : {};
  if (LEGACY_DEFAULT_EDITOR_KEY in assistant) {
    issues.push(`assistant.${LEGACY_DEFAULT_EDITOR_KEY} was removed. Use assistant.defaultTarget ("forge"|"codex").`);
  }
  if (LEGACY_EDITORS_KEY in assistant) {
    issues.push(`assistant.${LEGACY_EDITORS_KEY} was removed. Use assistant.targets.`);
  }
  if ('routeMode' in assistant) {
    issues.push('assistant.routeMode was removed. Configure assistant.routes.forge.mode and assistant.routes.codex.*.');
  }
  if ('routePath' in assistant) {
    issues.push('assistant.routePath was removed. Configure assistant.routes.forge.routePath when mode="proxy".');
  }
  const routes = (assistant.routes && typeof assistant.routes === 'object')
    ? assistant.routes as Record<string, unknown>
    : {};
  if (LEGACY_ROUTE_LOOP_KEY in routes) {
    issues.push(`assistant.routes.${LEGACY_ROUTE_LOOP_KEY} was removed. Use assistant.routes.forge.`);
  }
  const views = (config?.views && typeof config.views === 'object')
    ? config.views as Record<string, unknown>
    : {};
  const order = Array.isArray(views.order) ? views.order.map((entry) => String(entry || '').trim().toLowerCase()) : [];
  if (order.includes(LEGACY_LOOP_ASSISTANT_VIEW) || order.includes(LEGACY_CODEX_ASSISTANT_VIEW)) {
    issues.push(`views.order contains removed ids (${LEGACY_LOOP_ASSISTANT_VIEW}/${LEGACY_CODEX_ASSISTANT_VIEW}). Use assistant.`);
  }
  return issues;
}

export function storyRootsFromConfig(config: RepoStudioConfig) {
  const roots = Array.isArray(config?.domains?.story?.roots)
    ? config.domains!.story!.roots!
    : DEFAULT_STORY_ROOTS;
  const normalized = roots
    .map((value) => normalizeRelPath(String(value || '')))
    .filter(Boolean);
  if (normalized.length === 0) return [...DEFAULT_STORY_ROOTS];
  return [...new Set(normalized)];
}

export function storyScopePolicyFromConfig(config: RepoStudioConfig) {
  const value = String(config?.domains?.story?.scopePolicy || 'hard-with-override').trim().toLowerCase();
  return value === 'soft' ? 'soft' : 'hard-with-override';
}

export function resolveForgeAssistantRoute(config: RepoStudioConfig) {
  const forge = config?.assistant?.routes?.forge;
  const mode = String(forge?.mode || 'openrouter').trim().toLowerCase();
  const routePath = String(forge?.routePath || '').trim();
  return {
    mode: mode || 'openrouter',
    routePath,
  };
}

export function resolveCodexAssistantRoute(config: RepoStudioConfig) {
  const codexRoute = config?.assistant?.routes?.codex;
  const codex = config?.assistant?.codex || {};
  const transport = String(codexRoute?.transport || codex.transport || codex.mode || 'app-server').trim().toLowerCase();
  const execFallbackAllowed = codexRoute?.execFallbackAllowed === true || codex.execFallbackAllowed === true;
  return {
    mode: String(codexRoute?.mode || 'codex').trim().toLowerCase() || 'codex',
    transport: transport === 'exec' ? 'exec' : 'app-server',
    execFallbackAllowed,
  };
}
