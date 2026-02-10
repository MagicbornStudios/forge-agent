import 'server-only';

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
};

export const getOpenRouterConfig = (): OpenRouterConfig => {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  const baseUrl = process.env.OPENROUTER_BASE_URL?.trim() || OPENROUTER_BASE_URL;
  const config: OpenRouterConfig = {
    apiKey,
    baseUrl,
    timeoutMs: parseTimeout(process.env.OPENROUTER_TIMEOUT_MS),
  };
  if (process.env.NODE_ENV === 'development') {
    console.log('[OpenRouter] config resolved', {
      baseUrl: config.baseUrl,
      hasApiKey: !!config.apiKey,
      apiKeyPrefix: config.apiKey ? `${config.apiKey.slice(0, 10)}...` : 'none',
    });
  }
  return config;
};
