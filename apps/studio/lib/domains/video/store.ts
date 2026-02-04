import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { VideoDoc, VideoPatchOp } from './types';
import { applyVideoOperations } from './operations';

interface VideoStore {
  doc: VideoDoc | null;
  isDirty: boolean;

  setDoc: (doc: VideoDoc) => void;
  applyOperations: (ops: VideoPatchOp[]) => void;
  save: () => Promise<void>;
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
      // TODO: persist via API when endpoint exists
      set((state) => {
        state.isDirty = false;
      });
    },
  })),
);
