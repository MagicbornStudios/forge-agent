import type { ModelDef, ModelHealth } from './types';

/**
 * Cooldown configuration for the auto-switch algorithm.
 *
 * After N consecutive errors, the model enters cooldown for
 * an exponentially increasing duration.
 */
const BASE_COOLDOWN_MS = 15_000; // 15 seconds
const MAX_COOLDOWN_MS = 5 * 60_000; // 5 minutes
const COOLDOWN_BACKOFF = 2;
const ERROR_THRESHOLD = 1; // cooldown after 1st error (aggressive)

/** Create a fresh health record for a model. */
export function createHealth(modelId: string): ModelHealth {
  return {
    modelId,
    errorCount: 0,
    lastErrorAt: null,
    cooldownUntil: null,
    lastSuccessAt: null,
  };
}

/** Whether a model is currently in cooldown. */
export function isInCooldown(health: ModelHealth, now: number = Date.now()): boolean {
  return health.cooldownUntil != null && now < health.cooldownUntil;
}

/** Compute cooldown duration from error count (exponential backoff). */
function cooldownMs(errorCount: number): number {
  const ms = BASE_COOLDOWN_MS * Math.pow(COOLDOWN_BACKOFF, Math.max(0, errorCount - 1));
  return Math.min(ms, MAX_COOLDOWN_MS);
}

/**
 * Record a 429/5xx error for a model. Returns updated health.
 * After ERROR_THRESHOLD consecutive errors, enters cooldown.
 */
export function recordError(health: ModelHealth): ModelHealth {
  const now = Date.now();
  const errorCount = health.errorCount + 1;
  const cooldownUntil =
    errorCount >= ERROR_THRESHOLD ? now + cooldownMs(errorCount) : health.cooldownUntil;

  return {
    ...health,
    errorCount,
    lastErrorAt: now,
    cooldownUntil,
  };
}

/** Record a successful request. Resets error count and cooldown. */
export function recordSuccess(health: ModelHealth): ModelHealth {
  return {
    ...health,
    errorCount: 0,
    lastErrorAt: null,
    cooldownUntil: null,
    lastSuccessAt: Date.now(),
  };
}

/**
 * Auto-select the best available model.
 *
 * Algorithm (inspired by Cursor "auto" mode):
 * 1. Filter to enabled models with tool support
 * 2. Exclude models in cooldown
 * 3. Sort by: free before paid, then by registry order (preference)
 * 4. Return the first eligible model
 * 5. If ALL models are in cooldown, return the one whose cooldown expires soonest
 */
export function autoSelectModel(
  registry: ModelDef[],
  enabledIds: string[],
  healthMap: Record<string, ModelHealth>,
  now: number = Date.now(),
): ModelDef | null {
  // Step 1: filter to enabled + tool-capable
  const candidates = registry.filter(
    (m) => enabledIds.includes(m.id) && m.supportsTools,
  );

  if (candidates.length === 0) return null;

  // Step 2: partition into available vs in-cooldown
  const available: ModelDef[] = [];
  const inCooldown: { model: ModelDef; expiresAt: number }[] = [];

  for (const model of candidates) {
    const health = healthMap[model.id];
    if (health && isInCooldown(health, now)) {
      inCooldown.push({ model, expiresAt: health.cooldownUntil! });
    } else {
      available.push(model);
    }
  }

  // Step 3: if we have available models, pick the best one
  // Registry order is already preference-ordered, so first available wins
  if (available.length > 0) {
    // Prefer free models first
    const freeFirst = available.sort((a, b) => {
      if (a.tier === 'free' && b.tier !== 'free') return -1;
      if (a.tier !== 'free' && b.tier === 'free') return 1;
      return 0; // preserve registry order within same tier
    });
    return freeFirst[0];
  }

  // Step 5: all in cooldown, pick the one expiring soonest
  if (inCooldown.length > 0) {
    inCooldown.sort((a, b) => a.expiresAt - b.expiresAt);
    return inCooldown[0].model;
  }

  return null;
}
