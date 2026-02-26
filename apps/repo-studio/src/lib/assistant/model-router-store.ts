'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { AssistantRuntime, RepoAssistantModelOption } from '@/lib/api/types';
import { fetchModelCatalog, saveModelSelection } from '@/lib/api/services';

type RuntimeCatalog = {
  loading: boolean;
  error: string;
  warning: string;
  source: string;
  selectedModelId: string;
  models: RepoAssistantModelOption[];
};

type ModelRouterState = {
  catalogs: Record<AssistantRuntime, RuntimeCatalog>;
  fetchCatalog: (
    runtime: AssistantRuntime,
    input: { workspaceId?: string; loopId?: string },
  ) => Promise<void>;
  selectModel: (
    runtime: AssistantRuntime,
    modelId: string,
    input: { workspaceId?: string; loopId?: string },
  ) => Promise<void>;
};

function createRuntimeCatalog(runtime: AssistantRuntime): RuntimeCatalog {
  return {
    loading: false,
    error: '',
    warning: '',
    source: '',
    selectedModelId: runtime === 'codex' ? 'gpt-5' : 'openai/gpt-oss-120b:free',
    models: [],
  };
}

export const useRepoAssistantModelStore = create<ModelRouterState>()(
  devtools(
    immer((set, get) => ({
      catalogs: {
        forge: createRuntimeCatalog('forge'),
        codex: createRuntimeCatalog('codex'),
      },

      fetchCatalog: async (runtime, input) => {
        set((state) => {
          state.catalogs[runtime].loading = true;
          state.catalogs[runtime].error = '';
        });
        try {
          const payload = await fetchModelCatalog({
            runtime,
            workspaceId: input.workspaceId,
            loopId: input.loopId,
          });
          set((state) => {
            state.catalogs[runtime].loading = false;
            state.catalogs[runtime].warning = String(payload.warning || '');
            state.catalogs[runtime].source = String(payload.source || '');
            state.catalogs[runtime].models = Array.isArray(payload.models) ? payload.models : [];
            state.catalogs[runtime].selectedModelId = String(payload.selectedModelId || state.catalogs[runtime].selectedModelId);
          });
        } catch (error: any) {
          const message = String(error?.message || error || 'Unable to load model catalog.');
          set((state) => {
            state.catalogs[runtime].loading = false;
            state.catalogs[runtime].error = message;
          });
        }
      },

      selectModel: async (runtime, modelId, input) => {
        const next = String(modelId || '').trim();
        if (!next) return;
        const previous = get().catalogs[runtime].selectedModelId;
        set((state) => {
          state.catalogs[runtime].selectedModelId = next;
          state.catalogs[runtime].error = '';
        });
        try {
          await saveModelSelection({
            runtime,
            modelId: next,
            workspaceId: input.workspaceId,
            loopId: input.loopId,
          });
        } catch (error: any) {
          const message = String(error?.message || error || 'Unable to persist model selection.');
          set((state) => {
            state.catalogs[runtime].selectedModelId = previous;
            state.catalogs[runtime].error = message;
          });
        }
      },
    })),
    { name: 'RepoAssistantModelRouter' },
  ),
);
