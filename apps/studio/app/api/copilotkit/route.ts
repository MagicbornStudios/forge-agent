import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from '@copilotkit/runtime';
import { BuiltInAgent } from '@copilotkit/runtime/v2';
import { createOpenAI } from '@ai-sdk/openai';
import OpenAI from 'openai';
import { getOpenRouterConfig } from '@/lib/openrouter-config';
import {
  resolveModel,
  reportModelError,
  reportModelSuccess,
} from '@/lib/model-router/server-state';
import { getModelDef } from '@/lib/model-router/registry';

const config = getOpenRouterConfig();

if (!config.apiKey) {
  throw new Error(
    'OpenRouter API key not configured. Please set OPENROUTER_API_KEY environment variable.',
  );
}

/**
 * Build CopilotKit runtime + adapter for a given model ID.
 *
 * Re-created per request so the model can change dynamically
 * as the auto-switcher rotates through available models.
 *
 * We pass an explicit default agent backed by OpenRouter (apiKey + baseURL)
 * so agent execution never falls back to OPENAI_API_KEY.
 */
function buildRuntime(modelId: string) {
  const openaiClient = new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseUrl,
    defaultHeaders: {
      'HTTP-Referer': 'https://forge-agent-poc.local',
      'X-Title': 'Forge Agent PoC',
    },
  });

  const serviceAdapter = new OpenAIAdapter({
    model: modelId,
    openai: openaiClient as any,
  });

  const openRouter = createOpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseUrl,
  });
  const languageModel = openRouter(modelId);
  // BuiltInAgent typings expect LanguageModelV2; @ai-sdk/openai returns v3. Cast for compatibility.
  const defaultAgent = new BuiltInAgent({ model: languageModel as any });

  const runtime = new CopilotRuntime({
    agents: { default: defaultAgent } as any,
  });

  return { runtime, serviceAdapter };
}

function resolveRequestedModel(req: Request): string | null {
  const requested = req.headers.get('x-forge-model');
  if (!requested || requested === 'auto') return null;
  const def = getModelDef(requested);
  if (!def) {
    console.warn(`[CopilotKit] Requested model not in registry: ${requested}. Using router.`);
    return null;
  }
  return requested;
}

/**
 * POST /api/copilotkit
 *
 * Resolves the active model via the model router, attempts the request,
 * and records success/error for the auto-switch health tracker.
 */
export const POST = async (req: Request) => {
  const { modelId, mode } = resolveModel();
  const requestedModel = resolveRequestedModel(req);
  const selectedModel = requestedModel ?? modelId;
  const selectedMode = requestedModel ? 'override' : mode;
  console.log(`[CopilotKit] Using model: ${selectedModel} (mode: ${selectedMode})`);

  const { runtime, serviceAdapter } = buildRuntime(selectedModel);

  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: '/api/copilotkit',
  });

  try {
    const res = await handleRequest(req);
    reportModelSuccess(selectedModel);
    return res;
  } catch (err: unknown) {
    const statusCode = (err as { statusCode?: number })?.statusCode;
    const isRateLimit = statusCode === 429;
    const isServerError = statusCode != null && statusCode >= 500;

    if (isRateLimit || isServerError) {
      reportModelError(selectedModel);
      console.warn(
        `[CopilotKit] ${isRateLimit ? '429 Rate limited' : `${statusCode} Server error`} on ${selectedModel} -- recorded for auto-switch`,
      );
    }

    console.error('[CopilotKit] Request failed:', {
      error: err instanceof Error ? err.message : String(err),
      model: selectedModel,
      statusCode,
    });
    throw err;
  }
};
