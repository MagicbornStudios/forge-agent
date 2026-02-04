"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export type SettingsScope = "app" | "workspace" | "editor";

export interface SettingsState {
  appSettings: Record<string, unknown>;
  workspaceSettings: Record<string, Record<string, unknown>>;
  editorSettings: Record<string, Record<string, unknown>>;

  setSetting: (
    scope: SettingsScope,
    key: string,
    value: unknown,
    ids?: { workspaceId?: string; editorId?: string }
  ) => void;
  clearSetting: (
    scope: SettingsScope,
    key: string,
    ids?: { workspaceId?: string; editorId?: string }
  ) => void;

  getMergedSettings: (ids?: { workspaceId?: string; editorId?: string }) => Record<string, unknown>;
  getSettingValue: (
    key: string,
    ids?: { workspaceId?: string; editorId?: string }
  ) => unknown;
  getSettingSource: (
    key: string,
    ids?: { workspaceId?: string; editorId?: string }
  ) => SettingsScope | "unset";
}

const DEFAULT_APP_SETTINGS: Record<string, unknown> = {
  "ai.agentName": "Forge Assistant",
  "ai.instructions":
    "You are an AI assistant for a creative workspace. Use available actions to help users edit their projects.",
  "ai.model": "auto",
  "ai.temperature": 0.2,
  "ai.toolsEnabled": true,
  "ai.showAgentName": true,
  "ui.toastsEnabled": true,
  "ui.theme": "dark-fantasy",
};

const DEFAULT_WORKSPACE_SETTINGS: Record<string, Record<string, unknown>> = {
  forge: {
    "ai.agentName": "Forge Agent",
  },
  video: {
    "ai.agentName": "Video Agent",
  },
};

function getEditorKey(workspaceId?: string, editorId?: string) {
  if (!workspaceId || !editorId) return null;
  return `${workspaceId}:${editorId}`;
}

export const useSettingsStore = create<SettingsState>()(
  immer((set, get) => ({
    appSettings: { ...DEFAULT_APP_SETTINGS },
    workspaceSettings: { ...DEFAULT_WORKSPACE_SETTINGS },
    editorSettings: {},

    setSetting: (scope, key, value, ids) => {
      set((state) => {
        if (scope === "app") {
          state.appSettings[key] = value;
          return;
        }
        if (scope === "workspace") {
          const workspaceId = ids?.workspaceId;
          if (!workspaceId) return;
          if (!state.workspaceSettings[workspaceId]) {
            state.workspaceSettings[workspaceId] = {};
          }
          state.workspaceSettings[workspaceId][key] = value;
          return;
        }
        if (scope === "editor") {
          const editorKey = getEditorKey(ids?.workspaceId, ids?.editorId);
          if (!editorKey) return;
          if (!state.editorSettings[editorKey]) {
            state.editorSettings[editorKey] = {};
          }
          state.editorSettings[editorKey][key] = value;
        }
      });
    },

    clearSetting: (scope, key, ids) => {
      set((state) => {
        if (scope === "app") {
          delete state.appSettings[key];
          return;
        }
        if (scope === "workspace") {
          const workspaceId = ids?.workspaceId;
          if (!workspaceId) return;
          if (state.workspaceSettings[workspaceId]) {
            delete state.workspaceSettings[workspaceId][key];
          }
          return;
        }
        if (scope === "editor") {
          const editorKey = getEditorKey(ids?.workspaceId, ids?.editorId);
          if (!editorKey) return;
          if (state.editorSettings[editorKey]) {
            delete state.editorSettings[editorKey][key];
          }
        }
      });
    },

    getMergedSettings: (ids) => {
      const { appSettings, workspaceSettings, editorSettings } = get();
      const workspaceId = ids?.workspaceId;
      const editorKey = getEditorKey(ids?.workspaceId, ids?.editorId);
      return {
        ...appSettings,
        ...(workspaceId ? workspaceSettings[workspaceId] ?? {} : {}),
        ...(editorKey ? editorSettings[editorKey] ?? {} : {}),
      };
    },

    getSettingValue: (key, ids) => {
      const merged = get().getMergedSettings(ids);
      return merged[key];
    },

    getSettingSource: (key, ids) => {
      const { appSettings, workspaceSettings, editorSettings } = get();
      const workspaceId = ids?.workspaceId;
      const editorKey = getEditorKey(ids?.workspaceId, ids?.editorId);
      if (editorKey && editorSettings[editorKey] && key in editorSettings[editorKey]) {
        return "editor";
      }
      if (workspaceId && workspaceSettings[workspaceId] && key in workspaceSettings[workspaceId]) {
        return "workspace";
      }
      if (key in appSettings) {
        return "app";
      }
      return "unset";
    },
  }))
);
