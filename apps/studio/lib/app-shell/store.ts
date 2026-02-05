'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

/** Workspace identifier for the unified app. */
export type AppShellWorkspaceId = 'forge' | 'video';

export interface AppShellRoute {
  activeWorkspaceId: AppShellWorkspaceId;
  openWorkspaceIds: AppShellWorkspaceId[];
  globalModals: Array<{ id: string; props?: Record<string, unknown> }>;
}

interface AppShellState {
  route: AppShellRoute;
  /** Last opened graph id (for refetch on load). */
  lastGraphId: number | null;
  /** Last opened video doc id (for refetch on load). */
  lastVideoDocId: number | null;
  workspaceThemes: Partial<Record<AppShellWorkspaceId, string>>;
  /** Bottom drawer (workbench/console) open per workspace. */
  bottomDrawerOpen: Partial<Record<AppShellWorkspaceId, boolean>>;
  setRoute: (route: Partial<Pick<AppShellRoute, 'activeWorkspaceId' | 'openWorkspaceIds'>>) => void;
  setLastGraphId: (id: number | null) => void;
  setLastVideoDocId: (id: number | null) => void;
  setActiveWorkspace: (id: AppShellWorkspaceId) => void;
  openWorkspace: (id: AppShellWorkspaceId) => void;
  closeWorkspace: (id: AppShellWorkspaceId) => void;
  setWorkspaceTheme: (id: AppShellWorkspaceId, theme: string) => void;
  clearWorkspaceTheme: (id: AppShellWorkspaceId) => void;
  setBottomDrawerOpen: (id: AppShellWorkspaceId, open: boolean) => void;
  toggleBottomDrawer: (id: AppShellWorkspaceId) => void;
}

const DEFAULT_OPEN: AppShellWorkspaceId[] = ['forge'];

const APP_SESSION_KEY = 'forge:app-session:v1';

export const useAppShellStore = create<AppShellState>()(
  persist(
    immer((set) => ({
      route: {
        activeWorkspaceId: 'forge',
        openWorkspaceIds: DEFAULT_OPEN,
        globalModals: [],
      },
      lastGraphId: null,
      lastVideoDocId: null,
      workspaceThemes: { video: 'darcula' },
      bottomDrawerOpen: {},

      setRoute: (route) => {
      set((state) => {
        if (route.activeWorkspaceId != null) state.route.activeWorkspaceId = route.activeWorkspaceId as AppShellWorkspaceId;
        if (route.openWorkspaceIds != null && route.openWorkspaceIds.length > 0) state.route.openWorkspaceIds = route.openWorkspaceIds as AppShellWorkspaceId[];
      });
    },

    setLastGraphId: (id) => {
      set((state) => {
        state.lastGraphId = id;
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
          state.route.activeWorkspaceId = (next[0] ?? 'forge') as AppShellWorkspaceId;
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
    partialize: (s) => ({
      route: s.route,
      lastGraphId: s.lastGraphId,
      lastVideoDocId: s.lastVideoDocId,
    }),
    skipHydration: true,
  },
  ),
);
