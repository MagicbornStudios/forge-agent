import { getAppDefaults, getProjectDefaults } from "./schema";

export type SettingsDefaults = Record<string, unknown>;

export interface SettingsConfig {
  appDefaults: SettingsDefaults;
  projectDefaults: SettingsDefaults;
  editorDefaults: Record<string, SettingsDefaults>;
  viewportDefaults: Record<string, SettingsDefaults>;
}

export const SETTINGS_CONFIG: SettingsConfig = {
  appDefaults: getAppDefaults(),
  projectDefaults: getProjectDefaults(),
  editorDefaults: {
    dialogue: {
      "ai.agentName": "Dialogue Agent",
    },
    video: {
      "ai.agentName": "Video Agent",
    },
    character: {
      "ai.agentName": "Character Agent",
    },
    strategy: {
      "ai.agentName": "Strategy Agent",
    },
  },
  viewportDefaults: {},
};

export function getEditorDefaults(editorId?: string) {
  if (!editorId) return {};
  return SETTINGS_CONFIG.editorDefaults[editorId] ?? {};
}

export function getViewportDefaults(editorId?: string, viewportId?: string) {
  if (!editorId || !viewportId) return {};
  const key = `${editorId}:${viewportId}`;
  return SETTINGS_CONFIG.viewportDefaults[key] ?? {};
}
