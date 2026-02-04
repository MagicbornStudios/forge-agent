import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { toast } from 'sonner';
import type { ForgeGraphDoc, ForgeGraphPatchOp } from '@/types/graph';
import { applyPatchOperations } from './graph-operations';
import { useSettingsStore } from '@/lib/settings/store';

interface GraphStore {
  graph: ForgeGraphDoc | null;
  isDirty: boolean;

  // Actions
  setGraph: (graph: ForgeGraphDoc) => void;
  applyOperations: (operations: ForgeGraphPatchOp[]) => void;
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
        const response = await fetch(`/api/graphs/${graph.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ flow: graph.flow }),
        });

        if (response.ok) {
          set((state) => {
            state.isDirty = false;
          });
          if (canToast()) {
            toast.success('Graph saved', {
              description: graph.title ? `Saved ${graph.title}.` : undefined,
            });
          }
        } else if (canToast()) {
          toast.error('Save failed', {
            description: 'The server rejected the save request.',
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
        const response = await fetch(`/api/graphs/${id}`);
        if (response.ok) {
          const graph = await response.json();
          set((state) => {
            state.graph = graph;
            state.isDirty = false;
          });
        } else if (canToast()) {
          toast.error('Load failed', {
            description: 'The server could not load that graph.',
          });
        }
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
