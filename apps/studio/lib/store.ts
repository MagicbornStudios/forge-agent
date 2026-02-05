import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { toast } from 'sonner';
import type { ForgeGraphDoc, ForgeGraphPatchOp } from '@forge/types/graph';
import { applyPatchOperations } from './graph-operations';
import { useSettingsStore } from '@/lib/settings/store';
import { setLastGraphId } from '@/lib/persistence/local-storage';
import { GraphsService } from '@/lib/api-client';

interface GraphStore {
  graph: ForgeGraphDoc | null;
  isDirty: boolean;
  /** True when the last draft change came from executing a plan (for review UI: Revert/Accept). */
  pendingFromPlan: boolean;

  setGraph: (graph: ForgeGraphDoc) => void;
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

export const useGraphStore = create<GraphStore>()(
  immer((set, get) => ({
    graph: null,
    isDirty: false,

    setGraph: (graph) => {
      set((state) => {
        state.graph = graph;
        state.isDirty = false;
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
        await GraphsService.patchApiGraphs(String(graph.id), { flow: graph.flow });
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
        const graph = await GraphsService.getApiGraphs(String(id));
        set((state) => {
          state.graph = graph;
          state.isDirty = false;
          state.pendingFromPlan = false;
        });
        setLastGraphId(id);
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
);

