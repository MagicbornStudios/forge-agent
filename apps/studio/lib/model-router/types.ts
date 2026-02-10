/**
 * Model router types.
 *
 * Modular naming: copilot and assistantUi. Two slots; no mode/fallbacks.
 */

// ---------------------------------------------------------------------------
// Provider / slot
// ---------------------------------------------------------------------------

export type ModelProviderId = 'copilot' | 'assistantUi';

// ---------------------------------------------------------------------------
// Model definition
// ---------------------------------------------------------------------------

export type ModelTier = 'free' | 'paid';
export type ModelSpeed = 'fast' | 'standard' | 'reasoning';

export interface ModelDef {
  /** OpenRouter model ID (e.g. `'openai/gpt-4o-mini'`). */
  id: string;
  /** Provider inferred from model id prefix (e.g. `openai`, `google`, `anthropic`). */
  provider?: string;
  /** Human-readable label. */
  label: string;
  /** Short description. */
  description?: string;
  /** Max context window if provided by OpenRouter metadata. */
  contextLength?: number;
  tier: ModelTier;
  speed: ModelSpeed;
  /** Cost per million input tokens (0 for free). */
  costPerMInput?: number;
  /** Cost per million output tokens (0 for free). */
  costPerMOutput?: number;
  /** Whether this model supports tool use / function calling. */
  supportsTools: boolean;
  /** Responses API v2 compatibility (needed for CopilotKit BuiltInAgent). */
  supportsResponsesV2?: boolean | null;
  /** Whether this model is enabled by default. */
  enabledByDefault: boolean;
  /** Whether this model supports image generation. */
  supportsImages?: boolean;
}

// ---------------------------------------------------------------------------
// Server state (two slots)
// ---------------------------------------------------------------------------

export interface ModelIds {
  copilotModelId: string;
  assistantUiModelId: string;
}

// ---------------------------------------------------------------------------
// API types (client ↔ server)
// ---------------------------------------------------------------------------

/** POST body to set model for a provider. */
export interface ModelSettingsPostBody {
  provider: ModelProviderId;
  modelId: string;
}

/** GET response from /api/model-settings. */
export interface ModelSettingsResponse {
  registry: ModelDef[];
  copilotModelId: string;
  assistantUiModelId: string;
}
