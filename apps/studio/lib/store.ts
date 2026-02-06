import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { toast } from 'sonner';
import type { ForgeGraphDoc, ForgeGraphPatchOp } from '@forge/types/graph';
import { applyPatchOperations } from './graph-operations';
import { useSettingsStore } from '@/lib/settings/store';
import { useAppShellStore } from '@/lib/app-shell/store';
import { payloadSdk, FORGE_GRAPHS_SLUG } from '@/lib/api-client/payload-sdk';

interface GraphStore {
  graph: ForgeGraphDoc | null;
  isDirty: boolean;
  /** True when the last draft change came from executing a plan (for review UI: Revert/Accept). */
  pendingFromPlan: boolean;

  setGraph: (graph: ForgeGraphDoc) => void;
  /** Restore draft from persistence (only when documentId matches current doc). */
  restoreDraft: (payload: { graph: ForgeGraphDoc; isDirty: boolean; pendingFromPlan: boolean }) => void;
  applyOperations: (operations: ForgeGraphPatchOp[]) => void;
  setPendingFromPlan: (value: boolean) => void;
  saveGraph: () => Promise<void>;
  loadGraph: (id: number) => Promise<void>;
}

function canToast() {
  if (typeof window === 'undefined') return false;
  const enabled = useSettingsStore.getState().getSettingValue('ui.toastsEnabled');
  return enabled !== false;
}

export const GRAPH_DRAFT_KEY = 'forge:graph-draft:v1';

export const useGraphStore = create<GraphStore>()(
  devtools(
    persist(
      immer((set, get) => ({
      graph: null,
      isDirty: false,
      pendingFromPlan: false,

      setGraph: (graph) => {
        set((state) => {
          state.graph = graph;
          state.isDirty = false;
        });
      },

      restoreDraft: (payload) => {
        set((state) => {
          state.graph = payload.graph;
          state.isDirty = payload.isDirty;
          state.pendingFromPlan = payload.pendingFromPlan;
        });
      },

      setPendingFromPlan: (value) => {
        set((state) => {
          state.pendingFromPlan = value;
        });
      },

      applyOperations: (operations) => {
      const { graph } = get();
      if (!graph) return;

      const updatedGraph = applyPatchOperations(graph, operations);
      set((state) => {
        state.graph = updatedGraph;
        state.isDirty = true;
      });
    },

      saveGraph: async () => {
        const { graph } = get();
        if (!graph) return;
        try {
          await payloadSdk.update({
            collection: FORGE_GRAPHS_SLUG,
            id: graph.id,
            data: { flow: graph.flow },
          });
          set((state) => {
            state.isDirty = false;
          });
          if (canToast()) {
            toast.success('Graph saved', {
              description: graph.title ? `Saved ${graph.title}.` : undefined,
            });
          }
        } catch (error) {
          console.error('Failed to save graph:', error);
          if (canToast()) {
            toast.error('Save failed', {
              description: 'Network error while saving the graph.',
            });
          }
        }
      },

      loadGraph: async (id) => {
        try {
          const graph = await payloadSdk.findByID({ collection: FORGE_GRAPHS_SLUG, id }) as ForgeGraphDoc;
          set((state) => {
            state.graph = graph;
            state.isDirty = false;
            state.pendingFromPlan = false;
          });
          useAppShellStore.getState().setLastGraphId(id);
        } catch (error) {
          console.error('Failed to load graph:', error);
          if (canToast()) {
            toast.error('Load failed', {
              description: 'Network error while loading the graph.',
            });
          }
        }
      },
    })),
      {
        name: GRAPH_DRAFT_KEY,
        partialize: (s) =>
          s.graph && s.isDirty
            ? {
                documentId: s.graph.id,
                graph: s.graph,
                isDirty: s.isDirty,
                pendingFromPlan: s.pendingFromPlan ?? false,
              }
            : {},
        skipHydration: true,
      },
    ),
    { name: 'Graph' },
  ),
);

