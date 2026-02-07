/** Canonical model router: apps/studio/lib/model-router (registry, server-state, fallbacks). */
import type { ModelDef } from './types';

/**
 * Full model registry (free + paid).
 * Ordered by preference within each tier (first = most preferred).
 */
const FULL_MODEL_REGISTRY: ModelDef[] = [
  // --- Free tier ---
  {
    id: 'google/gemini-2.0-flash-exp:free',
    label: 'Gemini 2.0 Flash',
    description: 'Fast free model from Google with tool support',
    tier: 'free',
    speed: 'fast',
    costPerMInput: 0,
    costPerMOutput: 0,
    supportsTools: true,
    enabledByDefault: true,
  },
  {
    id: 'meta-llama/llama-3.3-70b-instruct:free',
    label: 'Llama 3.3 70B',
    description: 'Meta Llama 3.3 70B with tool support',
    tier: 'free',
    speed: 'fast',
    costPerMInput: 0,
    costPerMOutput: 0,
    supportsTools: true,
    enabledByDefault: true,
  },
  {
    id: 'qwen/qwen-2.5-72b-instruct:free',
    label: 'Qwen 2.5 72B',
    description: 'Alibaba Qwen 2.5 72B Instruct',
    tier: 'free',
    speed: 'fast',
    costPerMInput: 0,
    costPerMOutput: 0,
    supportsTools: true,
    enabledByDefault: true,
  },
  {
    id: 'mistralai/mistral-small-3.1-24b-instruct:free',
    label: 'Mistral Small 3.1',
    description: 'Mistral Small 3.1 24B',
    tier: 'free',
    speed: 'fast',
    costPerMInput: 0,
    costPerMOutput: 0,
    supportsTools: true,
    enabledByDefault: true,
  },
  {
    id: 'deepseek/deepseek-chat-v3-0324:free',
    label: 'DeepSeek V3',
    description: 'DeepSeek Chat V3',
    tier: 'free',
    speed: 'standard',
    costPerMInput: 0,
    costPerMOutput: 0,
    supportsTools: true,
    enabledByDefault: false,
  },

  // --- Paid tier ---
  {
    id: 'openai/gpt-4o-mini',
    label: 'GPT-4o Mini',
    description: 'OpenAI GPT-4o Mini - fast and cheap',
    tier: 'paid',
    speed: 'fast',
    costPerMInput: 0.15,
    costPerMOutput: 0.6,
    supportsTools: true,
    enabledByDefault: false,
  },
  {
    id: 'openai/gpt-4o',
    label: 'GPT-4o',
    description: 'OpenAI GPT-4o - most capable',
    tier: 'paid',
    speed: 'standard',
    costPerMInput: 2.5,
    costPerMOutput: 10,
    supportsTools: true,
    enabledByDefault: false,
  },
  {
    id: 'anthropic/claude-3.5-sonnet',
    label: 'Claude 3.5 Sonnet',
    description: 'Anthropic Claude 3.5 Sonnet via OpenRouter',
    tier: 'paid',
    speed: 'standard',
    costPerMInput: 3,
    costPerMOutput: 15,
    supportsTools: true,
    enabledByDefault: false,
  },
  {
    id: 'google/gemini-2.0-flash-001',
    label: 'Gemini 2.0 Flash (Paid)',
    description: 'Google Gemini 2.0 Flash - paid tier, higher limits',
    tier: 'paid',
    speed: 'fast',
    costPerMInput: 0.1,
    costPerMOutput: 0.4,
    supportsTools: true,
    enabledByDefault: false,
  },
];

/** Free-tier models only (for FREE_ONLY mode). */
export const FREE_MODEL_REGISTRY: ModelDef[] = FULL_MODEL_REGISTRY.filter(
  (m) => m.tier === 'free',
);

/**
 * When true, the app uses only free models (FREE_MODEL_REGISTRY).
 * Set to false to allow paid models (e.g. via env in future).
 */
export const FREE_ONLY = true;

/**
 * Registry used by the app: free-only by default, full when FREE_ONLY is false.
 */
export const MODEL_REGISTRY: ModelDef[] = FREE_ONLY ? FREE_MODEL_REGISTRY : FULL_MODEL_REGISTRY;

/** Get free models only (for UI or tests). */
export function getFreeModels(): ModelDef[] {
  return FREE_MODEL_REGISTRY;
}

/** Get a model def by ID. */
export function getModelDef(id: string): ModelDef | undefined {
  return MODEL_REGISTRY.find((m) => m.id === id);
}

/** Get all models with tool support. */
export function getToolCapableModels(): ModelDef[] {
  return MODEL_REGISTRY.filter((m) => m.supportsTools);
}

/** Default enabled model IDs (from app registry). */
export function getDefaultEnabledIds(): string[] {
  return MODEL_REGISTRY.filter((m) => m.enabledByDefault).map((m) => m.id);
}
