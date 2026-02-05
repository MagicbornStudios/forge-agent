'use client';

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { ModelDef, ModelHealth, SelectionMode, ModelPreferences } from './types';
import { MODEL_REGISTRY, getDefaultEnabledIds } from './registry';
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
  /** Which models the user has enabled. */
  enabledModelIds: string[];
  /** Current active model (resolved by server or locally). */
  activeModelId: string;
  /** Server-reported health data. */
  health: Record<string, ModelHealth>;
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
  immer((set, get) => ({
    registry: MODEL_REGISTRY,
    mode: 'auto',
    manualModelId: null,
    enabledModelIds: getDefaultEnabledIds(),
    activeModelId: MODEL_REGISTRY.find((m) => m.enabledByDefault)?.id ?? MODEL_REGISTRY[0].id,
    health: {},
    isLoading: false,

    setMode: (mode) => {
      set({ mode });
      // If switching to manual and no model selected, pick the current active
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
      // Must have at least one enabled
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
          health: data.health ?? {},
          enabledModelIds: data.preferences?.enabledModelIds ?? get().enabledModelIds,
          manualModelId: data.preferences?.manualModelId ?? get().manualModelId,
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
        set({ activeModelId: data.activeModelId, health: data.health ?? {} });
      } catch (err) {
        console.error('[ModelRouter] Failed to save preferences:', err);
      }
    },
  })),
);
