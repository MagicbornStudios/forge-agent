import { createForgeCopilotRuntime } from '@forge/shared/copilot/next/runtime';
import { getOpenRouterConfig } from '@/lib/openrouter-config';
import { resolvePrimaryAndFallbacks } from '@/lib/model-router/server-state';
import { resolveCopilotKitModel } from '@/lib/model-router/resolve-for-routes';
import { createFetchWithModelFallbacks } from '@/lib/model-router/openrouter-fetch';
import {
  DEFAULT_RESPONSES_V2_FALLBACK_MODEL,
  getResponsesV2Compatibility,
} from '@/lib/model-router/responses-compat';

const config = getOpenRouterConfig();

if (!config.apiKey) {
  throw new Error(
    'OpenRouter API key not configured. Please set OPENROUTER_API_KEY environment variable.',
  );
}

const openRouterHeaders = {
  'HTTP-Referer': 'https://forge-agent-poc.local',
  'X-Title': 'Forge Agent PoC',
};

export const copilotkitHandler = createForgeCopilotRuntime({
  apiKey: config.apiKey,
  baseUrl: config.baseUrl,
  headers: openRouterHeaders,
  requireResponsesV2: true,
  fallbackModelId: DEFAULT_RESPONSES_V2_FALLBACK_MODEL,
  wrapFetchForFallbacks: (primary, fallbacks) =>
    createFetchWithModelFallbacks(primary, fallbacks, config.baseUrl),
  resolveModel: (req) => {
    const { modelId, fallbacks } = resolveCopilotKitModel(req, resolvePrimaryAndFallbacks);
    const { mode } = resolvePrimaryAndFallbacks();
    log.info({ modelId, mode, fallbacksCount: fallbacks.length }, 'Using model');
    return { modelId, fallbacks };
  },
  isResponsesV2Compatible: async (modelId) => {
    const compat = await getResponsesV2Compatibility(modelId, { probe: true });
    return compat === true;
  },
});
