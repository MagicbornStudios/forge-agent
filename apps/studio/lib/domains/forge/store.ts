'use client';

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { ForgeGraphDoc, ForgeGraphPatchOp } from '@forge/types/graph';
import { applyPatchOperations } from '@/lib/graph-operations';

export type ForgeGraphScope = 'narrative' | 'storylet';

interface ForgeGraphsStore {
  projectId: number | null;
  narrativeGraph: ForgeGraphDoc | null;
  storyletGraph: ForgeGraphDoc | null;
  activeScope: ForgeGraphScope;
  dirtyByScope: Record<ForgeGraphScope, boolean>;
  pendingFromPlanByScope: Record<ForgeGraphScope, boolean>;

  setProject: (projectId: number | null) => void;
  setGraph: (scope: ForgeGraphScope, graph: ForgeGraphDoc | null) => void;
  restoreDraft: (
    scope: ForgeGraphScope,
    payload: { graph: ForgeGraphDoc; isDirty: boolean; pendingFromPlan: boolean }
  ) => void;
  applyOperations: (scope: ForgeGraphScope, ops: ForgeGraphPatchOp[]) => void;
  setActiveScope: (scope: ForgeGraphScope) => void;
  setPendingFromPlan: (scope: ForgeGraphScope, value: boolean) => void;
  markSaved: (scope: ForgeGraphScope) => void;
}

export const FORGE_DRAFT_KEY = 'forge:graph-draft:v2';

export const useForgeGraphsStore = create<ForgeGraphsStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        projectId: null,
        narrativeGraph: null,
        storyletGraph: null,
        activeScope: 'narrative',
        dirtyByScope: { narrative: false, storylet: false },
        pendingFromPlanByScope: { narrative: false, storylet: false },

        setProject: (projectId) => {
          set((state) => {
            state.projectId = projectId;
            state.narrativeGraph = null;
            state.storyletGraph = null;
            state.activeScope = 'narrative';
            state.dirtyByScope = { narrative: false, storylet: false };
            state.pendingFromPlanByScope = { narrative: false, storylet: false };
          });
        },

        setGraph: (scope, graph) => {
          set((state) => {
            if (scope === 'narrative') state.narrativeGraph = graph;
            if (scope === 'storylet') state.storyletGraph = graph;
            if (graph) {
              state.dirtyByScope[scope] = false;
              state.pendingFromPlanByScope[scope] = false;
            }
          });
        },

        restoreDraft: (scope, payload) => {
          set((state) => {
            if (scope === 'narrative') state.narrativeGraph = payload.graph;
            if (scope === 'storylet') state.storyletGraph = payload.graph;
            state.dirtyByScope[scope] = payload.isDirty;
            state.pendingFromPlanByScope[scope] = payload.pendingFromPlan;
          });
        },

        applyOperations: (scope, ops) => {
          const { narrativeGraph, storyletGraph } = get();
          const graph = scope === 'narrative' ? narrativeGraph : storyletGraph;
          if (!graph) return;
          const updatedGraph = applyPatchOperations(graph, ops);
          set((state) => {
            if (scope === 'narrative') state.narrativeGraph = updatedGraph;
            if (scope === 'storylet') state.storyletGraph = updatedGraph;
            state.dirtyByScope[scope] = true;
          });
        },

        setActiveScope: (scope) => {
          set((state) => {
            state.activeScope = scope;
          });
        },

        setPendingFromPlan: (scope, value) => {
          set((state) => {
            state.pendingFromPlanByScope[scope] = value;
          });
        },

        markSaved: (scope) => {
          set((state) => {
            state.dirtyByScope[scope] = false;
            state.pendingFromPlanByScope[scope] = false;
          });
        },
      })),
      {
        name: FORGE_DRAFT_KEY,
        partialize: (s) => {
          const drafts: Record<string, unknown> = {};
          if (s.narrativeGraph && s.dirtyByScope.narrative) {
            drafts.narrative = {
              documentId: s.narrativeGraph.id,
              graph: s.narrativeGraph,
              isDirty: true,
              pendingFromPlan: s.pendingFromPlanByScope.narrative,
            };
          }
          if (s.storyletGraph && s.dirtyByScope.storylet) {
            drafts.storylet = {
              documentId: s.storyletGraph.id,
              graph: s.storyletGraph,
              isDirty: true,
              pendingFromPlan: s.pendingFromPlanByScope.storylet,
            };
          }

          return Object.keys(drafts).length > 0
            ? {
                projectId: s.projectId,
                activeScope: s.activeScope,
                drafts,
              }
            : {};
        },
        skipHydration: true,
      },
    ),
    { name: 'ForgeGraphs' },
  ),
);
