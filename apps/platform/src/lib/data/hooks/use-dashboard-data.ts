'use client';

import { useQuery } from '@tanstack/react-query';
import {
  fetchAiUsageSeries,
  fetchAiUsageSummary,
  fetchApiKeys,
  fetchLicenses,
  fetchMyListings,
  fetchMyProjects,
  fetchRevenueSummary,
} from '@/lib/api/studio';
import { PLATFORM_QUERY_KEYS } from '@/lib/data/keys';

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
    queryFn: () => fetchLicenses(),
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
