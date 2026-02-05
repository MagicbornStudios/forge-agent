import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { VideoDoc, VideoPatchOp } from './types';
import { applyVideoOperations } from './operations';
import { setLastVideoDocId } from '@/lib/persistence/local-storage';
import { VideoDocsService } from '@/lib/api-client';

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
        await VideoDocsService.patchApiVideoDocs(String(doc.id), { doc: doc.doc });
        set((state) => {
          state.isDirty = false;
        });
      } catch (error) {
        console.error('Failed to save video doc:', error);
      }
    },

    loadDoc: async (id) => {
      try {
        const loaded = await VideoDocsService.getApiVideoDocs(String(id));
        set((state) => {
          state.doc = loaded;
          state.isDirty = false;
        });
        setLastVideoDocId(id);
      } catch (error) {
        console.error('Failed to load video doc:', error);
      }
    },
  })),
);
