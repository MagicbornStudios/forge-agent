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
  resolveModel?: (req: Request) => string | null | undefined;
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
  } = options;

  if (!apiKey) {
    throw new Error('OpenRouter API key is required. Set OPENROUTER_API_KEY.');
  }

  const openRouterHeaders = {
    'HTTP-Referer': headers?.['HTTP-Referer'] ?? process.env.NEXT_PUBLIC_APP_URL ?? '',
    'X-Title': headers?.['X-Title'] ?? 'Forge App',
    ...headers,
  };

  return async function handleRequest(req: Request) {
    const resolved = resolveModel ? resolveModel(req) : null;
    const selectedModel = resolved ?? modelId;

    if (!selectedModel) {
      throw new Error('modelId is required when resolveModel does not return a model.');
    }

    const openaiClient = new OpenAI({
      apiKey,
      baseURL: baseUrl,
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
