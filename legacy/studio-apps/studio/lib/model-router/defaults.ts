/**
 * Static default model IDs. No model IDs in .env; default chosen by env type (e.g. NODE_ENV).
 * The full model list for ModelSwitcher comes from OpenRouter's API (GET /api/v1/models).
 */

/** Default free chat model (used when no selection yet). */
const DEFAULT_CHAT_MODEL_ID = 'openai/gpt-oss-120b:free';

/** Optional production default if different from dev. */
const DEFAULT_CHAT_MODEL_ID_PROD = 'openai/gpt-oss-120b:free';

/**
 * Models that were used historically but now fail in the chat endpoint path.
 * Keep this list small and explicit; unknown IDs are handled by registry fallback.
 */
const LEGACY_UNAVAILABLE_MODEL_IDS = new Set<string>([
  'google/gemini-2.0-flash-exp:free',
]);

/**
 * Default chat model ID. Switches by NODE_ENV (development vs production).
 * No model IDs in .env; only env type selects which constant is used.
 */
export function getDefaultChatModelId(): string {
  return process.env.NODE_ENV === 'production' ? DEFAULT_CHAT_MODEL_ID_PROD : DEFAULT_CHAT_MODEL_ID;
}

/** Used by openrouter-models for responses v2 probing (subset of free models). */
export const DEFAULT_FREE_CHAT_MODEL_IDS: string[] = [
  'openai/gpt-oss-120b:free',
  'openai/gpt-oss-20b:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'deepseek/deepseek-r1-0528:free',
  'qwen/qwen3-coder:free',
  'qwen/qwen-2.5-72b-instruct:free',
  'mistralai/mistral-small-3.1-24b-instruct:free',
];

export function isLegacyUnavailableModelId(modelId: string): boolean {
  return LEGACY_UNAVAILABLE_MODEL_IDS.has(modelId);
}

/** Default image generation model. No env override; use this constant only. */
export const DEFAULT_IMAGE_MODEL = 'google/gemini-2.5-flash-image-preview';

/** Default for task routes (forge/plan, structured-output). Single model from code. */
export const DEFAULT_TASK_MODEL = getDefaultChatModelId();
