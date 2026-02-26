import 'server-only';

import { listCodexModels, type CodexModelEntry } from '@/lib/codex-session';

export type AssistantRuntime = 'forge' | 'codex';

export type RepoAssistantModelOption = {
  id: string;
  label: string;
  provider?: string;
  description?: string;
  tier?: 'free' | 'paid';
  supportsTools?: boolean;
  supportsImages?: boolean;
  supportsResponsesV2?: boolean;
};

type OpenRouterModelRow = {
  id: string;
  name?: string;
  description?: string | null;
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
};

export class ForgeModelCatalogUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ForgeModelCatalogUnavailableError';
  }
}

let forgeCatalogCache: {
  updatedAt: number;
  models: RepoAssistantModelOption[];
} | null = null;

function parsePrice(value: string | number | undefined | null): number {
  if (value == null) return 0;
  if (typeof value === 'number') return value;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function providerFromModelId(modelId: string) {
  const value = String(modelId || '').trim();
  const index = value.indexOf('/');
  if (index <= 0) return '';
  return value.slice(0, index);
}

function supportsImages(row: OpenRouterModelRow) {
  const modalities = [
    row.architecture?.modality || '',
    ...(Array.isArray(row.architecture?.input_modalities) ? row.architecture.input_modalities : []),
    ...(Array.isArray(row.architecture?.output_modalities) ? row.architecture.output_modalities : []),
  ]
    .join(' ')
    .toLowerCase();
  return modalities.includes('image');
}

function supportsResponsesV2(modelId: string) {
  const normalized = String(modelId || '').toLowerCase();
  if (normalized.startsWith('google/')) return false;
  if (normalized.startsWith('anthropic/')) return false;
  return true;
}

function normalizeForgeModel(row: OpenRouterModelRow): RepoAssistantModelOption | null {
  const id = String(row.id || '').trim();
  if (!id) return null;
  const provider = providerFromModelId(id);
  const promptCost = parsePrice(row.pricing?.prompt);
  const completionCost = parsePrice(row.pricing?.completion);
  return {
    id,
    label: String(row.name || id.split('/').pop() || id).trim() || id,
    provider: provider || undefined,
    description: row.description ? String(row.description) : undefined,
    tier: promptCost === 0 && completionCost === 0 ? 'free' : 'paid',
    supportsTools: Array.isArray(row.supported_parameters) && row.supported_parameters.includes('tools'),
    supportsImages: supportsImages(row),
    supportsResponsesV2: supportsResponsesV2(id),
  };
}

function sortModels(models: RepoAssistantModelOption[]) {
  return [...models].sort((a, b) => {
    const aTier = a.tier === 'free' ? 0 : 1;
    const bTier = b.tier === 'free' ? 0 : 1;
    if (aTier !== bTier) return aTier - bTier;
    return String(a.label || a.id).localeCompare(String(b.label || b.id));
  });
}

async function fetchOpenRouterModels(): Promise<RepoAssistantModelOption[]> {
  const apiKey = String(process.env.OPENROUTER_API_KEY || '').trim();
  if (!apiKey) {
    throw new ForgeModelCatalogUnavailableError('OPENROUTER_API_KEY is not configured.');
  }
  const baseUrl = String(process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1').trim();
  const timeoutMs = Number.parseInt(String(process.env.OPENROUTER_TIMEOUT_MS || '30000'), 10);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Number.isFinite(timeoutMs) ? timeoutMs : 30000);
  try {
    const response = await fetch(`${baseUrl}/models`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
      next: { revalidate: 300 },
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new ForgeModelCatalogUnavailableError([
        `OpenRouter model catalog request failed (${response.status}).`,
        detail ? detail.slice(0, 280) : '',
      ].filter(Boolean).join(' '));
    }
    const body = await response.json() as { data?: OpenRouterModelRow[] };
    const data = Array.isArray(body.data) ? body.data : [];
    const normalized = data
      .map(normalizeForgeModel)
      .filter(Boolean) as RepoAssistantModelOption[];
    if (normalized.length === 0) {
      throw new ForgeModelCatalogUnavailableError('OpenRouter model catalog returned no usable models.');
    }
    return sortModels(normalized);
  } catch (error: any) {
    if (error instanceof ForgeModelCatalogUnavailableError) throw error;
    if (error?.name === 'AbortError') {
      throw new ForgeModelCatalogUnavailableError(`OpenRouter model catalog timed out after ${timeoutMs}ms.`);
    }
    throw new ForgeModelCatalogUnavailableError(
      String(error?.message || error || 'OpenRouter model catalog request failed.'),
    );
  } finally {
    clearTimeout(timer);
  }
}

export async function getForgeModelCatalog() {
  const now = Date.now();
  if (forgeCatalogCache && now - forgeCatalogCache.updatedAt < 5 * 60 * 1000) {
    return {
      ok: true,
      models: forgeCatalogCache.models,
      warning: '',
      source: 'cache',
    };
  }
  try {
    const models = await fetchOpenRouterModels();
    forgeCatalogCache = {
      updatedAt: now,
      models,
    };
    return {
      ok: true,
      models,
      warning: '',
      source: 'openrouter',
    };
  } catch (error: any) {
    const message = String(error?.message || error || 'Unable to load OpenRouter model catalog.');
    return {
      ok: false,
      models: [],
      warning: message,
      source: 'error',
    };
  }
}

function normalizeCodexModelToOption(entry: CodexModelEntry): RepoAssistantModelOption {
  return {
    id: entry.id,
    label: entry.label || entry.id,
    provider: entry.provider,
    tier: entry.tier || 'paid',
    supportsTools: entry.supportsTools === true,
    supportsImages: entry.supportsImages === true,
    supportsResponsesV2: entry.supportsResponsesV2 !== false,
  };
}

export async function getCodexModelCatalog() {
  const result = await listCodexModels();
  const models = Array.isArray(result.models)
    ? result.models.map(normalizeCodexModelToOption)
    : [];
  return {
    ok: result.ok === true,
    models: models.length > 0 ? models : [{
      id: 'gpt-5',
      label: 'gpt-5',
      tier: 'paid',
      supportsTools: false,
      supportsImages: false,
      supportsResponsesV2: true,
    }],
    warning: String(result.warning || ''),
    source: result.cacheUsed ? 'cache' : 'codex',
  };
}
