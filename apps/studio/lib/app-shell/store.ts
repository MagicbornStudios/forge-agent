'use client';

import { create } from 'zustand';
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
  workspaceThemes: Partial<Record<AppShellWorkspaceId, string>>;
  setActiveWorkspace: (id: AppShellWorkspaceId) => void;
  openWorkspace: (id: AppShellWorkspaceId) => void;
  closeWorkspace: (id: AppShellWorkspaceId) => void;
  setWorkspaceTheme: (id: AppShellWorkspaceId, theme: string) => void;
  clearWorkspaceTheme: (id: AppShellWorkspaceId) => void;
}

const DEFAULT_OPEN: AppShellWorkspaceId[] = ['forge'];

export const useAppShellStore = create<AppShellState>()(
  immer((set, get) => ({
    route: {
      activeWorkspaceId: 'forge',
      openWorkspaceIds: DEFAULT_OPEN,
      globalModals: [],
    },
    workspaceThemes: {
      video: 'darcula',
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
  })),
);
