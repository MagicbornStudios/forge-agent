import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from '@copilotkit/runtime';
import { BuiltInAgent } from '@copilotkit/runtime/v2';
import { createOpenAI } from '@ai-sdk/openai';
import OpenAI from 'openai';
import { getOpenRouterConfig } from '@/lib/openrouter-config';
import { resolvePrimaryAndFallbacks } from '@/lib/model-router/server-state';
import { createFetchWithModelFallbacks } from '@/lib/model-router/openrouter-fetch';

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

/**
 * Build CopilotKit runtime using OpenAI SDK + @ai-sdk/openai with OpenRouter baseURL.
 * Fallbacks are applied via custom fetch on the adapter; BuiltInAgent uses primary only.
 */
function buildRuntime(primary: string, fallbacks: string[]) {
  const customFetch =
    fallbacks.length > 0
      ? createFetchWithModelFallbacks(primary, fallbacks, config.baseUrl)
      : undefined;

  const openaiClient = new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseUrl,
    fetch: customFetch,
    defaultHeaders: openRouterHeaders,
  });

  const serviceAdapter = new OpenAIAdapter({
    model: primary,
    openai: openaiClient as any,
  });

  const openRouterAiSdk = createOpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseUrl,
    headers: openRouterHeaders,
  });
  const languageModel = openRouterAiSdk(primary);
  const defaultAgent = new BuiltInAgent({ model: languageModel as any });

  const runtime = new CopilotRuntime({
    agents: { default: defaultAgent } as any,
  });

  return { runtime, serviceAdapter };
}

function resolveRequestedModel(req: Request): string | null {
  const requested = req.headers.get('x-forge-model');
  if (!requested || requested === 'auto') return null;
  return requested;
}

/**
 * POST /api/copilotkit
 *
 * Resolves primary + fallbacks from preferences, builds runtime with OpenRouter model fallbacks,
 * and handles the request. No per-request health/cooldown; OpenRouter handles retries via models array.
 */
export const POST = async (req: Request) => {
  const { primary, fallbacks, mode } = resolvePrimaryAndFallbacks();
  const requestedModel = resolveRequestedModel(req);
  const selectedPrimary = requestedModel ?? primary;
  const selectedFallbacks = requestedModel ? [] : fallbacks;
  console.log(`[CopilotKit] Using model: ${selectedPrimary} (mode: ${mode}, fallbacks: ${selectedFallbacks.length})`);

  const { runtime, serviceAdapter } = buildRuntime(selectedPrimary, selectedFallbacks);

  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: '/api/copilotkit',
  });

  return handleRequest(req);
};
