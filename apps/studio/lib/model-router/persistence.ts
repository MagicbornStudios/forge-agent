import 'server-only';

import { getPayload } from 'payload';
import type { Where } from 'payload';
import config from '@/payload.config';
import { getLogger } from '@/lib/logger';
import { getDefaultChatModelId, isLegacyUnavailableModelId } from './defaults';
import type { ModelIds, ModelProviderId } from './types';

const log = getLogger('model-router-persistence');

const MODEL_SETTINGS_KEYS: Record<ModelProviderId, string> = {
  copilot: 'ai.model.copilot',
  assistantUi: 'ai.model.assistantUi',
};

const CACHE_TTL_MS = 60 * 1000;
const modelIdsCache = new Map<string, { at: number; modelIds: ModelIds }>();

type UserId = number | null;

function getCacheKey(userId: UserId): string {
  return userId == null ? 'anon' : `user:${String(userId)}`;
}

function isCacheFresh(entry?: { at: number }): boolean {
  if (!entry) return false;
  return Date.now() - entry.at < CACHE_TTL_MS;
}

function toSettingsObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
}

function readModelIds(settings: Record<string, unknown>): ModelIds {
  const copilotModelIdRaw = settings[MODEL_SETTINGS_KEYS.copilot];
  const assistantUiModelIdRaw = settings[MODEL_SETTINGS_KEYS.assistantUi];
  const defaultModelId = getDefaultChatModelId();

  const normalizeStoredModelId = (value: unknown): string => {
    if (typeof value !== 'string') return defaultModelId;
    const modelId = value.trim();
    if (!modelId) return defaultModelId;
    if (isLegacyUnavailableModelId(modelId)) return defaultModelId;
    return modelId;
  };

  return {
    copilotModelId: normalizeStoredModelId(copilotModelIdRaw),
    assistantUiModelId: normalizeStoredModelId(assistantUiModelIdRaw),
  };
}

async function resolvePayloadAndUserId(request: Request): Promise<{
  payload: Awaited<ReturnType<typeof getPayload>>;
  userId: UserId;
}> {
  const payload = await getPayload({ config });
  const authResult = await payload.auth({
    headers: request.headers,
    canSetHeaders: false,
  });
  const userId = typeof authResult.user?.id === 'number' ? authResult.user.id : null;
  return { payload, userId };
}

async function findAppSettingsDoc(
  payload: Awaited<ReturnType<typeof getPayload>>,
  userId: UserId,
): Promise<{ id: number | string; settings: Record<string, unknown> } | null> {
  let where: Where;
  if (userId == null) {
    where = {
      and: [
        { scope: { equals: 'app' } },
        { scopeId: { equals: null } },
        { user: { equals: null } },
      ],
    };
  } else {
    where = {
      and: [
        { scope: { equals: 'app' } },
        { scopeId: { equals: null } },
        { user: { equals: userId } },
      ],
    };
  }

  const existing = await payload.find({
    collection: 'settings-overrides',
    where,
    limit: 1,
  });

  if (!existing.docs.length) return null;

  const first = existing.docs[0] as { id: number | string; settings?: unknown };
  return {
    id: first.id,
    settings: toSettingsObject(first.settings),
  };
}

export async function getPersistedModelIds(request: Request): Promise<ModelIds> {
  const { payload, userId } = await resolvePayloadAndUserId(request);
  const cacheKey = getCacheKey(userId);
  const cached = modelIdsCache.get(cacheKey);
  if (isCacheFresh(cached)) {
    return cached!.modelIds;
  }

  const appSettingsDoc = await findAppSettingsDoc(payload, userId);
  const modelIds = readModelIds(appSettingsDoc?.settings ?? {});

  modelIdsCache.set(cacheKey, { at: Date.now(), modelIds });
  return modelIds;
}

export async function getPersistedModelIdForProvider(
  request: Request,
  provider: ModelProviderId,
): Promise<string> {
  const modelIds = await getPersistedModelIds(request);
  return provider === 'copilot' ? modelIds.copilotModelId : modelIds.assistantUiModelId;
}

export async function setPersistedModelId(
  request: Request,
  provider: ModelProviderId,
  modelId: string,
): Promise<ModelIds> {
  const { payload, userId } = await resolvePayloadAndUserId(request);
  const cacheKey = getCacheKey(userId);

  const existing = await findAppSettingsDoc(payload, userId);
  const nextSettings = {
    ...(existing?.settings ?? {}),
    [MODEL_SETTINGS_KEYS[provider]]: modelId,
  };

  if (existing) {
    await payload.update({
      collection: 'settings-overrides',
      id: existing.id,
      data: {
        settings: nextSettings,
        user: userId,
      },
    });
  } else {
    await payload.create({
      collection: 'settings-overrides',
      data: {
        scope: 'app',
        scopeId: null,
        settings: nextSettings,
        user: userId,
      },
    });
  }

  const modelIds = readModelIds(nextSettings);
  modelIdsCache.set(cacheKey, { at: Date.now(), modelIds });
  log.info({ provider, modelId, userId }, 'Persisted model setting');
  return modelIds;
}

export function clearModelRouterPersistenceCache(): void {
  modelIdsCache.clear();
}
