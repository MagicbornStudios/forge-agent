import { createForgeCopilotRuntime } from '@forge/shared/copilot/next/runtime';
import { getOpenRouterConfig } from '@/lib/openrouter-config';
import { getOpenRouterModels } from '@/lib/openrouter-models';
import { getPersistedModelIdForProvider } from '@/lib/model-router/persistence';
import { resolveModelIdFromRegistry } from '@/lib/model-router/selection';
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
  resolveModel: async (req) => {
    const modelId = await getPersistedModelIdForProvider(req, 'copilot');
    const registry = await getOpenRouterModels();
    const resolvedModelId = resolveModelIdFromRegistry(modelId, registry, {
      requireResponsesV2: true,
    });
    return {
      modelId: resolvedModelId,
      fallbacks: [],
    };
  },
  isResponsesV2Compatible: async (modelId) => {
    const compat = await getResponsesV2Compatibility(modelId, { probe: true });
    return compat === true;
  },
});
