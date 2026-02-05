import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { VideoDoc, VideoPatchOp } from './types';
import { applyVideoOperations } from './operations';
import { setLastVideoDocId } from '@/lib/persistence/local-storage';

interface VideoStore {
  doc: VideoDoc | null;
  isDirty: boolean;

  setDoc: (doc: VideoDoc) => void;
  applyOperations: (ops: VideoPatchOp[]) => void;
  save: () => Promise<void>;
  loadDoc: (id: number) => Promise<void>;
}

export const useVideoStore = create<VideoStore>()(
  immer((set, get) => ({
    doc: null,
    isDirty: false,

    setDoc: (doc) => {
      set((state) => {
        state.doc = doc;
        state.isDirty = false;
      });
      if (doc?.id != null) setLastVideoDocId(doc.id);
    },

    applyOperations: (ops) => {
      const { doc } = get();
      if (!doc) return;
      const updated = applyVideoOperations(doc, ops);
      set((state) => {
        state.doc = updated;
        state.isDirty = true;
      });
    },

    save: async () => {
      const { doc } = get();
      if (!doc) return;

      try {
        const response = await fetch(`/api/video-docs/${doc.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ doc: doc.doc }),
        });

        if (response.ok) {
          set((state) => {
            state.isDirty = false;
          });
        }
      } catch (error) {
        console.error('Failed to save video doc:', error);
      }
    },

    loadDoc: async (id) => {
      try {
        const response = await fetch(`/api/video-docs/${id}`);
        if (response.ok) {
          const doc = await response.json();
          set((state) => {
            state.doc = doc;
            state.isDirty = false;
          });
          setLastVideoDocId(id);
        }
      } catch (error) {
        console.error('Failed to load video doc:', error);
      }
    },
  })),
);
