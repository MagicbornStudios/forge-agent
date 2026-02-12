'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createEnterpriseRequest,
  fetchAiUsageSeries,
  fetchAiUsageSummary,
  fetchApiKeys,
  fetchEnterpriseRequests,
  fetchLicenses,
  fetchMyListings,
  fetchMyProjects,
  fetchRevenueSummary,
  fetchStorageBreakdown,
  fetchStorageSummary,
} from '@/lib/api/studio';
import { PLATFORM_QUERY_KEYS } from '@/lib/constants/query-keys';

export function useCreatorListings(orgId: number | null, enabled = true) {
  return useQuery({
    queryKey: PLATFORM_QUERY_KEYS.listings(orgId),
    queryFn: () => fetchMyListings(orgId ?? undefined),
    enabled,
  });
}

export function useCreatorProjects(orgId: number | null, enabled = true) {
  return useQuery({
    queryKey: PLATFORM_QUERY_KEYS.projects(orgId),
    queryFn: () => fetchMyProjects(orgId ?? undefined),
    enabled,
  });
}

export function useRevenueSummary(orgId: number | null, enabled = true) {
  return useQuery({
    queryKey: PLATFORM_QUERY_KEYS.revenue(orgId),
    queryFn: () => fetchRevenueSummary(orgId ?? undefined),
    enabled,
  });
}

export function useLicenses(orgId: number | null, enabled = true) {
  return useQuery({
    queryKey: PLATFORM_QUERY_KEYS.licenses(orgId),
    queryFn: () => fetchLicenses(orgId ?? undefined),
    enabled,
  });
}

export function useApiKeys(orgId: number | null, enabled = true) {
  return useQuery({
    queryKey: PLATFORM_QUERY_KEYS.apiKeys(orgId),
    queryFn: () => fetchApiKeys(orgId ?? undefined),
    enabled,
  });
}

export function useAiUsageSummary(
  orgId: number | null,
  range: '7d' | '30d' | '90d',
  enabled = true,
) {
  return useQuery({
    queryKey: PLATFORM_QUERY_KEYS.aiUsageSummary(orgId, range),
    queryFn: () => fetchAiUsageSummary({ orgId: orgId ?? undefined, range }),
    enabled,
  });
}

export function useAiUsageSeries(
  orgId: number | null,
  range: '7d' | '30d' | '90d',
  enabled = true,
) {
  return useQuery({
    queryKey: PLATFORM_QUERY_KEYS.aiUsageSeries(orgId, range),
    queryFn: () => fetchAiUsageSeries({ orgId: orgId ?? undefined, range }),
    enabled,
  });
}

export function useStorageSummary(orgId: number | null, enabled = true) {
  return useQuery({
    queryKey: PLATFORM_QUERY_KEYS.storageSummary(orgId),
    queryFn: () => fetchStorageSummary(orgId ?? undefined),
    enabled,
  });
}

export function useStorageBreakdown(
  orgId: number | null,
  groupBy: 'org' | 'user' | 'project',
  enabled = true,
) {
  return useQuery({
    queryKey: PLATFORM_QUERY_KEYS.storageBreakdown(orgId, groupBy),
    queryFn: () =>
      fetchStorageBreakdown({ orgId: orgId ?? undefined, groupBy }),
    enabled,
  });
}

export function useEnterpriseRequests(orgId: number | null, enabled = true) {
  return useQuery({
    queryKey: PLATFORM_QUERY_KEYS.enterpriseRequests(orgId),
    queryFn: () => fetchEnterpriseRequests(orgId ?? undefined),
    enabled,
  });
}

export function useCreateEnterpriseRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { type: 'source_access' | 'premium_support' | 'custom_editor'; notes?: string; orgId?: number | null }) =>
      createEnterpriseRequest(input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: PLATFORM_QUERY_KEYS.enterpriseRequests(variables.orgId ?? null),
      });
    },
  });
}
