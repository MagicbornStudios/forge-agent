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
    routeMode?: 'codex' | 'local' | 'proxy' | 'openrouter' | string;
    routePath?: string;
    routes?: {
      forge?: {
        mode?: 'shared-runtime' | 'proxy' | 'openrouter' | 'local' | string;
        routePath?: string;
      };
      codex?: {
        mode?: 'codex' | string;
        transport?: 'app-server' | 'exec' | string;
        execFallbackAllowed?: boolean;
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
  const mode = String(forge?.mode || 'shared-runtime').trim().toLowerCase();
  const routePath = String(forge?.routePath || config?.assistant?.routePath || '').trim();
  return {
    mode: mode || 'shared-runtime',
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
