import 'server-only';
import { getOpenRouterBaseUrl, getOpenRouterTimeoutMs, requireOpenRouterApiKey } from '@/lib/env';

export type OpenRouterConfig = {
  apiKey: string;
  baseUrl: string;
  timeoutMs: number;
};

export const getOpenRouterConfig = (): OpenRouterConfig => {
  const apiKey = requireOpenRouterApiKey();
  const baseUrl = getOpenRouterBaseUrl();
  const config: OpenRouterConfig = {
    apiKey,
    baseUrl,
    timeoutMs: getOpenRouterTimeoutMs(),
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
