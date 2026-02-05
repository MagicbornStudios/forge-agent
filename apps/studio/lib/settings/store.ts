"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { SettingsOverrideRecord } from "@forge/types/payload";
import { SETTINGS_CONFIG, getEditorDefaults, getWorkspaceDefaults } from "./config";

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

  /** Apply stored overrides (e.g. from Payload) on top of defaults. */
  hydrateFromOverrides: (overrides: SettingsOverrideRecord[]) => void;
  /** Get overridden keys only for a scope (for persisting). */
  getOverridesForScope: (
    scope: SettingsScope,
    ids?: { workspaceId?: string; editorId?: string }
  ) => Record<string, unknown>;
  /** Reset to config defaults (clears any overrides). */
  resetToDefaults: () => void;
}

const DEFAULT_APP_SETTINGS = SETTINGS_CONFIG.appDefaults;
const DEFAULT_WORKSPACE_SETTINGS = SETTINGS_CONFIG.workspaceDefaults;
const DEFAULT_EDITOR_SETTINGS = SETTINGS_CONFIG.editorDefaults;

function getEditorKey(workspaceId?: string, editorId?: string) {
  if (!workspaceId || !editorId) return null;
  return `${workspaceId}:${editorId}`;
}

function toSettingsObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function buildInitialState() {
  return {
    appSettings: { ...DEFAULT_APP_SETTINGS },
    workspaceSettings: { ...DEFAULT_WORKSPACE_SETTINGS },
    editorSettings: { ...DEFAULT_EDITOR_SETTINGS },
  };
}

export const useSettingsStore = create<SettingsState>()(
  immer((set, get) => ({
    ...buildInitialState(),

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
        ...(workspaceId ? { ...getWorkspaceDefaults(workspaceId), ...(workspaceSettings[workspaceId] ?? {}) } : {}),
        ...(editorKey ? { ...getEditorDefaults(ids?.workspaceId, ids?.editorId), ...(editorSettings[editorKey] ?? {}) } : {}),
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

    hydrateFromOverrides: (overrides) => {
      set((state) => {
        const initial = buildInitialState();
        state.appSettings = { ...initial.appSettings };
        state.workspaceSettings = { ...initial.workspaceSettings };
        state.editorSettings = { ...initial.editorSettings };

        for (const record of overrides) {
          const settings = toSettingsObject(record.settings);
          if (record.scope === "app") {
            state.appSettings = { ...state.appSettings, ...settings };
            continue;
          }
          if (record.scope === "workspace") {
            const workspaceId = record.scopeId ?? "unknown";
            state.workspaceSettings[workspaceId] = {
              ...(state.workspaceSettings[workspaceId] ?? {}),
              ...settings,
            };
            continue;
          }
          if (record.scope === "editor") {
            const editorKey = record.scopeId ?? "unknown";
            state.editorSettings[editorKey] = {
              ...(state.editorSettings[editorKey] ?? {}),
              ...settings,
            };
          }
        }
      });
    },

    getOverridesForScope: (scope, ids) => {
      const { appSettings, workspaceSettings, editorSettings } = get();
      const out: Record<string, unknown> = {};
      if (scope === "app") {
        for (const key of Object.keys(appSettings)) {
          const def = DEFAULT_APP_SETTINGS[key];
          if (appSettings[key] !== def) {
            out[key] = appSettings[key];
          }
        }
        return out;
      }
      if (scope === "workspace" && ids?.workspaceId) {
        const wsId = ids.workspaceId;
        const defaults = getWorkspaceDefaults(wsId);
        const current = workspaceSettings[wsId] ?? {};
        for (const key of Object.keys(current)) {
          if (current[key] !== defaults[key]) {
            out[key] = current[key];
          }
        }
        return out;
      }
      if (scope === "editor" && ids?.workspaceId && ids?.editorId) {
        const editorKey = getEditorKey(ids.workspaceId, ids.editorId);
        if (!editorKey) return {};
        const defaults = getEditorDefaults(ids.workspaceId, ids.editorId);
        const current = editorSettings[editorKey] ?? {};
        for (const key of Object.keys(current)) {
          if (current[key] !== defaults[key]) {
            out[key] = current[key];
          }
        }
        return out;
      }
      return out;
    },

    resetToDefaults: () => {
      set((state) => {
        const initial = buildInitialState();
        state.appSettings = { ...initial.appSettings };
        state.workspaceSettings = { ...initial.workspaceSettings };
        state.editorSettings = { ...initial.editorSettings };
      });
    },
  }))
);
