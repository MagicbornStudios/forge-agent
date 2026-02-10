import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from '@copilotkit/runtime';
import { BuiltInAgent } from '@copilotkit/runtime/v2';
import { createOpenAI } from '@ai-sdk/openai';
import OpenAI from 'openai';

export interface ForgeCopilotRuntimeOptions {
  apiKey: string;
  /** OpenRouter base URL. Defaults to https://openrouter.ai/api/v1 */
  baseUrl?: string;
  /** Default model id when resolveModel is not provided. */
  modelId?: string;
  /** CopilotKit endpoint path. Defaults to /api/copilotkit */
  endpoint?: string;
  /** Optional headers passed to the OpenAI client (e.g. HTTP-Referer / X-Title). */
  headers?: Record<string, string>;
  /** Optional model resolver per request. */
  resolveModel?: (
    req: Request
  ) =>
    | string
    | { modelId: string | null | undefined; fallbacks?: string[] }
    | Promise<string | { modelId: string | null | undefined; fallbacks?: string[] } | null | undefined>
    | null
    | undefined;
  /** Optional fallback chain when using OpenRouter model fallbacks. */
  fallbacks?: string[];
  /** Optional fetch wrapper for fallbacks (injects models array). */
  wrapFetchForFallbacks?: (primary: string, fallbacks: string[]) => typeof fetch;
  /** If true, require Responses v2 compatibility (CopilotKit BuiltInAgent). */
  requireResponsesV2?: boolean;
  /** Fallback model id when the selected model is incompatible. */
  fallbackModelId?: string;
  /** Optional compatibility checker (can be async). */
  isResponsesV2Compatible?: (modelId: string) => boolean | null | Promise<boolean | null>;
}

/**
 * Create a Next.js App Router handler for CopilotKit using OpenRouter via OpenAI SDK + baseURL.
 * CopilotKit requires openai and @ai-sdk/openai interfaces; we do not use @openrouter/ai-sdk-provider.
 */
export function createForgeCopilotRuntime(options: ForgeCopilotRuntimeOptions) {
  const {
    apiKey,
    baseUrl = 'https://openrouter.ai/api/v1',
    modelId,
    endpoint = '/api/copilotkit',
    headers,
    resolveModel,
    fallbacks = [],
    wrapFetchForFallbacks,
    requireResponsesV2 = true,
    fallbackModelId = 'openai/gpt-4o-mini',
    isResponsesV2Compatible,
  } = options;

  if (!apiKey) {
    throw new Error('OpenRouter API key is required. Set OPENROUTER_API_KEY.');
  }

  const openRouterHeaders = {
    'HTTP-Referer': headers?.['HTTP-Referer'] ?? process.env.NEXT_PUBLIC_APP_URL ?? '',
    'X-Title': headers?.['X-Title'] ?? 'Forge App',
    ...headers,
  };

  const isLikelyResponsesV2Compatible = (id: string) => {
    if (!id) return null;
    if (id.startsWith('google/gemini') || id.startsWith('anthropic/claude')) return false;
    if (id.startsWith('openai/')) return true;
    return null;
  };

  return async function handleRequest(req: Request) {
    const resolved = resolveModel ? await resolveModel(req) : null;
    const resolvedModel =
      typeof resolved === 'string' || resolved == null
        ? { modelId: resolved, fallbacks }
        : { modelId: resolved.modelId, fallbacks: resolved.fallbacks ?? fallbacks };

    const candidateModel = resolvedModel.modelId ?? modelId;
    if (!candidateModel) {
      throw new Error('modelId is required when resolveModel does not return a model.');
    }

    let selectedModel = candidateModel;
    let didFallback = false;

    if (requireResponsesV2) {
      const compat =
        (await isResponsesV2Compatible?.(candidateModel)) ??
        isLikelyResponsesV2Compatible(candidateModel);
      if (compat !== true) {
        selectedModel = fallbackModelId;
        didFallback = true;
      }
    }

    if (didFallback && selectedModel !== candidateModel) {
      console.warn(
        `[CopilotKit] Model ${candidateModel} is not responses-v2 compatible. Falling back to ${selectedModel}.`
      );
    }

    let selectedFallbacks = resolvedModel.fallbacks ?? [];

    if (requireResponsesV2 && selectedFallbacks.length > 0) {
      const filtered: string[] = [];
      for (const fallbackId of selectedFallbacks) {
        if (!fallbackId || fallbackId === selectedModel) continue;
        const compat =
          (await isResponsesV2Compatible?.(fallbackId)) ??
          isLikelyResponsesV2Compatible(fallbackId);
        if (compat === true) {
          filtered.push(fallbackId);
        }
      }
      if (filtered.length !== selectedFallbacks.length) {
        console.warn(
          `[CopilotKit] Dropped ${selectedFallbacks.length - filtered.length} incompatible fallback model(s).`,
        );
      }
      selectedFallbacks = filtered;
    } else {
      selectedFallbacks = selectedFallbacks.filter((id) => id && id !== selectedModel);
    }

    const customFetch =
      selectedFallbacks.length > 0 && wrapFetchForFallbacks
        ? wrapFetchForFallbacks(selectedModel, selectedFallbacks)
        : undefined;

    const openaiClient = new OpenAI({
      apiKey,
      baseURL: baseUrl,
      fetch: customFetch,
      defaultHeaders: openRouterHeaders,
    });

    const serviceAdapter = new OpenAIAdapter({
      model: selectedModel,
      openai: openaiClient as any,
    });

    const openRouterAiSdk = createOpenAI({
      apiKey,
      baseURL: baseUrl,
      headers: openRouterHeaders,
      fetch: customFetch,
    });
    const languageModel = openRouterAiSdk(selectedModel);
    const defaultAgent = new BuiltInAgent({ model: languageModel as any });

    const runtime = new CopilotRuntime({
      agents: { default: defaultAgent } as any,
    });

    const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
      runtime,
      serviceAdapter,
      endpoint,
    });

    return handleRequest(req);
  };
}
