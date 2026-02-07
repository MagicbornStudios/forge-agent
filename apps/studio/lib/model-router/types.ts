/**
 * Model router types.
 *
 * Defines the model registry, selection modes, and preferences
 * for OpenRouter model selection with fallbacks.
 */

// ---------------------------------------------------------------------------
// Model definition
// ---------------------------------------------------------------------------

export type ModelTier = 'free' | 'paid';
export type ModelSpeed = 'fast' | 'standard' | 'reasoning';

export interface ModelDef {
  /** OpenRouter model ID (e.g. `'openai/gpt-4o-mini'`). */
  id: string;
  /** Human-readable label. */
  label: string;
  /** Short description. */
  description?: string;
  tier: ModelTier;
  speed: ModelSpeed;
  /** Cost per million input tokens (0 for free). */
  costPerMInput?: number;
  /** Cost per million output tokens (0 for free). */
  costPerMOutput?: number;
  /** Whether this model supports tool use / function calling. */
  supportsTools: boolean;
  /** Whether this model is enabled by default. */
  enabledByDefault: boolean;
  /** Whether this model supports image generation (output_modalities includes "image"). Image gen uses OPENROUTER_IMAGE_MODEL in /api/image-generate. */
  supportsImages?: boolean;
}

// ---------------------------------------------------------------------------
// Selection
// ---------------------------------------------------------------------------

export type SelectionMode = 'auto' | 'manual';

/** Persisted user preferences for model selection. */
export interface ModelPreferences {
  mode: SelectionMode;
  /** When mode is `'manual'`, this is the user's chosen model ID. */
  manualModelId: string | null;
  /** Model IDs for auto mode: first = primary, rest = fallback chain. */
  enabledModelIds: string[];
}

/** Resolved primary model and fallback list (for OpenRouter models array). */
export interface PrimaryAndFallbacks {
  primary: string;
  fallbacks: string[];
}

// ---------------------------------------------------------------------------
// API types (client ↔ server)
// ---------------------------------------------------------------------------

/** Sent from client to server via header/cookie/param. */
export interface ModelSelectionRequest {
  mode: SelectionMode;
  manualModelId: string | null;
  enabledModelIds: string[];
}

/** Returned by the server settings endpoint. */
export interface ModelSettingsResponse {
  activeModelId: string;
  mode: SelectionMode;
  registry: ModelDef[];
  preferences: ModelPreferences;
  /** Primary model ID (same as activeModelId). */
  primaryId: string;
  /** Fallback model IDs in order (empty in manual mode). */
  fallbackIds: string[];
}
