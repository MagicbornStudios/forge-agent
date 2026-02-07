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
    "editor.locked": false,
    "panel.visible.dialogue-left": true,
    "panel.visible.dialogue-right": true,
    "panel.visible.dialogue-bottom": true,
    "panel.visible.character-left": true,
    "panel.visible.character-right": true,
    "panel.visible.video-right": true,
    "panel.visible.video-bottom": true,
    "panel.visible.strategy-left": true,
    "panel.visible.strategy-right": true,
  },
  workspaceDefaults: {
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
