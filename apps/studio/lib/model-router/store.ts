'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { ModelDef, SelectionMode, ModelPreferences } from './types';
import { getDefaultEnabledIds } from './registry';
import { ModelService } from '@/lib/api-client';

// ---------------------------------------------------------------------------
// Client-side model router store
// ---------------------------------------------------------------------------

interface ModelRouterState {
  /** Full registry (static). */
  registry: ModelDef[];
  /** Current selection mode. */
  mode: SelectionMode;
  /** When manual, the chosen model ID. */
  manualModelId: string | null;
  /** Which models the user has enabled (auto mode: order = primary then fallbacks). */
  enabledModelIds: string[];
  /** Current active/primary model ID. */
  activeModelId: string;
  /** Fallback model IDs (for display). */
  fallbackIds: string[];
  /** Whether we're loading settings from server. */
  isLoading: boolean;

  // Actions
  setMode: (mode: SelectionMode) => void;
  setManualModel: (modelId: string) => void;
  toggleModel: (modelId: string) => void;
  /** Fetch settings from server. */
  fetchSettings: () => Promise<void>;
  /** Push preferences to server. */
  savePreferences: () => Promise<void>;
}

export const useModelRouterStore = create<ModelRouterState>()(
  devtools(
    immer((set, get) => ({
    registry: [],
    mode: 'auto',
    manualModelId: null,
    enabledModelIds: getDefaultEnabledIds(),
    activeModelId: getDefaultEnabledIds()[0] ?? 'google/gemini-2.0-flash-exp:free',
      fallbackIds: [],
      isLoading: false,

      setMode: (mode) => {
        set({ mode });
        if (mode === 'manual' && !get().manualModelId) {
          set({ manualModelId: get().activeModelId });
        }
        get().savePreferences();
      },

      setManualModel: (modelId) => {
        set({ manualModelId: modelId, mode: 'manual' });
        get().savePreferences();
      },

      toggleModel: (modelId) => {
        const { enabledModelIds } = get();
        const next = enabledModelIds.includes(modelId)
          ? enabledModelIds.filter((id) => id !== modelId)
          : [...enabledModelIds, modelId];
        if (next.length === 0) return;
        set({ enabledModelIds: next });
        get().savePreferences();
      },

      fetchSettings: async () => {
        set({ isLoading: true });
        try {
          const data = await ModelService.getApiModelSettings();
          set({
            activeModelId: data.activeModelId,
            mode: data.mode,
            fallbackIds: data.fallbackIds ?? [],
            enabledModelIds: data.preferences?.enabledModelIds ?? get().enabledModelIds,
            manualModelId: data.preferences?.manualModelId ?? get().manualModelId,
            registry: Array.isArray(data.registry) ? data.registry : [],
          });
        } catch (err) {
          console.error('[ModelRouter] Failed to fetch settings:', err);
        } finally {
          set({ isLoading: false });
        }
      },

      savePreferences: async () => {
        const { mode, manualModelId, enabledModelIds } = get();
        try {
          const data = await ModelService.postApiModelSettings({
            mode,
            manualModelId: manualModelId ?? undefined,
            enabledModelIds,
          });
          set({
            activeModelId: data.activeModelId,
            fallbackIds: data.fallbackIds ?? [],
          });
        } catch (err) {
          console.error('[ModelRouter] Failed to save preferences:', err);
        }
      },
    })),
    { name: 'ModelRouter' },
  ),
);
