export const PLATFORM_QUERY_KEY_ROOT = ['platform'] as const;

export type AiUsageRange = '7d' | '30d' | '90d';
export type StorageBreakdownGroupBy = 'org' | 'user' | 'project';

export const PLATFORM_QUERY_KEYS = {
  root: () => PLATFORM_QUERY_KEY_ROOT,
  listings: (orgId: number | null) =>
    [...PLATFORM_QUERY_KEY_ROOT, 'listings', orgId ?? 'none'] as const,
  projects: (orgId: number | null) =>
    [...PLATFORM_QUERY_KEY_ROOT, 'projects', orgId ?? 'none'] as const,
  revenue: (orgId: number | null) =>
    [...PLATFORM_QUERY_KEY_ROOT, 'revenue', orgId ?? 'none'] as const,
  licenses: (orgId: number | null) =>
    [...PLATFORM_QUERY_KEY_ROOT, 'licenses', orgId ?? 'none'] as const,
  apiKeys: (orgId: number | null) =>
    [...PLATFORM_QUERY_KEY_ROOT, 'api-keys', orgId ?? 'none'] as const,
  aiUsageSeries: (orgId: number | null, range: AiUsageRange) =>
    [...PLATFORM_QUERY_KEY_ROOT, 'ai-usage-series', orgId ?? 'none', range] as const,
  aiUsageSummary: (orgId: number | null, range: AiUsageRange) =>
    [...PLATFORM_QUERY_KEY_ROOT, 'ai-usage-summary', orgId ?? 'none', range] as const,
  storageSummary: (orgId: number | null) =>
    [...PLATFORM_QUERY_KEY_ROOT, 'storage-summary', orgId ?? 'none'] as const,
  storageBreakdown: (orgId: number | null, groupBy: StorageBreakdownGroupBy) =>
    [...PLATFORM_QUERY_KEY_ROOT, 'storage-breakdown', orgId ?? 'none', groupBy] as const,
  enterpriseRequests: (orgId: number | null) =>
    [...PLATFORM_QUERY_KEY_ROOT, 'enterprise-requests', orgId ?? 'none'] as const,
};
