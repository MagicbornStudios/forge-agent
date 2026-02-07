'use client';

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

/**
 * Editor mode identifier for the unified editor app.
 * - `dialogue` - YarnSpinner dialogue building (formerly "forge")
 * - `video` - Twick video timeline editor
 * - `character` - Character relationship graph editor
 * - `strategy` - CodebaseAgentStrategyEditor (assistant-ui chat)
 */
export type EditorModeId = 'dialogue' | 'video' | 'character' | 'strategy';

/**
 * @deprecated Use EditorModeId instead.
 */
export type AppShellWorkspaceId = EditorModeId;

export interface AppShellRoute {
  activeWorkspaceId: EditorModeId;
  openWorkspaceIds: EditorModeId[];
  globalModals: Array<{ id: string; props?: Record<string, unknown> }>;
}

interface AppShellState {
  route: AppShellRoute;
  /** Last opened Dialogue (Forge) project id. */
  lastDialogueProjectId: number | null;
  /** @deprecated Alias for lastDialogueProjectId. */
  lastForgeProjectId: number | null;
  /** Last opened video doc id (for refetch on load). */
  lastVideoDocId: number | null;
  /** Last opened character project id (for refetch on load). */
  lastCharacterProjectId: number | null;
  workspaceThemes: Partial<Record<EditorModeId, string>>;
  /** Bottom drawer (workbench/console) open per workspace. */
  bottomDrawerOpen: Partial<Record<EditorModeId, boolean>>;
  setRoute: (route: Partial<Pick<AppShellRoute, 'activeWorkspaceId' | 'openWorkspaceIds'>>) => void;
  setLastDialogueProjectId: (id: number | null) => void;
  /** @deprecated Alias for setLastDialogueProjectId. */
  setLastForgeProjectId: (id: number | null) => void;
  setLastVideoDocId: (id: number | null) => void;
  setLastCharacterProjectId: (id: number | null) => void;
  setActiveWorkspace: (id: EditorModeId) => void;
  openWorkspace: (id: EditorModeId) => void;
  closeWorkspace: (id: EditorModeId) => void;
  setWorkspaceTheme: (id: EditorModeId, theme: string) => void;
  clearWorkspaceTheme: (id: EditorModeId) => void;
  setBottomDrawerOpen: (id: EditorModeId, open: boolean) => void;
  toggleBottomDrawer: (id: EditorModeId) => void;
}

const DEFAULT_OPEN: EditorModeId[] = ['dialogue'];
const APP_SESSION_KEY = 'forge:app-session:v2';
const APP_SESSION_VERSION = 2;

type PersistedAppState = Partial<
  Pick<
    AppShellState,
    | 'route'
    | 'lastDialogueProjectId'
    | 'lastForgeProjectId'
    | 'lastVideoDocId'
    | 'lastCharacterProjectId'
  >
> & {
  route?: {
    activeWorkspaceId?: EditorModeId | 'forge';
    openWorkspaceIds?: Array<EditorModeId | 'forge'>;
    globalModals?: Array<{ id: string; props?: Record<string, unknown> }>;
  };
};

const mapModeId = (value: unknown): EditorModeId | undefined => {
  switch (value) {
    case 'dialogue':
    case 'video':
    case 'character':
    case 'strategy':
      return value;
    case 'forge':
      return 'dialogue';
    default:
      return undefined;
  }
};

export const useAppShellStore = create<AppShellState>()(
  devtools(
    persist(
      immer((set) => ({
        route: {
          activeWorkspaceId: 'dialogue',
          openWorkspaceIds: DEFAULT_OPEN,
          globalModals: [],
        },
        lastDialogueProjectId: null,
        lastForgeProjectId: null,
        lastVideoDocId: null,
        lastCharacterProjectId: null,
        workspaceThemes: { video: 'darcula' },
        bottomDrawerOpen: {},

        setRoute: (route) => {
          set((state) => {
            if (route.activeWorkspaceId != null) state.route.activeWorkspaceId = route.activeWorkspaceId;
            if (route.openWorkspaceIds != null && route.openWorkspaceIds.length > 0) {
              state.route.openWorkspaceIds = route.openWorkspaceIds;
            }
          });
        },

        setLastDialogueProjectId: (id) => {
          set((state) => {
            state.lastDialogueProjectId = id;
            state.lastForgeProjectId = id;
          });
        },

        setLastForgeProjectId: (id) => {
          set((state) => {
            state.lastDialogueProjectId = id;
            state.lastForgeProjectId = id;
          });
        },

        setLastVideoDocId: (id) => {
          set((state) => {
            state.lastVideoDocId = id;
          });
        },

        setLastCharacterProjectId: (id) => {
          set((state) => {
            state.lastCharacterProjectId = id;
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
              state.route.activeWorkspaceId = next[0] ?? 'dialogue';
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
      })),
      {
        name: APP_SESSION_KEY,
        version: APP_SESSION_VERSION,
        partialize: (s) => ({
          route: s.route,
          lastDialogueProjectId: s.lastDialogueProjectId,
          lastForgeProjectId: s.lastForgeProjectId,
          lastVideoDocId: s.lastVideoDocId,
          lastCharacterProjectId: s.lastCharacterProjectId,
        }),
        migrate: (persisted) => {
          const state = (persisted ?? {}) as PersistedAppState;
          const active = mapModeId(state.route?.activeWorkspaceId) ?? 'dialogue';
          const open =
            (state.route?.openWorkspaceIds ?? [])
              .map(mapModeId)
              .filter(Boolean) as EditorModeId[];
          const openWorkspaceIds = open.length > 0 ? open : DEFAULT_OPEN;
          const lastDialogueProjectId =
            state.lastDialogueProjectId ??
            state.lastForgeProjectId ??
            null;

          return {
            ...state,
            route: {
              activeWorkspaceId: active,
              openWorkspaceIds,
              globalModals: state.route?.globalModals ?? [],
            },
            lastDialogueProjectId,
            lastForgeProjectId: lastDialogueProjectId,
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
