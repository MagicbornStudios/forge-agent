import {
  APP_DEFAULTS,
  VIEWPORT_DEFAULTS,
  getViewportDefaults as getViewportDefaultsGenerated,
  type SettingsDefaults,
} from "./generated/defaults";

export type { SettingsDefaults };

export interface SettingsConfig {
  appDefaults: SettingsDefaults;
  projectDefaults: SettingsDefaults;
  workspaceDefaults: Record<string, SettingsDefaults>;
  viewportDefaults: Record<string, SettingsDefaults>;
}

/** Minimal workspace-scoped overrides (v1: not yet in tree; see settings codegen doc). */
const WORKSPACE_DEFAULTS_OVERRIDES: Record<string, SettingsDefaults> = {
  dialogue: { "ai.agentName": "Dialogue Agent" },
  character: { "ai.agentName": "Character Agent" },
};

/** Viewport-specific defaults that override generated VIEWPORT_DEFAULTS. */
const VIEWPORT_DEFAULTS_OVERRIDES: Record<string, SettingsDefaults> = {
  "dialogue:narrative": { "graph.allowedNodeTypes": ["PAGE"] },
  "dialogue:storylet": { "graph.allowedNodeTypes": ["CHARACTER", "PLAYER", "CONDITIONAL"] },
  "character:main": { "graph.allowedNodeTypes": ["characterCard"] },
};

function mergeViewportDefaults(base: Record<string, SettingsDefaults>): Record<string, SettingsDefaults> {
  const out: Record<string, SettingsDefaults> = {};
  for (const key of Object.keys(base)) {
    out[key] = { ...base[key], ...(VIEWPORT_DEFAULTS_OVERRIDES[key] ?? {}) };
  }
  return out;
}

/** Project defaults: v1 empty; extend when project-scoped registration is in tree. */
const PROJECT_DEFAULTS_OVERRIDES: SettingsDefaults = {};

export const SETTINGS_CONFIG: SettingsConfig = {
  appDefaults: APP_DEFAULTS,
  projectDefaults: PROJECT_DEFAULTS_OVERRIDES,
  workspaceDefaults: WORKSPACE_DEFAULTS_OVERRIDES,
  viewportDefaults: mergeViewportDefaults(VIEWPORT_DEFAULTS),
};

export function getWorkspaceDefaults(workspaceId?: string) {
  if (!workspaceId) return {};
  return SETTINGS_CONFIG.workspaceDefaults[workspaceId] ?? {};
}

export function getViewportDefaults(workspaceId?: string, viewportId?: string): SettingsDefaults {
  if (!workspaceId || !viewportId) return {};
  const base = getViewportDefaultsGenerated(workspaceId, viewportId);
  const overrides = VIEWPORT_DEFAULTS_OVERRIDES[`${workspaceId}:${viewportId}`];
  return overrides ? { ...base, ...overrides } : base;
}
