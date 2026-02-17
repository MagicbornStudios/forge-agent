'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  RepoCommandView,
  RepoReviewQueueState,
  RepoRunRef,
  RepoWorkspaceId,
} from '@/lib/types';

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
  reviewQueue: RepoReviewQueueState;
  activeRunId: string | null;
  activeRun: RepoRunRef | null;
  selectedRepoPath: string | null;

  setActiveWorkspace: (workspaceId: RepoWorkspaceId) => void;
  setOpenWorkspaceIds: (workspaceIds: RepoWorkspaceId[]) => void;

  setDockLayout: (layoutId: string, json: string) => void;
  clearDockLayout: (layoutId: string) => void;

  setSettingsSidebarOpen: (open: boolean) => void;

  setPanelVisible: (panelId: string, visible: boolean) => void;
  restoreAllPanels: () => void;
  replaceHiddenPanelIds: (panelIds: string[]) => void;

  setCommandView: (next: Partial<RepoCommandView>) => void;
  replaceCommandView: (next: RepoCommandView) => void;

  setAttachedPlanningDocIds: (docIds: string[]) => void;
  attachPlanningDocId: (docId: string) => void;
  detachPlanningDocId: (docId: string) => void;
  setActiveLoopId: (loopId: string) => void;
  setReviewQueueState: (next: Partial<RepoReviewQueueState>) => void;

  setActiveRun: (run: RepoRunRef | null) => void;
  setSelectedRepoPath: (path: string | null) => void;
};

const DEFAULT_ROUTE: RepoStudioRouteState = {
  activeWorkspaceId: 'planning',
  openWorkspaceIds: [
    'planning',
    'env',
    'commands',
    'story',
    'docs',
    'git',
    'loop-assistant',
    'codex-assistant',
    'diff',
    'code',
    'review-queue',
  ],
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
      reviewQueue: {
        collapsed: false,
        selectedProposalId: null,
      },
      activeRunId: null,
      activeRun: null,
      selectedRepoPath: null,

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

      replaceHiddenPanelIds: (panelIds) => {
        const normalized = [...new Set((panelIds || []).map((item) => String(item).trim()).filter(Boolean))];
        set({ hiddenPanelIds: normalized });
      },

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

      setReviewQueueState: (next) =>
        set((state) => ({
          reviewQueue: {
            ...state.reviewQueue,
            ...next,
          },
        })),

      setActiveRun: (run) =>
        set({
          activeRun: run,
          activeRunId: run?.id || null,
        }),

      setSelectedRepoPath: (path) =>
        set({
          selectedRepoPath: path ? String(path) : null,
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
        reviewQueue: state.reviewQueue,
        selectedRepoPath: state.selectedRepoPath,
      }),
    },
  ),
);
