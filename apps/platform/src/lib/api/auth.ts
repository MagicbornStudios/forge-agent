import { requestJson, requestNoContent, getStudioApiUrl as getResolvedStudioApiUrl } from './client';
import type { MeResponse } from './types';

export function getStudioApiUrl(): string {
  return getResolvedStudioApiUrl();
}

export async function fetchMe(credentials: RequestCredentials = 'include'): Promise<MeResponse> {
  return requestJson<MeResponse>({
    path: '/api/me',
    credentials,
  });
}

export async function login(email: string, password: string): Promise<{ user: unknown }> {
  return requestJson<{ user: unknown }>({
    path: '/api/users/login',
    method: 'POST',
    credentials: 'include',
    body: { email, password },
  });
}

export async function logout(credentials: RequestCredentials = 'include'): Promise<void> {
  await requestNoContent({
    path: '/api/users/logout',
    method: 'POST',
    credentials,
  });
}
