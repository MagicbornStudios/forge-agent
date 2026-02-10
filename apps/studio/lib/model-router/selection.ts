import type { ModelDef } from './types';
import { getDefaultChatModelId } from './defaults';

type ResolveOptions = {
  requireResponsesV2?: boolean;
};

function pickFallbackModelId(models: ModelDef[], options?: ResolveOptions): string {
  if (models.length === 0) return getDefaultChatModelId();

  if (options?.requireResponsesV2) {
    const responsesV2Model = models.find((model) => model.supportsResponsesV2 === true);
    if (responsesV2Model) return responsesV2Model.id;
  }

  const defaultModelId = getDefaultChatModelId();
  const defaultModel = models.find((model) => model.id === defaultModelId);
  if (defaultModel) return defaultModel.id;

  const freeModel = models.find((model) => model.tier === 'free');
  if (freeModel) return freeModel.id;

  return models[0].id;
}

/**
 * If modelId is missing from the current registry, return a deterministic fallback.
 */
export function resolveModelIdFromRegistry(
  modelId: string,
  models: ModelDef[],
  options?: ResolveOptions,
): string {
  if (!modelId) return pickFallbackModelId(models, options);
  if (models.length === 0) return modelId;
  if (models.some((model) => model.id === modelId)) return modelId;
  return pickFallbackModelId(models, options);
}
