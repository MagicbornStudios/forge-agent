/**
 * Static default model IDs only. We do not maintain a full model list here;
 * the list for the ModelSwitcher comes from OpenRouter's API (GET /api/v1/models).
 *
 * Use these for:
 * - Default chat fallback chain when user has not set preferences (free models first).
 * - Default for image generation (env OPENROUTER_IMAGE_MODEL overrides).
 * - Default for task routes (forge/plan, structured-output) when no preference.
 */

/** Default free chat model IDs for "auto" mode fallback chain (order = preference). */
export const DEFAULT_FREE_CHAT_MODEL_IDS: string[] = [
  'google/gemini-2.0-flash-exp:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'qwen/qwen-2.5-72b-instruct:free',
  'mistralai/mistral-small-3.1-24b-instruct:free',
];

/** Default image generation model (env OPENROUTER_IMAGE_MODEL overrides). */
export const DEFAULT_IMAGE_MODEL = 'google/gemini-2.5-flash-image-preview';

/** Default model for task routes (forge/plan, structured-output). Same as first free chat default. */
export const DEFAULT_TASK_MODEL = DEFAULT_FREE_CHAT_MODEL_IDS[0] ?? 'google/gemini-2.0-flash-exp:free';

/** Minimal model options for settings dropdown (Auto + default free models). Full list comes from OpenRouter in ModelSwitcher. */
export const DEFAULT_MODEL_OPTIONS: { value: string; label: string }[] = [
  { value: 'auto', label: 'Auto (router)' },
  { value: 'google/gemini-2.0-flash-exp:free', label: 'Gemini 2.0 Flash' },
  { value: 'meta-llama/llama-3.3-70b-instruct:free', label: 'Llama 3.3 70B' },
  { value: 'qwen/qwen-2.5-72b-instruct:free', label: 'Qwen 2.5 72B' },
  { value: 'mistralai/mistral-small-3.1-24b-instruct:free', label: 'Mistral Small 3.1' },
];
