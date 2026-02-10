'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { ModelDef, ModelProviderId } from './types';
import { getDefaultChatModelId } from './defaults';
import { getModelSettings, setModelSettingsModelId } from '@/lib/api-client/model-settings';
import { clientLogger } from '@/lib/logger-client';

// ---------------------------------------------------------------------------
// Client-side model router store (two slots: copilot, assistantUi)
// ---------------------------------------------------------------------------

interface ModelRouterState {
  registry: ModelDef[];
  copilotModelId: string;
  assistantUiModelId: string;
  isLoading: boolean;

  fetchSettings: () => Promise<void>;
  setModelId: (provider: ModelProviderId, modelId: string) => Promise<void>;
}

export const useModelRouterStore = create<ModelRouterState>()(
  devtools(
    immer((set, get) => ({
      registry: [],
      copilotModelId: getDefaultChatModelId(),
      assistantUiModelId: getDefaultChatModelId(),
      isLoading: false,

      fetchSettings: async () => {
        set({ isLoading: true });
        try {
          const data = await getModelSettings();
          set({
            registry: Array.isArray(data.registry) ? data.registry : [],
            copilotModelId: typeof data.copilotModelId === 'string' ? data.copilotModelId : get().copilotModelId,
            assistantUiModelId: typeof data.assistantUiModelId === 'string' ? data.assistantUiModelId : get().assistantUiModelId,
          });
        } catch (err) {
          clientLogger.error('Failed to fetch model settings', {
            err: err instanceof Error ? err.message : String(err),
          }, 'model-router');
        } finally {
          set({ isLoading: false });
        }
      },

      setModelId: async (provider, modelId) => {
        try {
          const data = await setModelSettingsModelId(provider, modelId);
          set({
            copilotModelId: data.copilotModelId ?? get().copilotModelId,
            assistantUiModelId: data.assistantUiModelId ?? get().assistantUiModelId,
          });
        } catch (err) {
          clientLogger.error('Failed to set model', {
            provider,
            err: err instanceof Error ? err.message : String(err),
          }, 'model-router');
        }
      },
    })),
    { name: 'ModelRouter' },
  ),
);
