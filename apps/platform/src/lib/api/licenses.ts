import { requestJson } from './client';
import type { FetchLicensesResponse, LicenseItem } from './types';

export async function fetchLicenses(
  orgId?: number | null,
  credentials: RequestCredentials = 'include',
): Promise<LicenseItem[]> {
  const data = await requestJson<FetchLicensesResponse>({
    path: '/api/licenses',
    query: { orgId: orgId ?? undefined },
    credentials,
  });
  return data.licenses ?? [];
}

export async function cloneAgain(
  licenseId: number,
  credentials: RequestCredentials = 'include',
): Promise<{ projectId: number }> {
  return requestJson<{ projectId: number }>({
    path: `/api/licenses/${licenseId}/clone`,
    method: 'POST',
    credentials,
    body: {},
  });
}
