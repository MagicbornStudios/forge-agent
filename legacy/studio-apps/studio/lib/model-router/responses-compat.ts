import 'server-only';

import { getOpenRouterConfig } from '@/lib/openrouter-config';

export const DEFAULT_RESPONSES_V2_FALLBACK_MODEL = 'openai/gpt-4o-mini';

const COMPAT_CACHE_MS = 24 * 60 * 60 * 1000; // 24 hours
const cache = new Map<string, { value: boolean | null; at: number }>();

const INCOMPATIBLE_PREFIXES = ['google/gemini', 'anthropic/claude'];
const COMPATIBLE_PREFIXES = ['openai/'];
const COMPATIBLE_IDS = new Set<string>([
  'openai/gpt-4o',
  'openai/gpt-4o-mini',
  'deepseek/deepseek-chat',
  'meta-llama/llama-3.1-8b-instruct',
  'meta-llama/llama-3.1-70b-instruct',
  'meta-llama/llama-3.3-70b-instruct',
]);

function isCacheFresh(entry?: { value: boolean | null; at: number }) {
  if (!entry) return false;
  return Date.now() - entry.at < COMPAT_CACHE_MS;
}

export function classifyResponsesV2Compatibility(modelId: string): boolean | null {
  if (!modelId) return null;
  if (COMPATIBLE_IDS.has(modelId)) return true;
  if (INCOMPATIBLE_PREFIXES.some((prefix) => modelId.startsWith(prefix))) return false;
  if (COMPATIBLE_PREFIXES.some((prefix) => modelId.startsWith(prefix))) return true;
  return null;
}

export async function probeResponsesV2Compatibility(modelId: string): Promise<boolean | null> {
  const config = getOpenRouterConfig();
  if (!config.apiKey) return null;

  const cached = cache.get(modelId);
  if (isCacheFresh(cached)) return cached?.value ?? null;

  const probeEnabled = process.env.OPENROUTER_RESPONSES_PROBE !== '0';
  if (!probeEnabled) return null;

  try {
    const res = await fetch(`${config.baseUrl}/responses`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelId,
        input: 'ping',
        max_output_tokens: 1,
      }),
    });

    if (res.ok) {
      cache.set(modelId, { value: true, at: Date.now() });
      return true;
    }

    const text = await res.text();
    if (text.includes('Unsupported model version v3') || text.includes('Unsupported model version')) {
      cache.set(modelId, { value: false, at: Date.now() });
      return false;
    }

    return null;
  } catch {
    return null;
  }
}

export async function getResponsesV2Compatibility(
  modelId: string,
  options?: { probe?: boolean },
): Promise<boolean | null> {
  const cached = cache.get(modelId);
  if (isCacheFresh(cached)) return cached?.value ?? null;

  const classified = classifyResponsesV2Compatibility(modelId);
  if (classified !== null) {
    cache.set(modelId, { value: classified, at: Date.now() });
    return classified;
  }

  if (options?.probe) {
    const probed = await probeResponsesV2Compatibility(modelId);
    if (probed !== null) {
      cache.set(modelId, { value: probed, at: Date.now() });
      return probed;
    }
  }

  return null;
}

export async function pickResponsesV2Model(options: {
  primary: string;
  fallbacks?: string[];
  fallbackModelId?: string;
  probe?: boolean;
}): Promise<{
  modelId: string;
  didFallback: boolean;
  checked: Array<{ id: string; compatible: boolean | null }>;
}> {
  const fallbackModelId = options.fallbackModelId ?? DEFAULT_RESPONSES_V2_FALLBACK_MODEL;
  const candidates = [options.primary, ...(options.fallbacks ?? []), fallbackModelId];
  const checked: Array<{ id: string; compatible: boolean | null }> = [];

  for (const candidate of candidates) {
    if (!candidate) continue;
    const compatible = await getResponsesV2Compatibility(candidate, { probe: options.probe });
    checked.push({ id: candidate, compatible });
    if (compatible === true) {
      return { modelId: candidate, didFallback: candidate !== options.primary, checked };
    }
  }

  return { modelId: fallbackModelId, didFallback: true, checked };
}
