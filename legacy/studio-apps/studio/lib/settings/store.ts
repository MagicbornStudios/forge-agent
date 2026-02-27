"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { SettingsOverrideRecord } from "@forge/types/payload";
import { SETTINGS_CONFIG, getWorkspaceDefaults, getViewportDefaults } from "./config";

export type SettingsScope = "app" | "project" | "workspace" | "viewport";

/** Scope literal constants for settings (use instead of string literals). */
export const SETTINGS_SCOPE = {
  APP: "app",
  PROJECT: "project",
  WORKSPACE: "workspace",
  VIEWPORT: "viewport",
} as const satisfies Record<string, SettingsScope>;

export interface SettingsState {
  appSettings: Record<string, unknown>;
  projectSettings: Record<string, Record<string, unknown>>;
  workspaceSettings: Record<string, Record<string, unknown>>;
  viewportSettings: Record<string, Record<string, unknown>>;

  setSetting: (
    scope: SettingsScope,
    key: string,
    value: unknown,
    ids?: { workspaceId?: string; viewportId?: string; projectId?: string }
  ) => void;
  clearSetting: (
    scope: SettingsScope,
    key: string,
    ids?: { workspaceId?: string; viewportId?: string; projectId?: string }
  ) => void;

  getMergedSettings: (ids?: { workspaceId?: string; viewportId?: string; projectId?: string }) => Record<string, unknown>;
  getSettingValue: (
    key: string,
    ids?: { workspaceId?: string; viewportId?: string; projectId?: string }
  ) => unknown;
  getSettingSource: (
    key: string,
    ids?: { workspaceId?: string; viewportId?: string; projectId?: string }
  ) => SettingsScope | "unset";

  /** Apply stored overrides (e.g. from Payload) on top of defaults. */
  hydrateFromOverrides: (overrides: SettingsOverrideRecord[]) => void;
  /** Get overridden keys only for a scope (for persisting). */
  getOverridesForScope: (
    scope: SettingsScope,
    ids?: { workspaceId?: string; viewportId?: string; projectId?: string }
  ) => Record<string, unknown>;
  /** Reset to config defaults (clears any overrides). */
  resetToDefaults: () => void;
}

const DEFAULT_APP_SETTINGS = SETTINGS_CONFIG.appDefaults;
const DEFAULT_PROJECT_SETTINGS = SETTINGS_CONFIG.projectDefaults;
const DEFAULT_WORKSPACE_SETTINGS = SETTINGS_CONFIG.workspaceDefaults;
const DEFAULT_VIEWPORT_SETTINGS = SETTINGS_CONFIG.viewportDefaults;

function getViewportKey(workspaceId?: string, viewportId?: string) {
  if (!workspaceId || !viewportId) return null;
  return `${workspaceId}:${viewportId}`;
}

function toSettingsObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function buildInitialState() {
  return {
    appSettings: { ...DEFAULT_APP_SETTINGS },
    projectSettings: {},
    workspaceSettings: { ...DEFAULT_WORKSPACE_SETTINGS },
    viewportSettings: { ...DEFAULT_VIEWPORT_SETTINGS },
  };
}

function normalizeScope(
  scope: SettingsOverrideRecord["scope"] | "workspace" | "project",
  scopeId?: string | null,
): SettingsScope {
  if (scope === "workspace" && scopeId?.includes(":")) return "viewport";
  if (scope === "workspace") return "workspace";
  return scope as SettingsScope;
}

export const useSettingsStore = create<SettingsState>()(
  devtools(
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
          if (scope === "project") {
            const projectId = ids?.projectId;
            if (!projectId) return;
            if (!state.projectSettings[projectId]) {
              state.projectSettings[projectId] = {};
            }
            state.projectSettings[projectId][key] = value;
            return;
          }
          if (scope === "viewport") {
            const viewportKey = getViewportKey(ids?.workspaceId, ids?.viewportId);
            if (!viewportKey) return;
            if (!state.viewportSettings[viewportKey]) {
              state.viewportSettings[viewportKey] = {};
            }
            state.viewportSettings[viewportKey][key] = value;
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
          if (scope === "project") {
            const projectId = ids?.projectId;
            if (!projectId) return;
            if (state.projectSettings[projectId]) {
              delete state.projectSettings[projectId][key];
            }
            return;
          }
          if (scope === "viewport") {
            const viewportKey = getViewportKey(ids?.workspaceId, ids?.viewportId);
            if (!viewportKey) return;
            if (state.viewportSettings[viewportKey]) {
              delete state.viewportSettings[viewportKey][key];
            }
          }
        });
      },

      getMergedSettings: (ids) => {
        const { appSettings, projectSettings, workspaceSettings, viewportSettings } = get();
        const workspaceId = ids?.workspaceId;
        const viewportKey = getViewportKey(ids?.workspaceId, ids?.viewportId);
        const projectId = ids?.projectId;
        return {
          ...appSettings,
          ...(projectId ? { ...DEFAULT_PROJECT_SETTINGS, ...(projectSettings[projectId] ?? {}) } : {}),
          ...(workspaceId ? { ...getWorkspaceDefaults(workspaceId), ...(workspaceSettings[workspaceId] ?? {}) } : {}),
          ...(viewportKey ? { ...getViewportDefaults(ids?.workspaceId, ids?.viewportId), ...(viewportSettings[viewportKey] ?? {}) } : {}),
        };
      },

      getSettingValue: (key, ids) => {
        const merged = get().getMergedSettings(ids);
        return merged[key];
      },

      getSettingSource: (key, ids) => {
        const { appSettings, projectSettings, workspaceSettings, viewportSettings } = get();
        const workspaceId = ids?.workspaceId;
        const projectId = ids?.projectId;
        const viewportKey = getViewportKey(ids?.workspaceId, ids?.viewportId);
        if (viewportKey && viewportSettings[viewportKey] && key in viewportSettings[viewportKey]) {
          return "viewport";
        }
        if (workspaceId && workspaceSettings[workspaceId] && key in workspaceSettings[workspaceId]) {
          return "workspace";
        }
        if (projectId && projectSettings[projectId] && key in projectSettings[projectId]) {
          return "project";
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
          state.projectSettings = { ...initial.projectSettings };
          state.workspaceSettings = { ...initial.workspaceSettings };
          state.viewportSettings = { ...initial.viewportSettings };

          for (const record of overrides) {
            const settings = toSettingsObject(record.settings);
            const scope = normalizeScope(
              record.scope as SettingsOverrideRecord["scope"],
              record.scopeId ?? undefined,
            );
            if (scope === "app") {
              state.appSettings = { ...state.appSettings, ...settings };
              continue;
            }
            if (scope === "project") {
              const projectId = record.scopeId ?? "unknown";
              state.projectSettings[projectId] = {
                ...(state.projectSettings[projectId] ?? {}),
                ...settings,
              };
              continue;
            }
            if (scope === "workspace") {
              const workspaceId = record.scopeId ?? "unknown";
              state.workspaceSettings[workspaceId] = {
                ...(state.workspaceSettings[workspaceId] ?? {}),
                ...settings,
              };
              continue;
            }
            if (scope === "viewport") {
              const viewportKey = record.scopeId ?? "unknown";
              state.viewportSettings[viewportKey] = {
                ...(state.viewportSettings[viewportKey] ?? {}),
                ...settings,
              };
            }
          }
        });
      },

      getOverridesForScope: (scope, ids) => {
        const { appSettings, projectSettings, workspaceSettings, viewportSettings } = get();
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
        if (scope === "project" && ids?.projectId) {
          const projectId = ids.projectId;
          const current = projectSettings[projectId] ?? {};
          for (const key of Object.keys(current)) {
            if (current[key] !== DEFAULT_PROJECT_SETTINGS[key]) {
              out[key] = current[key];
            }
          }
          return out;
        }
        if (scope === "workspace" && ids?.workspaceId) {
          const workspaceId = ids.workspaceId;
          const defaults = getWorkspaceDefaults(workspaceId);
          const current = workspaceSettings[workspaceId] ?? {};
          for (const key of Object.keys(current)) {
            if (current[key] !== defaults[key]) {
              out[key] = current[key];
            }
          }
          return out;
        }
        if (scope === "viewport" && ids?.workspaceId && ids?.viewportId) {
          const viewportKey = getViewportKey(ids.workspaceId, ids.viewportId);
          if (!viewportKey) return {};
          const defaults = getViewportDefaults(ids.workspaceId, ids.viewportId);
          const current = viewportSettings[viewportKey] ?? {};
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
          state.projectSettings = { ...initial.projectSettings };
          state.workspaceSettings = { ...initial.workspaceSettings };
          state.viewportSettings = { ...initial.viewportSettings };
        });
      },
    })),
    { name: "Settings" },
  ),
);
