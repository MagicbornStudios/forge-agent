import 'server-only';

import { getLogger } from '@/lib/logger';
import type { ModelDef } from '@/lib/model-router/types';
import { getOpenRouterConfig } from '@/lib/openrouter-config';
import { DEFAULT_FREE_CHAT_MODEL_IDS } from '@/lib/model-router/defaults';
import { getResponsesV2Compatibility } from '@/lib/model-router/responses-compat';

const log = getLogger('openrouter-models');

/** OpenRouter API model object (subset we use). */
interface OpenRouterModelRow {
  id: string;
  name?: string;
  description?: string | null;
  context_length?: number | null;
  top_provider?: { context_length?: number | null } | null;
  pricing?: {
    prompt?: string | number;
    completion?: string | number;
  } | null;
  architecture?: {
    modality?: string | null;
    input_modalities?: string[] | null;
    output_modalities?: string[] | null;
  } | null;
  supported_parameters?: string[] | null;
}

const CACHE_MS = 5 * 60 * 1000; // 5 minutes
let cached: { at: number; models: ModelDef[] } | null = null;

function parsePrice(p: string | number | undefined | null): number {
  if (p == null) return 0;
  if (typeof p === 'number') return p;
  const n = Number.parseFloat(p);
  return Number.isNaN(n) ? 0 : n;
}

function parseProvider(id: string): string | undefined {
  const trimmed = id.trim();
  if (!trimmed) return undefined;
  const slashIndex = trimmed.indexOf('/');
  if (slashIndex <= 0) return undefined;
  return trimmed.slice(0, slashIndex);
}

function parseContextLength(row: OpenRouterModelRow): number | undefined {
  const raw = row.context_length ?? row.top_provider?.context_length;
  if (typeof raw !== 'number' || !Number.isFinite(raw) || raw <= 0) return undefined;
  return raw;
}

function supportsImages(row: OpenRouterModelRow): boolean {
  const modalities = [
    row.architecture?.modality ?? '',
    ...(Array.isArray(row.architecture?.input_modalities) ? row.architecture?.input_modalities : []),
    ...(Array.isArray(row.architecture?.output_modalities) ? row.architecture?.output_modalities : []),
  ]
    .join(' ')
    .toLowerCase();

  return modalities.includes('image');
}

async function toModelDef(row: OpenRouterModelRow): Promise<ModelDef> {
  const promptCost = parsePrice(row.pricing?.prompt);
  const completionCost = parsePrice(row.pricing?.completion);
  const tier = promptCost === 0 && completionCost === 0 ? 'free' : 'paid';
  const supportsTools =
    Array.isArray(row.supported_parameters) && row.supported_parameters.includes('tools');
  const probeEnabled = process.env.OPENROUTER_RESPONSES_PROBE !== '0';
  const shouldProbe =
    probeEnabled && DEFAULT_FREE_CHAT_MODEL_IDS.includes(row.id);
  const supportsResponsesV2 = await getResponsesV2Compatibility(row.id, { probe: shouldProbe });
  return {
    id: row.id,
    provider: parseProvider(row.id),
    label: row.name ?? row.id.split('/').pop() ?? row.id,
    description: row.description ?? undefined,
    contextLength: parseContextLength(row),
    tier,
    speed: 'standard',
    costPerMInput: promptCost * 1e6,
    costPerMOutput: completionCost * 1e6,
    supportsTools,
    enabledByDefault: false,
    supportsResponsesV2,
    supportsImages: supportsImages(row),
  };
}

/**
 * Fetch models from OpenRouter GET /api/v1/models and map to ModelDef[].
 * Cached for 5 minutes. Used by model-settings to serve the list to ModelSwitcher.
 */
export async function getOpenRouterModels(): Promise<ModelDef[]> {
  const config = getOpenRouterConfig();
  if (!config.apiKey) return [];

  const now = Date.now();
  if (cached && now - cached.at < CACHE_MS) return cached.models;

  try {
    const res = await fetch(`${config.baseUrl}/models`, {
      headers: { Authorization: `Bearer ${config.apiKey}` },
      next: { revalidate: 300 },
    });
    if (!res.ok) {
      log.warn({ status: res.status }, 'OpenRouter models fetch failed');
      return cached?.models ?? [];
    }
    const json = (await res.json()) as { data?: OpenRouterModelRow[] };
    const rows = Array.isArray(json.data) ? json.data : [];
    const models = await Promise.all(rows.map((row) => toModelDef(row)));
    cached = { at: now, models };
    log.debug({ count: models.length }, 'Models fetched');
    return models;
  } catch (err) {
    log.warn({ err: err instanceof Error ? err.message : String(err) }, 'Models fetch error');
    return cached?.models ?? [];
  }
}
