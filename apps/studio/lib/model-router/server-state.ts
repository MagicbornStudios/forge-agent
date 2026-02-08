import 'server-only';

import type { ModelPreferences, PrimaryAndFallbacks, SelectionMode } from './types';
import { getDefaultEnabledIds, getDefaultFallbackChain } from './registry';
import { DEFAULT_FREE_CHAT_MODEL_IDS } from './defaults';

/**
 * Server-side preferences for model selection.
 * In production this would be backed by Redis/KV. For the PoC we use in-memory state (reset on server restart).
 */
let currentPrefs: ModelPreferences = {
  mode: 'auto',
  manualModelId: null,
  enabledModelIds: getDefaultEnabledIds(),
};

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
// Resolve primary + fallbacks (for OpenRouter models array)
// ---------------------------------------------------------------------------

/**
 * Resolve primary model and fallback list for the current request.
 *
 * - In `'manual'` mode: primary = user's chosen model, fallbacks = [].
 * - In `'auto'` mode: primary = first of enabled list (or default chain), fallbacks = rest of that list.
 */
export function resolvePrimaryAndFallbacks(options?: {
  allowedModelIds?: Set<string>;
}): PrimaryAndFallbacks & { mode: SelectionMode } {
  const prefs = currentPrefs;

  if (prefs.mode === 'manual' && prefs.manualModelId) {
    return {
      primary: prefs.manualModelId,
      fallbacks: [],
      mode: 'manual',
    };
  }

  const chain =
    prefs.enabledModelIds.length > 0 ? prefs.enabledModelIds : getDefaultFallbackChain();
  const filtered = options?.allowedModelIds
    ? chain.filter((id) => options.allowedModelIds?.has(id))
    : chain;
  const resolvedChain = filtered.length > 0 ? filtered : chain;
  const primary =
    resolvedChain[0] ?? DEFAULT_FREE_CHAT_MODEL_IDS[0] ?? 'google/gemini-2.0-flash-exp:free';
  const fallbacks = resolvedChain.slice(1);

  return { primary, fallbacks, mode: 'auto' };
}
