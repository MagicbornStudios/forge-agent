'use client';

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

/**
 * Editor identifier for the unified editor app.
 * - `dialogue` - YarnSpinner dialogue building (formerly "forge")
 * - `character` - Character relationship graph editor
 * Chat is available in the right-rail Chat panel per editor; no separate Strategy tab.
 */
export const EDITOR_IDS = ['dialogue', 'character'] as const;
export type EditorId = (typeof EDITOR_IDS)[number];
export const DEFAULT_EDITOR_ID: EditorId = EDITOR_IDS[0];

export interface AppShellRoute {
  activeWorkspaceId: EditorId;
  openWorkspaceIds: EditorId[];
  globalModals: Array<{ id: string; props?: Record<string, unknown> }>;
}

interface AppShellState {
  route: AppShellRoute;
  /** App-level active project id. Shared across Dialogue, Character (and other project-scoped editors). */
  activeProjectId: number | null;
  /** Last opened Dialogue (Forge) project id (legacy/migration). */
  lastDialogueProjectId: number | null;
  /** Last opened character project id (legacy/migration). */
  lastCharacterProjectId: number | null;
  /** Last opened video document id (legacy compatibility). */
  lastVideoDocId: number | null;
  workspaceThemes: Partial<Record<EditorId, string>>;
  /** Bottom drawer (Assistant/console) open per editor. */
  bottomDrawerOpen: Partial<Record<EditorId, boolean>>;
  /** App settings sheet (left drawer) open. Not persisted. */
  appSettingsSheetOpen: boolean;
  /** Request active editor to open settings in dock panel. Consumed by editor then cleared. Not persisted. */
  requestOpenSettings: boolean;
  /** Viewport id for Settings sidebar context (e.g. narrative/storylet for Dialogue). Set by active editor when viewport/scope changes. Not persisted. */
  settingsViewportId: string | null;
  /** Settings Sidebar (right rail) open. Not persisted. */
  settingsSidebarOpen: boolean;
  /** Active settings tab (app|user|project|editor|viewport). Used for sidebar title/scope indicator. Not persisted. */
  settingsActiveTab: 'app' | 'user' | 'project' | 'editor' | 'viewport' | null;
  /** Dock layout JSON by layoutId (Dockview). Persisted. */
  dockLayouts: Record<string, string>;
  setRoute: (route: Partial<Pick<AppShellRoute, 'activeWorkspaceId' | 'openWorkspaceIds'>>) => void;
  setActiveProjectId: (id: number | null) => void;
  setLastDialogueProjectId: (id: number | null) => void;
  setLastCharacterProjectId: (id: number | null) => void;
  setLastVideoDocId: (id: number | null) => void;
  setActiveWorkspace: (id: EditorId) => void;
  openWorkspace: (id: EditorId) => void;
  closeWorkspace: (id: EditorId) => void;
  setWorkspaceTheme: (id: EditorId, theme: string) => void;
  clearWorkspaceTheme: (id: EditorId) => void;
  setBottomDrawerOpen: (id: EditorId, open: boolean) => void;
  toggleBottomDrawer: (id: EditorId) => void;
  setAppSettingsSheetOpen: (open: boolean) => void;
  setRequestOpenSettings: (value: boolean) => void;
  setSettingsViewportId: (id: string | null) => void;
  setSettingsSidebarOpen: (open: boolean) => void;
  setSettingsActiveTab: (tab: 'app' | 'user' | 'project' | 'editor' | 'viewport' | null) => void;
  setDockLayout: (layoutId: string, json: string) => void;
  clearDockLayout: (layoutId: string) => void;
}

const DEFAULT_OPEN: EditorId[] = [DEFAULT_EDITOR_ID];
const APP_SESSION_KEY = 'forge:app-session:v2';
const APP_SESSION_VERSION = 2;

type PersistedAppState = Partial<
  Pick<
    AppShellState,
    | 'route'
    | 'activeProjectId'
    | 'lastDialogueProjectId'
    | 'lastCharacterProjectId'
    | 'lastVideoDocId'
    | 'dockLayouts'
  >
> & {
  route?: {
    activeWorkspaceId?: EditorId | 'forge';
    openWorkspaceIds?: Array<EditorId | 'forge'>;
    globalModals?: Array<{ id: string; props?: Record<string, unknown> }>;
  };
};

const mapModeId = (value: unknown): EditorId | undefined => {
  if (value === 'forge') return DEFAULT_EDITOR_ID;
  if (typeof value === 'string' && (EDITOR_IDS as readonly string[]).includes(value)) {
    return value as EditorId;
  }
  return undefined;
};

export const useAppShellStore = create<AppShellState>()(
  devtools(
    persist(
      immer((set) => ({
        route: {
          activeWorkspaceId: DEFAULT_EDITOR_ID,
          openWorkspaceIds: DEFAULT_OPEN,
          globalModals: [],
        },
        activeProjectId: null,
        lastDialogueProjectId: null,
        lastCharacterProjectId: null,
        lastVideoDocId: null,
        workspaceThemes: {},
        bottomDrawerOpen: {},
        appSettingsSheetOpen: false,
        requestOpenSettings: false,
        settingsViewportId: null,
        settingsSidebarOpen: false,
        settingsActiveTab: null,
        dockLayouts: {},

        setRoute: (route) => {
          set((state) => {
            if (route.activeWorkspaceId != null) state.route.activeWorkspaceId = route.activeWorkspaceId;
            if (route.openWorkspaceIds != null && route.openWorkspaceIds.length > 0) {
              state.route.openWorkspaceIds = route.openWorkspaceIds;
            }
          });
        },

        setActiveProjectId: (id) => {
          set((state) => {
            state.activeProjectId = id;
          });
        },

        setLastDialogueProjectId: (id) => {
          set((state) => {
            state.lastDialogueProjectId = id;
          });
        },

        setLastCharacterProjectId: (id) => {
          set((state) => {
            state.lastCharacterProjectId = id;
          });
        },

        setLastVideoDocId: (id) => {
          set((state) => {
            state.lastVideoDocId = id;
          });
        },

        setActiveWorkspace: (id) => {
          set((state) => {
            const isOpen = state.route.openWorkspaceIds.includes(id);
            state.route.activeWorkspaceId = id;
            if (!isOpen) {
              state.route.openWorkspaceIds.push(id);
            }
          });
        },

        openWorkspace: (id) => {
          set((state) => {
            if (!state.route.openWorkspaceIds.includes(id)) {
              state.route.openWorkspaceIds.push(id);
            }
            state.route.activeWorkspaceId = id;
          });
        },

        closeWorkspace: (id) => {
          set((state) => {
            const next = state.route.openWorkspaceIds.filter((w) => w !== id);
            if (next.length === 0) return;
            state.route.openWorkspaceIds = next;
            if (state.route.activeWorkspaceId === id) {
              state.route.activeWorkspaceId = next[0] ?? DEFAULT_EDITOR_ID;
            }
          });
        },

        setWorkspaceTheme: (id, theme) => {
          set((state) => {
            state.workspaceThemes[id] = theme;
          });
        },

        clearWorkspaceTheme: (id) => {
          set((state) => {
            delete state.workspaceThemes[id];
          });
        },

        setBottomDrawerOpen: (id, open) => {
          set((state) => {
            state.bottomDrawerOpen[id] = open;
          });
        },

        toggleBottomDrawer: (id) => {
          set((state) => {
            const current = state.bottomDrawerOpen[id];
            state.bottomDrawerOpen[id] = current === true ? false : true;
          });
        },

        setAppSettingsSheetOpen: (open) => {
          set((state) => {
            state.appSettingsSheetOpen = open;
          });
        },

        setRequestOpenSettings: (value) => {
          set((state) => {
            state.requestOpenSettings = value;
          });
        },

        setSettingsViewportId: (id) => {
          set((state) => {
            state.settingsViewportId = id;
          });
        },

        setSettingsSidebarOpen: (open) => {
          set((state) => {
            state.settingsSidebarOpen = open;
            if (!open) state.settingsActiveTab = null;
          });
        },

        setSettingsActiveTab: (tab) => {
          set((state) => {
            state.settingsActiveTab = tab;
          });
        },

        setDockLayout: (layoutId: string, json: string) => {
          set((state) => {
            state.dockLayouts[layoutId] = json;
          });
        },

        clearDockLayout: (layoutId: string) => {
          set((state) => {
            delete state.dockLayouts[layoutId];
          });
        },
      })),
      {
        name: APP_SESSION_KEY,
        version: APP_SESSION_VERSION,
        partialize: (s) => ({
          route: s.route,
          activeProjectId: s.activeProjectId,
          lastDialogueProjectId: s.lastDialogueProjectId,
          lastCharacterProjectId: s.lastCharacterProjectId,
          dockLayouts: s.dockLayouts,
        }),
        migrate: (persisted) => {
          const state = (persisted ?? {}) as PersistedAppState;
          const active = mapModeId(state.route?.activeWorkspaceId) ?? DEFAULT_EDITOR_ID;
          const open =
            (state.route?.openWorkspaceIds ?? [])
              .map(mapModeId)
              .filter(Boolean) as EditorId[];
          const openWorkspaceIds = open.length > 0 ? open : DEFAULT_OPEN;
          const lastDialogue =
            state.lastDialogueProjectId ??
            (state as { lastForgeProjectId?: number | null }).lastForgeProjectId ??
            null;
          const activeProjectId =
            state.activeProjectId ?? lastDialogue ?? state.lastCharacterProjectId ?? null;

          return {
            ...state,
            route: {
              activeWorkspaceId: active,
              openWorkspaceIds,
              globalModals: state.route?.globalModals ?? [],
            },
            activeProjectId,
            lastDialogueProjectId: lastDialogue,
            lastCharacterProjectId: state.lastCharacterProjectId ?? null,
            appSettingsSheetOpen: false,
            requestOpenSettings: false,
            dockLayouts: state.dockLayouts ?? {},
          } as AppShellState;
        },
        skipHydration: true,
      },
    ),
    { name: 'AppShell' },
  ),
);

/** Preferred alias for Editor naming. */
export const useEditorStore = useAppShellStore;
