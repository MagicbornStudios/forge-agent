import 'server-only';

import type { ModelHealth, ModelPreferences, SelectionMode } from './types';
import { MODEL_REGISTRY, getDefaultEnabledIds } from './registry';
import { createHealth, recordError, recordSuccess, autoSelectModel } from './auto-switch';

/**
 * Server-side singleton state for model health tracking.
 *
 * In production this would be backed by Redis/KV. For the PoC
 * we use in-memory state (reset on server restart).
 */

let healthMap: Record<string, ModelHealth> = {};
let currentPrefs: ModelPreferences = {
  mode: 'auto',
  manualModelId: null,
  enabledModelIds: getDefaultEnabledIds(),
};

// ---------------------------------------------------------------------------
// Health management
// ---------------------------------------------------------------------------

function getOrCreateHealth(modelId: string): ModelHealth {
  if (!healthMap[modelId]) {
    healthMap[modelId] = createHealth(modelId);
  }
  return healthMap[modelId];
}

export function reportModelError(modelId: string): void {
  const health = getOrCreateHealth(modelId);
  healthMap[modelId] = recordError(health);
  console.log(`[ModelRouter] Error recorded for ${modelId}`, {
    errorCount: healthMap[modelId].errorCount,
    cooldownUntil: healthMap[modelId].cooldownUntil
      ? new Date(healthMap[modelId].cooldownUntil!).toISOString()
      : null,
  });
}

export function reportModelSuccess(modelId: string): void {
  const health = getOrCreateHealth(modelId);
  healthMap[modelId] = recordSuccess(health);
}

// ---------------------------------------------------------------------------
// Preferences
// ---------------------------------------------------------------------------

export function getPreferences(): ModelPreferences {
  return { ...currentPrefs };
}

export function updatePreferences(patch: Partial<ModelPreferences>): ModelPreferences {
  currentPrefs = { ...currentPrefs, ...patch };
  console.log('[ModelRouter] Preferences updated', currentPrefs);
  return { ...currentPrefs };
}

// ---------------------------------------------------------------------------
// Model selection (the core resolve function)
// ---------------------------------------------------------------------------

/**
 * Resolve which model to use for the current request.
 *
 * - In `'manual'` mode: returns the user's chosen model (even if in cooldown).
 * - In `'auto'` mode: runs the auto-switch algorithm.
 */
export function resolveModel(): { modelId: string; mode: SelectionMode } {
  const prefs = currentPrefs;

  if (prefs.mode === 'manual' && prefs.manualModelId) {
    return { modelId: prefs.manualModelId, mode: 'manual' };
  }

  // Auto mode
  const selected = autoSelectModel(
    MODEL_REGISTRY,
    prefs.enabledModelIds,
    healthMap,
  );

  if (selected) {
    return { modelId: selected.id, mode: 'auto' };
  }

  // Absolute fallback: first enabled model regardless of cooldown
  const fallbackId = prefs.enabledModelIds[0] ?? MODEL_REGISTRY[0].id;
  return { modelId: fallbackId, mode: 'auto' };
}

// ---------------------------------------------------------------------------
// Snapshot (for API response to client)
// ---------------------------------------------------------------------------

export function getHealthSnapshot(): Record<string, ModelHealth> {
  return { ...healthMap };
}
