export const PLATFORM_QUERY_KEYS = {
  listings: (orgId: number | null) => ['platform', 'listings', orgId ?? 'none'] as const,
  projects: (orgId: number | null) => ['platform', 'projects', orgId ?? 'none'] as const,
  revenue: (orgId: number | null) => ['platform', 'revenue', orgId ?? 'none'] as const,
  licenses: (orgId: number | null) => ['platform', 'licenses', orgId ?? 'none'] as const,
  apiKeys: (orgId: number | null) => ['platform', 'api-keys', orgId ?? 'none'] as const,
  aiUsageSeries: (orgId: number | null, range: '7d' | '30d' | '90d') =>
    ['platform', 'ai-usage-series', orgId ?? 'none', range] as const,
  aiUsageSummary: (orgId: number | null, range: '7d' | '30d' | '90d') =>
    ['platform', 'ai-usage-summary', orgId ?? 'none', range] as const,
};
