'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  RepoCommandView,
  RepoReviewQueueState,
  RepoRunRef,
  RepoWorkspaceId,
} from '@/lib/types';
import { REPO_WORKSPACE_IDS } from '@/lib/types';
import {
  createEmptyWorkspaceHiddenPanelMap,
  PINNED_PANEL_IDS,
  sanitizeWorkspaceHiddenPanelIds,
} from '../app-spec.generated';

const PINNED_WORKSPACE_PANEL_IDS = new Set(PINNED_PANEL_IDS);

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

export type ViewportPanelState = {
  openIds: string[];
  activeId: string | null;
};

type RepoStudioShellState = {
  route: RepoStudioRouteState;
  dockLayouts: Record<string, string>;
  settingsSidebarOpen: boolean;
  hiddenPanelIds: string[];
  workspaceHiddenPanelIds: Partial<Record<RepoWorkspaceId, string[]>>;
  /** Viewport panel state keyed by layoutId (open viewport panel ids + active id). */
  viewportState: Record<string, ViewportPanelState>;
  commandView: RepoCommandView;
  activeLoopId: string;
  reviewQueue: RepoReviewQueueState;
  activeRunId: string | null;
  activeRun: RepoRunRef | null;
  selectedRepoPath: string | null;

  setActiveWorkspace: (workspaceId: RepoWorkspaceId) => void;
  setOpenWorkspaceIds: (workspaceIds: RepoWorkspaceId[]) => void;
  openWorkspace: (workspaceId: RepoWorkspaceId) => void;
  closeWorkspace: (workspaceId: RepoWorkspaceId) => void;

  setDockLayout: (layoutId: string, json: string) => void;
  clearDockLayout: (layoutId: string) => void;

  setSettingsSidebarOpen: (open: boolean) => void;

  setPanelVisibleForWorkspace: (workspaceId: RepoWorkspaceId, panelId: string, visible: boolean) => void;
  restoreWorkspacePanels: (workspaceId: RepoWorkspaceId) => void;
  setPanelVisible: (panelId: string, visible: boolean) => void;
  restoreAllPanels: () => void;
  replaceHiddenPanelIds: (panelIds: string[]) => void;
  replaceWorkspaceHiddenPanelIds: (map: Partial<Record<RepoWorkspaceId, string[]>>) => void;

  setViewportState: (layoutId: string, state: Partial<ViewportPanelState>) => void;

  setCommandView: (next: Partial<RepoCommandView>) => void;
  replaceCommandView: (next: RepoCommandView) => void;

  setActiveLoopId: (loopId: string) => void;
  setReviewQueueState: (next: Partial<RepoReviewQueueState>) => void;

  setActiveRun: (run: RepoRunRef | null) => void;
  setSelectedRepoPath: (path: string | null) => void;
};

const DEFAULT_ROUTE: RepoStudioRouteState = {
  activeWorkspaceId: 'planning',
  openWorkspaceIds: ['planning'],
};

function isWorkspaceId(value: unknown): value is RepoWorkspaceId {
  return REPO_WORKSPACE_IDS.includes(value as RepoWorkspaceId);
}

function normalizeWorkspaceList(workspaceIds: unknown[]): RepoWorkspaceId[] {
  const list = [...new Set(
    (workspaceIds || [])
      .map((item) => String(item || '').trim())
      .filter((item) => isWorkspaceId(item)),
  )] as RepoWorkspaceId[];
  return list.length > 0 ? list : (['planning'] as RepoWorkspaceId[]);
}

function normalizePanelIds(panelIds: unknown[]) {
  return [...new Set(
    (panelIds || [])
      .map((item) => String(item || '').trim())
      .filter(Boolean),
  )];
}

function sanitizeHiddenPanelsForWorkspace(workspaceId: RepoWorkspaceId, panelIds: unknown[]) {
  return sanitizeWorkspaceHiddenPanelIds(workspaceId, panelIds);
}

function normalizeWorkspaceHiddenPanelIds(
  value: unknown,
): Partial<Record<RepoWorkspaceId, string[]>> {
  const next = createEmptyWorkspaceHiddenPanelMap();
  if (!value || typeof value !== 'object') {
    return next;
  }
  const source = value as Record<string, unknown>;
  for (const workspaceId of REPO_WORKSPACE_IDS) {
    const raw = Array.isArray(source[workspaceId]) ? source[workspaceId] as unknown[] : [];
    next[workspaceId] = sanitizeHiddenPanelsForWorkspace(workspaceId, normalizePanelIds(raw));
  }
  return next;
}

function getWorkspaceHiddenPanelIdsForRoute(
  map: Partial<Record<RepoWorkspaceId, string[]>>,
  workspaceId: RepoWorkspaceId,
) {
  return map[workspaceId] || [];
}

function ensureWorkspaceHiddenPanelIds(
  map: Partial<Record<RepoWorkspaceId, string[]>>,
  workspaceId: RepoWorkspaceId,
): Partial<Record<RepoWorkspaceId, string[]>> {
  if (Array.isArray(map[workspaceId])) return map;
  return {
    ...map,
    [workspaceId]: [],
  };
}

export const useRepoStudioShellStore = create<RepoStudioShellState>()(
  persist(
    (set, get) => ({
      route: DEFAULT_ROUTE,
      dockLayouts: {},
      settingsSidebarOpen: false,
      hiddenPanelIds: [],
      workspaceHiddenPanelIds: createEmptyWorkspaceHiddenPanelMap(),
      viewportState: {},
      commandView: DEFAULT_COMMAND_VIEW,
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
          const normalized = isWorkspaceId(workspaceId) ? workspaceId : DEFAULT_ROUTE.activeWorkspaceId;
          const open = state.route.openWorkspaceIds.includes(normalized)
            ? state.route.openWorkspaceIds
            : [...state.route.openWorkspaceIds, normalized];
          const workspaceHiddenPanelIds = ensureWorkspaceHiddenPanelIds(state.workspaceHiddenPanelIds, normalized);
          return {
            route: {
              activeWorkspaceId: normalized,
              openWorkspaceIds: open,
            },
            workspaceHiddenPanelIds,
            hiddenPanelIds: getWorkspaceHiddenPanelIdsForRoute(workspaceHiddenPanelIds, normalized),
          };
        });
      },

      setOpenWorkspaceIds: (workspaceIds) => {
        const normalized = normalizeWorkspaceList(workspaceIds || []);
        set((state) => {
          const activeWorkspaceId: RepoWorkspaceId = normalized.includes(state.route.activeWorkspaceId)
            ? state.route.activeWorkspaceId
            : normalized[0];
          const workspaceHiddenPanelIds = ensureWorkspaceHiddenPanelIds(
            state.workspaceHiddenPanelIds,
            activeWorkspaceId,
          );
          return {
            route: {
              activeWorkspaceId,
              openWorkspaceIds: normalized,
            },
            workspaceHiddenPanelIds,
            hiddenPanelIds: getWorkspaceHiddenPanelIdsForRoute(workspaceHiddenPanelIds, activeWorkspaceId),
          };
        });
      },

      openWorkspace: (workspaceId) => {
        set((state) => {
          const normalized = isWorkspaceId(workspaceId) ? workspaceId : DEFAULT_ROUTE.activeWorkspaceId;
          const open = state.route.openWorkspaceIds.includes(normalized)
            ? state.route.openWorkspaceIds
            : [...state.route.openWorkspaceIds, normalized];
          const workspaceHiddenPanelIds = ensureWorkspaceHiddenPanelIds(state.workspaceHiddenPanelIds, normalized);
          return {
            route: {
              activeWorkspaceId: normalized,
              openWorkspaceIds: open,
            },
            workspaceHiddenPanelIds,
            hiddenPanelIds: getWorkspaceHiddenPanelIdsForRoute(workspaceHiddenPanelIds, normalized),
          };
        });
      },

      closeWorkspace: (workspaceId) => {
        set((state) => {
          const normalized = isWorkspaceId(workspaceId) ? workspaceId : DEFAULT_ROUTE.activeWorkspaceId;
          const open = state.route.openWorkspaceIds.filter((item) => item !== normalized);
          const nextOpen: RepoWorkspaceId[] = open.length > 0 ? open : [DEFAULT_ROUTE.activeWorkspaceId];
          const activeWorkspaceId: RepoWorkspaceId = state.route.activeWorkspaceId === normalized
            ? nextOpen[nextOpen.length - 1]
            : state.route.activeWorkspaceId;
          const workspaceHiddenPanelIds = ensureWorkspaceHiddenPanelIds(
            state.workspaceHiddenPanelIds,
            activeWorkspaceId,
          );
          return {
            route: {
              activeWorkspaceId,
              openWorkspaceIds: nextOpen,
            },
            workspaceHiddenPanelIds,
            hiddenPanelIds: getWorkspaceHiddenPanelIdsForRoute(workspaceHiddenPanelIds, activeWorkspaceId),
          };
        });
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

      setPanelVisibleForWorkspace: (workspaceId, panelId, visible) => {
        if (!panelId) return;
        set((state) => {
          const normalizedPanelId = String(panelId || '').trim();
          if (!normalizedPanelId) return state;
          const normalizedWorkspace = isWorkspaceId(workspaceId)
            ? workspaceId
            : state.route.activeWorkspaceId;
          if (PINNED_WORKSPACE_PANEL_IDS.has(normalizedPanelId) && !visible) {
            return state;
          }
          const currentHidden = new Set(
            getWorkspaceHiddenPanelIdsForRoute(state.workspaceHiddenPanelIds, normalizedWorkspace),
          );
          if (visible || PINNED_WORKSPACE_PANEL_IDS.has(normalizedPanelId)) currentHidden.delete(normalizedPanelId);
          else currentHidden.add(normalizedPanelId);
          const hiddenForWorkspace = sanitizeHiddenPanelsForWorkspace(normalizedWorkspace, [...currentHidden]);
          const workspaceHiddenPanelIds = {
            ...state.workspaceHiddenPanelIds,
            [normalizedWorkspace]: hiddenForWorkspace,
          };
          return {
            workspaceHiddenPanelIds,
            hiddenPanelIds: state.route.activeWorkspaceId === normalizedWorkspace
              ? hiddenForWorkspace
              : state.hiddenPanelIds,
          };
        });
      },

      restoreWorkspacePanels: (workspaceId) => {
        set((state) => {
          const normalizedWorkspace = isWorkspaceId(workspaceId)
            ? workspaceId
            : state.route.activeWorkspaceId;
          const workspaceHiddenPanelIds = {
            ...state.workspaceHiddenPanelIds,
            [normalizedWorkspace]: [],
          };
          return {
            workspaceHiddenPanelIds,
            hiddenPanelIds: state.route.activeWorkspaceId === normalizedWorkspace
              ? []
              : state.hiddenPanelIds,
          };
        });
      },

      setPanelVisible: (panelId, visible) => {
        const activeWorkspaceId = get().route.activeWorkspaceId;
        get().setPanelVisibleForWorkspace(activeWorkspaceId, panelId, visible);
      },

      restoreAllPanels: () => {
        const activeWorkspaceId = get().route.activeWorkspaceId;
        get().restoreWorkspacePanels(activeWorkspaceId);
      },

      replaceHiddenPanelIds: (panelIds) => {
        const activeWorkspaceId = get().route.activeWorkspaceId;
        const normalized = sanitizeHiddenPanelsForWorkspace(activeWorkspaceId, normalizePanelIds(panelIds || []));
        set((state) => ({
          hiddenPanelIds: normalized,
          workspaceHiddenPanelIds: {
            ...state.workspaceHiddenPanelIds,
            [activeWorkspaceId]: normalized,
          },
        }));
      },

      replaceWorkspaceHiddenPanelIds: (map) => {
        const normalized = normalizeWorkspaceHiddenPanelIds(map);
        set((state) => {
          const activeWorkspaceId = state.route.activeWorkspaceId;
          const workspaceHiddenPanelIds = ensureWorkspaceHiddenPanelIds(normalized, activeWorkspaceId);
          return {
            workspaceHiddenPanelIds,
            hiddenPanelIds: getWorkspaceHiddenPanelIdsForRoute(workspaceHiddenPanelIds, activeWorkspaceId),
          };
        });
      },

      setViewportState: (layoutId, state) => {
        if (!layoutId) return;
        set((s) => ({
          viewportState: {
            ...s.viewportState,
            [layoutId]: {
              openIds: state.openIds ?? s.viewportState[layoutId]?.openIds ?? [],
              activeId: state.activeId !== undefined ? state.activeId : (s.viewportState[layoutId]?.activeId ?? null),
            },
          },
        }));
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
      name: 'forge:repo-studio-shell:v2',
      partialize: (state) => ({
        route: state.route,
        dockLayouts: state.dockLayouts,
        hiddenPanelIds: state.hiddenPanelIds,
        workspaceHiddenPanelIds: state.workspaceHiddenPanelIds,
        viewportState: state.viewportState,
        commandView: state.commandView,
        activeLoopId: state.activeLoopId,
        reviewQueue: state.reviewQueue,
        selectedRepoPath: state.selectedRepoPath,
      }),
    },
  ),
);
