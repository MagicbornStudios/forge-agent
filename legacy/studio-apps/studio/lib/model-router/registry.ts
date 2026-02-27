/**
 * Model router registry: static defaults only.
 * The full model list for the UI comes from OpenRouter's API (see getOpenRouterModels in openrouter-models.ts).
 * Model-settings GET returns that list as registry.
 */
import { DEFAULT_FREE_CHAT_MODEL_IDS } from './defaults';

/** When true, UI only shows free-tier models (from OpenRouter list). */
export const FREE_ONLY = true;

/**
 * Check if an ID is in the default list (for validation when OpenRouter list not available).
 */
export function isDefaultModelId(id: string): boolean {
  return DEFAULT_FREE_CHAT_MODEL_IDS.includes(id);
}
