'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RepoCommandView, RepoRunRef, RepoWorkspaceId } from '@/lib/types';

export const REPO_STUDIO_LAYOUT_ID = 'repo-studio-main';

const DEFAULT_COMMAND_VIEW: RepoCommandView = {
  query: '',
  source: 'all',
  status: 'all',
  tab: 'recommended',
  sort: 'id',
};

export type RepoStudioRouteState = {
  activeWorkspaceId: RepoWorkspaceId;
  openWorkspaceIds: RepoWorkspaceId[];
};

type RepoStudioShellState = {
  route: RepoStudioRouteState;
  dockLayouts: Record<string, string>;
  settingsSidebarOpen: boolean;
  hiddenPanelIds: string[];
  commandView: RepoCommandView;
  attachedPlanningDocIds: string[];
  activeLoopId: string;
  activeRunId: string | null;
  activeRun: RepoRunRef | null;

  setActiveWorkspace: (workspaceId: RepoWorkspaceId) => void;
  setOpenWorkspaceIds: (workspaceIds: RepoWorkspaceId[]) => void;

  setDockLayout: (layoutId: string, json: string) => void;
  clearDockLayout: (layoutId: string) => void;

  setSettingsSidebarOpen: (open: boolean) => void;

  setPanelVisible: (panelId: string, visible: boolean) => void;
  restoreAllPanels: () => void;

  setCommandView: (next: Partial<RepoCommandView>) => void;
  replaceCommandView: (next: RepoCommandView) => void;

  setAttachedPlanningDocIds: (docIds: string[]) => void;
  attachPlanningDocId: (docId: string) => void;
  detachPlanningDocId: (docId: string) => void;
  setActiveLoopId: (loopId: string) => void;

  setActiveRun: (run: RepoRunRef | null) => void;
};

const DEFAULT_ROUTE: RepoStudioRouteState = {
  activeWorkspaceId: 'planning',
  openWorkspaceIds: ['planning', 'env', 'commands', 'docs', 'loop-assistant', 'codex-assistant', 'diff'],
};

export const useRepoStudioShellStore = create<RepoStudioShellState>()(
  persist(
    (set, get) => ({
      route: DEFAULT_ROUTE,
      dockLayouts: {},
      settingsSidebarOpen: false,
      hiddenPanelIds: [],
      commandView: DEFAULT_COMMAND_VIEW,
      attachedPlanningDocIds: [],
      activeLoopId: 'default',
      activeRunId: null,
      activeRun: null,

      setActiveWorkspace: (workspaceId) => {
        set((state) => {
          const open = state.route.openWorkspaceIds.includes(workspaceId)
            ? state.route.openWorkspaceIds
            : [...state.route.openWorkspaceIds, workspaceId];
          return {
            route: {
              activeWorkspaceId: workspaceId,
              openWorkspaceIds: open,
            },
          };
        });
      },

      setOpenWorkspaceIds: (workspaceIds) => {
        const normalized = [...new Set(workspaceIds)].filter(Boolean) as RepoWorkspaceId[];
        if (normalized.length === 0) return;
        set((state) => ({
          route: {
            activeWorkspaceId: normalized.includes(state.route.activeWorkspaceId)
              ? state.route.activeWorkspaceId
              : normalized[0],
            openWorkspaceIds: normalized,
          },
        }));
      },

      setDockLayout: (layoutId, json) => {
        if (!layoutId || !json) return;
        set((state) => ({
          dockLayouts: {
            ...state.dockLayouts,
            [layoutId]: json,
          },
        }));
      },

      clearDockLayout: (layoutId) => {
        if (!layoutId) return;
        set((state) => {
          const next = { ...state.dockLayouts };
          delete next[layoutId];
          return { dockLayouts: next };
        });
      },

      setSettingsSidebarOpen: (open) => set({ settingsSidebarOpen: open === true }),

      setPanelVisible: (panelId, visible) => {
        if (!panelId) return;
        set((state) => {
          const current = new Set(state.hiddenPanelIds);
          if (visible) current.delete(panelId);
          else current.add(panelId);
          return { hiddenPanelIds: [...current].sort((a, b) => a.localeCompare(b)) };
        });
      },

      restoreAllPanels: () => set({ hiddenPanelIds: [] }),

      setCommandView: (next) => {
        set((state) => ({
          commandView: {
            ...state.commandView,
            ...next,
          },
        }));
      },

      replaceCommandView: (next) => set({ commandView: { ...DEFAULT_COMMAND_VIEW, ...next } }),

      setAttachedPlanningDocIds: (docIds) =>
        set({ attachedPlanningDocIds: [...new Set((docIds || []).filter(Boolean))] }),

      attachPlanningDocId: (docId) => {
        if (!docId) return;
        const current = get().attachedPlanningDocIds;
        if (current.includes(docId)) return;
        set({ attachedPlanningDocIds: [...current, docId] });
      },

      detachPlanningDocId: (docId) => {
        if (!docId) return;
        set((state) => ({
          attachedPlanningDocIds: state.attachedPlanningDocIds.filter((item) => item !== docId),
        }));
      },

      setActiveLoopId: (loopId) => {
        const normalized = String(loopId || '').trim().toLowerCase();
        if (!normalized) return;
        set({ activeLoopId: normalized });
      },

      setActiveRun: (run) =>
        set({
          activeRun: run,
          activeRunId: run?.id || null,
        }),
    }),
    {
      name: 'forge:repo-studio-shell:v1',
      version: 2,
      partialize: (state) => ({
        route: state.route,
        dockLayouts: state.dockLayouts,
        hiddenPanelIds: state.hiddenPanelIds,
        commandView: state.commandView,
        attachedPlanningDocIds: state.attachedPlanningDocIds,
        activeLoopId: state.activeLoopId,
      }),
    },
  ),
);
