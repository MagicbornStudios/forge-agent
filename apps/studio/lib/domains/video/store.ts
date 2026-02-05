import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { VideoDoc, VideoPatchOp } from './types';
import { applyVideoOperations } from './operations';
import { useAppShellStore } from '@/lib/app-shell/store';
import { payloadSdk, VIDEO_DOCS_SLUG } from '@/lib/api-client/payload-sdk';

interface VideoStore {
  doc: VideoDoc | null;
  isDirty: boolean;

  setDoc: (doc: VideoDoc) => void;
  /** Restore draft from persistence (only when documentId matches current doc). */
  restoreDraft: (payload: { doc: VideoDoc; isDirty: boolean }) => void;
  applyOperations: (ops: VideoPatchOp[]) => void;
  save: () => Promise<void>;
  loadDoc: (id: number) => Promise<void>;
}

export const VIDEO_DRAFT_KEY = 'forge:video-draft:v1';

export const useVideoStore = create<VideoStore>()(
  persist(
    immer((set, get) => ({
    doc: null,
    isDirty: false,

    setDoc: (doc) => {
      set((state) => {
        state.doc = doc;
        state.isDirty = false;
      });
      if (doc?.id != null) useAppShellStore.getState().setLastVideoDocId(doc.id);
    },

      restoreDraft: (payload) => {
        set((state) => {
          state.doc = payload.doc;
          state.isDirty = payload.isDirty;
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

      try {
        await payloadSdk.update({
          collection: VIDEO_DOCS_SLUG,
          id: doc.id,
          data: { doc: doc.doc },
        });
        set((state) => {
          state.isDirty = false;
        });
      } catch (error) {
        console.error('Failed to save video doc:', error);
      }
    },

      loadDoc: async (id) => {
        try {
          const loaded = await payloadSdk.findByID({ collection: VIDEO_DOCS_SLUG, id });
          set((state) => {
            state.doc = loaded;
            state.isDirty = false;
          });
          useAppShellStore.getState().setLastVideoDocId(id);
        } catch (error) {
          console.error('Failed to load video doc:', error);
        }
      },
    })),
  {
    name: VIDEO_DRAFT_KEY,
    partialize: (s) =>
      s.doc && s.isDirty ? { documentId: s.doc.id, doc: s.doc, isDirty: s.isDirty } : {},
    skipHydration: true,
  } ) );
