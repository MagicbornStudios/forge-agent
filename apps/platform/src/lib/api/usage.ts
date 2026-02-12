import { requestJson } from './client';
import type {
  AiUsageRange,
  AiUsageSeriesResponse,
  AiUsageSummaryResponse,
  EnterpriseRequest,
  EnterpriseRequestListResponse,
  EnterpriseRequestType,
  StorageBreakdownResponse,
  StorageSummaryResponse,
} from './types';

export async function fetchAiUsageSeries(
  options?: { orgId?: number | null; range?: AiUsageRange },
  credentials: RequestCredentials = 'include',
): Promise<AiUsageSeriesResponse> {
  return requestJson<AiUsageSeriesResponse>({
    path: '/api/me/ai-usage',
    query: {
      range: options?.range,
      orgId: options?.orgId ?? undefined,
    },
    credentials,
  });
}

export async function fetchAiUsageSummary(
  options?: { orgId?: number | null; range?: AiUsageRange },
  credentials: RequestCredentials = 'include',
): Promise<AiUsageSummaryResponse> {
  return requestJson<AiUsageSummaryResponse>({
    path: '/api/me/ai-usage/summary',
    query: {
      range: options?.range,
      orgId: options?.orgId ?? undefined,
    },
    credentials,
  });
}

export async function fetchStorageSummary(
  orgId?: number | null,
  credentials: RequestCredentials = 'include',
): Promise<StorageSummaryResponse> {
  return requestJson<StorageSummaryResponse>({
    path: '/api/me/storage/summary',
    query: { orgId: orgId ?? undefined },
    credentials,
  });
}

export async function fetchStorageBreakdown(
  options?: {
    orgId?: number | null;
    groupBy?: 'org' | 'user' | 'project';
  },
  credentials: RequestCredentials = 'include',
): Promise<StorageBreakdownResponse> {
  return requestJson<StorageBreakdownResponse>({
    path: '/api/me/storage/breakdown',
    query: {
      orgId: options?.orgId ?? undefined,
      groupBy: options?.groupBy,
    },
    credentials,
  });
}

export async function createStorageUpgradeCheckoutSession(
  options?: {
    orgId?: number | null;
    successUrl?: string;
    cancelUrl?: string;
  },
  credentials: RequestCredentials = 'include',
): Promise<{ activeOrganizationId: number; url: string | null }> {
  return requestJson<{ activeOrganizationId: number; url: string | null }>({
    path: '/api/me/storage/upgrade-checkout-session',
    method: 'POST',
    body: options ?? {},
    credentials,
  });
}

export async function fetchEnterpriseRequests(
  orgId?: number | null,
  credentials: RequestCredentials = 'include',
): Promise<EnterpriseRequestListResponse> {
  return requestJson<EnterpriseRequestListResponse>({
    path: '/api/me/enterprise/requests',
    query: { orgId: orgId ?? undefined },
    credentials,
  });
}

export async function createEnterpriseRequest(
  input: {
    type: EnterpriseRequestType;
    notes?: string;
    orgId?: number | null;
  },
  credentials: RequestCredentials = 'include',
): Promise<{ activeOrganizationId: number; request: EnterpriseRequest }> {
  return requestJson<{ activeOrganizationId: number; request: EnterpriseRequest }>({
    path: '/api/me/enterprise/requests',
    method: 'POST',
    body: input,
    credentials,
  });
}
