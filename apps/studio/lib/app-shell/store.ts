'use client';

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

/**
 * Editor identifier for the unified editor app.
 * - `dialogue` - YarnSpinner dialogue building (formerly "forge")
 * - `video` - Twick video timeline editor
 * - `character` - Character relationship graph editor
 * - `strategy` - CodebaseAgentStrategyEditor (assistant-ui chat)
 */
export type EditorId = 'dialogue' | 'video' | 'character' | 'strategy';

export interface AppShellRoute {
  activeWorkspaceId: EditorId;
  openWorkspaceIds: EditorId[];
  globalModals: Array<{ id: string; props?: Record<string, unknown> }>;
}

interface AppShellState {
  route: AppShellRoute;
  /** Last opened Dialogue (Forge) project id. */
  lastDialogueProjectId: number | null;
  /** Last opened video doc id (for refetch on load). */
  lastVideoDocId: number | null;
  /** Last opened character project id (for refetch on load). */
  lastCharacterProjectId: number | null;
  workspaceThemes: Partial<Record<EditorId, string>>;
  /** Bottom drawer (workbench/console) open per editor. */
  bottomDrawerOpen: Partial<Record<EditorId, boolean>>;
  setRoute: (route: Partial<Pick<AppShellRoute, 'activeWorkspaceId' | 'openWorkspaceIds'>>) => void;
  setLastDialogueProjectId: (id: number | null) => void;
  setLastVideoDocId: (id: number | null) => void;
  setLastCharacterProjectId: (id: number | null) => void;
  setActiveWorkspace: (id: EditorId) => void;
  openWorkspace: (id: EditorId) => void;
  closeWorkspace: (id: EditorId) => void;
  setWorkspaceTheme: (id: EditorId, theme: string) => void;
  clearWorkspaceTheme: (id: EditorId) => void;
  setBottomDrawerOpen: (id: EditorId, open: boolean) => void;
  toggleBottomDrawer: (id: EditorId) => void;
}

const DEFAULT_OPEN: EditorId[] = ['dialogue'];
const APP_SESSION_KEY = 'forge:app-session:v2';
const APP_SESSION_VERSION = 2;

type PersistedAppState = Partial<
  Pick<
    AppShellState,
    | 'route'
    | 'lastDialogueProjectId'
    | 'lastVideoDocId'
    | 'lastCharacterProjectId'
  >
> & {
  route?: {
    activeWorkspaceId?: EditorId | 'forge';
    openWorkspaceIds?: Array<EditorId | 'forge'>;
    globalModals?: Array<{ id: string; props?: Record<string, unknown> }>;
  };
};

const mapModeId = (value: unknown): EditorId | undefined => {
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
          lastVideoDocId: s.lastVideoDocId,
          lastCharacterProjectId: s.lastCharacterProjectId,
        }),
        migrate: (persisted) => {
          const state = (persisted ?? {}) as PersistedAppState;
          const active = mapModeId(state.route?.activeWorkspaceId) ?? 'dialogue';
          const open =
            (state.route?.openWorkspaceIds ?? [])
              .map(mapModeId)
              .filter(Boolean) as EditorId[];
          const openWorkspaceIds = open.length > 0 ? open : DEFAULT_OPEN;
          const lastDialogueProjectId =
            state.lastDialogueProjectId ??
            (state as { lastForgeProjectId?: number | null }).lastForgeProjectId ??
            null;

          return {
            ...state,
            route: {
              activeWorkspaceId: active,
              openWorkspaceIds,
              globalModals: state.route?.globalModals ?? [],
            },
            lastDialogueProjectId,
            lastVideoDocId: state.lastVideoDocId ?? null,
            lastCharacterProjectId: state.lastCharacterProjectId ?? null,
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
