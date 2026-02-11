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
  editorDefaults: Record<string, SettingsDefaults>;
  viewportDefaults: Record<string, SettingsDefaults>;
}

/** Minimal editor-scoped overrides (v1: not yet in tree; see settings codegen doc). */
const EDITOR_DEFAULTS_OVERRIDES: Record<string, SettingsDefaults> = {
  dialogue: { "ai.agentName": "Dialogue Agent" },
  character: { "ai.agentName": "Character Agent" },
};

/** Project defaults: v1 empty; extend when project-scoped registration is in tree. */
const PROJECT_DEFAULTS_OVERRIDES: SettingsDefaults = {};

export const SETTINGS_CONFIG: SettingsConfig = {
  appDefaults: APP_DEFAULTS,
  projectDefaults: PROJECT_DEFAULTS_OVERRIDES,
  editorDefaults: EDITOR_DEFAULTS_OVERRIDES,
  viewportDefaults: VIEWPORT_DEFAULTS,
};

export function getEditorDefaults(editorId?: string) {
  if (!editorId) return {};
  return SETTINGS_CONFIG.editorDefaults[editorId] ?? {};
}

export function getViewportDefaults(editorId?: string, viewportId?: string): SettingsDefaults {
  if (!editorId || !viewportId) return {};
  return getViewportDefaultsGenerated(editorId, viewportId);
}
