export type SettingsDefaults = Record<string, unknown>;

export interface SettingsConfig {
  appDefaults: SettingsDefaults;
  workspaceDefaults: Record<string, SettingsDefaults>;
  editorDefaults: Record<string, SettingsDefaults>;
}

export const SETTINGS_CONFIG: SettingsConfig = {
  appDefaults: {
    "ai.agentName": "Forge Assistant",
    "ai.instructions":
      "You are an AI assistant for a creative workspace. Use available actions to help users edit their projects.",
    "ai.model": "auto",
    "ai.temperature": 0.2,
    "ai.toolsEnabled": true,
    "ai.showAgentName": true,
    "ui.toastsEnabled": true,
    "ui.theme": "dark-fantasy",
  },
  workspaceDefaults: {
    forge: {
      "ai.agentName": "Forge Agent",
    },
    video: {
      "ai.agentName": "Video Agent",
    },
  },
  editorDefaults: {},
};

export function getWorkspaceDefaults(workspaceId?: string) {
  if (!workspaceId) return {};
  return SETTINGS_CONFIG.workspaceDefaults[workspaceId] ?? {};
}

export function getEditorDefaults(workspaceId?: string, editorId?: string) {
  if (!workspaceId || !editorId) return {};
  const key = `${workspaceId}:${editorId}`;
  return SETTINGS_CONFIG.editorDefaults[key] ?? {};
}
