import 'server-only';

/** Free model defaults (CopilotKit uses model-router resolveModel(); these are for non-CopilotKit use). */
const DEFAULT_MODEL_FREE = 'google/gemini-2.0-flash-exp:free';
const DEFAULT_TIMEOUT_MS = 60000;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

const parseTimeout = (value?: string) => {
  if (!value) {
    return DEFAULT_TIMEOUT_MS;
  }
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return DEFAULT_TIMEOUT_MS;
  }
  return parsed;
};

export type OpenRouterConfig = {
  apiKey?: string;
  baseUrl: string;
  timeoutMs: number;
  models: {
    fast: string;
    reasoning: string;
  };
};

export const getOpenRouterConfig = (): OpenRouterConfig => {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  const baseUrl = process.env.OPENROUTER_BASE_URL?.trim() || OPENROUTER_BASE_URL;
  const config: OpenRouterConfig = {
    apiKey,
    baseUrl,
    timeoutMs: parseTimeout(process.env.OPENROUTER_TIMEOUT_MS),
    models: {
      fast: process.env.OPENROUTER_MODEL_FAST ?? DEFAULT_MODEL_FREE,
      reasoning: process.env.OPENROUTER_MODEL_REASONING ?? DEFAULT_MODEL_FREE,
    },
  };
  // Log config at resolve time (key masked) for debugging
  console.log('[OpenRouter] config resolved', {
    baseUrl: config.baseUrl,
    hasApiKey: !!config.apiKey,
    apiKeyPrefix: config.apiKey ? `${config.apiKey.slice(0, 10)}...` : 'none',
    modelFast: config.models.fast,
    modelReasoning: config.models.reasoning,
  });
  return config;
};
