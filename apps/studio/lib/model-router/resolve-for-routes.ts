/**
 * Model resolution for API routes (testable in isolation).
 * Used by CopilotKit handler and assistant-chat route.
 */

import type { PrimaryAndFallbacks } from './types';

export type GetPrimaryAndFallbacks = () => PrimaryAndFallbacks & { mode: string };

/**
 * Resolve model and fallbacks for CopilotKit (POST /api/copilotkit).
 * When x-forge-model is set (and not empty/auto), use that model and no fallbacks.
 * Otherwise use server-state primary + fallbacks.
 */
export function resolveCopilotKitModel(
  req: Request,
  getPrimaryAndFallbacks: GetPrimaryAndFallbacks,
): { modelId: string; fallbacks: string[] } {
  const { primary, fallbacks } = getPrimaryAndFallbacks();
  const requested = req.headers.get('x-forge-model');
  if (requested && requested.trim() !== '' && requested.trim() !== 'auto') {
    return { modelId: requested.trim(), fallbacks: [] };
  }
  return { modelId: primary, fallbacks };
}

/**
 * Extract requested model from assistant-chat body.config (config.modelName).
 */
export function getRequestedModelFromAssistantChatBody(configOverride: unknown): string | null {
  if (!configOverride || typeof configOverride !== 'object') return null;
  const modelName = (configOverride as { modelName?: unknown }).modelName;
  if (typeof modelName !== 'string') return null;
  const trimmed = modelName.trim();
  if (!trimmed || trimmed === 'auto') return null;
  return trimmed;
}

/**
 * Resolve primary and fallbacks for assistant-chat (POST /api/assistant-chat).
 * When body.config.modelName is set, use that model and no fallbacks.
 * Otherwise use server-state primary + fallbacks.
 */
export function resolveAssistantChatModel(
  body: { config?: unknown },
  getPrimaryAndFallbacks: GetPrimaryAndFallbacks,
): { primary: string; fallbacks: string[] } {
  const requested = getRequestedModelFromAssistantChatBody(body.config);
  const { primary, fallbacks } = getPrimaryAndFallbacks();
  const selectedPrimary = requested ?? primary;
  const selectedFallbacks = requested ? [] : fallbacks;
  return { primary: selectedPrimary, fallbacks: selectedFallbacks };
}
