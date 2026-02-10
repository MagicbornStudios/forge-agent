import type { ModelIds, ModelProviderId, ModelSettingsResponse } from '@/lib/model-router/types';

async function readJsonOrThrow(res: Response): Promise<any> {
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    const message =
      typeof payload?.error === 'string' && payload.error.trim().length > 0
        ? payload.error
        : `${res.status} ${res.statusText}`;
    throw new Error(message);
  }
  return res.json();
}

export async function getModelSettings(): Promise<ModelSettingsResponse> {
  const res = await fetch('/api/model-settings', {
    method: 'GET',
    credentials: 'include',
  });
  const data = await readJsonOrThrow(res);
  return {
    registry: Array.isArray(data?.registry) ? data.registry : [],
    copilotModelId:
      typeof data?.copilotModelId === 'string' ? data.copilotModelId : '',
    assistantUiModelId:
      typeof data?.assistantUiModelId === 'string' ? data.assistantUiModelId : '',
  };
}

export async function setModelSettingsModelId(
  provider: ModelProviderId,
  modelId: string,
): Promise<ModelIds> {
  const res = await fetch('/api/model-settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ provider, modelId }),
  });
  const data = await readJsonOrThrow(res);
  return {
    copilotModelId:
      typeof data?.copilotModelId === 'string' ? data.copilotModelId : '',
    assistantUiModelId:
      typeof data?.assistantUiModelId === 'string' ? data.assistantUiModelId : '',
  };
}
