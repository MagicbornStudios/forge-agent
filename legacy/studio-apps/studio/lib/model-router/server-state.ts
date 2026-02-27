import 'server-only';

import { getLogger } from '@/lib/logger';
import type { ModelProviderId } from './types';
import { getDefaultChatModelId } from './defaults';

const log = getLogger('model-router');

/**
 * Server-side model selection (two slots: copilot, assistantUi).
 * In production this would be backed by Redis/KV. For the PoC we use in-memory state (reset on server restart).
 */
let copilotModelId = getDefaultChatModelId();
let assistantUiModelId = getDefaultChatModelId();

export function getModelIds(): { copilotModelId: string; assistantUiModelId: string } {
  return { copilotModelId, assistantUiModelId };
}

export function setModelId(provider: ModelProviderId, modelId: string): void {
  if (provider === 'copilot') {
    copilotModelId = modelId;
    log.info({ copilotModelId: modelId }, 'Copilot model updated');
  } else {
    assistantUiModelId = modelId;
    log.info({ assistantUiModelId: modelId }, 'Assistant UI model updated');
  }
}

export function getCopilotModelId(): string {
  return copilotModelId;
}

export function getAssistantUiModelId(): string {
  return assistantUiModelId;
}
