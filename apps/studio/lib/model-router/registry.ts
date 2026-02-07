/**
 * Model router registry: static defaults only.
 * The full model list for the UI comes from OpenRouter's API (see getOpenRouterModels in openrouter-models.ts).
 * Model-settings GET returns that list as registry.
 */
import {
  DEFAULT_FREE_CHAT_MODEL_IDS,
} from './defaults';

/** When true, UI only shows free-tier models (from OpenRouter list). */
export const FREE_ONLY = true;

/** Default enabled model IDs = default fallback chain (free models, first = primary). */
export function getDefaultEnabledIds(): string[] {
  return [...DEFAULT_FREE_CHAT_MODEL_IDS];
}

/** Default fallback chain for auto mode. Same as default enabled. */
export function getDefaultFallbackChain(): string[] {
  return getDefaultEnabledIds();
}

/**
 * Check if an ID is in the default list (for validation when OpenRouter list not available).
 * When we have a fetched OpenRouter list, validation can be "id is in that list".
 */
export function isDefaultModelId(id: string): boolean {
  return DEFAULT_FREE_CHAT_MODEL_IDS.includes(id);
}
