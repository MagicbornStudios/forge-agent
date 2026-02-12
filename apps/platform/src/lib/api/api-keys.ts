import { requestJson } from './client';
import type {
  ApiKeyListResponse,
  CreateApiKeyInput,
  CreateApiKeyResponse,
} from './types';

export async function fetchApiKeys(
  orgId?: number | null,
  credentials: RequestCredentials = 'include',
): Promise<ApiKeyListResponse> {
  return requestJson<ApiKeyListResponse>({
    path: '/api/me/api-keys',
    query: { orgId: orgId ?? undefined },
    credentials,
  });
}

export async function createApiKey(
  input: CreateApiKeyInput,
  credentials: RequestCredentials = 'include',
): Promise<CreateApiKeyResponse> {
  return requestJson<CreateApiKeyResponse>({
    path: '/api/me/api-keys',
    method: 'POST',
    body: input,
    credentials,
  });
}

export async function revokeApiKey(
  id: number,
  reason?: string,
  credentials: RequestCredentials = 'include',
): Promise<{ ok: boolean }> {
  await requestJson<unknown>({
    path: `/api/me/api-keys/${id}`,
    method: 'DELETE',
    body: reason ? { reason } : {},
    credentials,
  });
  return { ok: true };
}
