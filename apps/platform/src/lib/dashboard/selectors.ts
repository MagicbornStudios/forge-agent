import type {
  AiUsageSeriesResponse,
  AiUsageSummaryResponse,
  CreatorListing,
  LicenseItem,
  RevenueSummary,
} from '@/lib/api/studio';

export type RevenueTrendRow = {
  date: string;
  earningsUsd: number;
  feesUsd: number;
};

export type AiTrendRow = {
  date: string;
  totalCostUsd: number;
  totalTokensK: number;
};

export type OverviewMetrics = {
  totalListings: number;
  publishedListings: number;
  freeListings: number;
  licensesSold: number;
  totalEarningsCents: number;
  platformFeesCents: number;
  aiRequests: number;
  aiSpendUsd: number;
};

export function buildOverviewMetrics(
  listings: CreatorListing[] = [],
  licenses: LicenseItem[] = [],
  revenue?: RevenueSummary,
  aiSummary?: AiUsageSummaryResponse['summary'],
): OverviewMetrics {
  const published = listings.filter((listing) => listing.status === 'published').length;
  const free = listings.filter((listing) => listing.price === 0).length;

  return {
    totalListings: listings.length,
    publishedListings: published,
    freeListings: free,
    licensesSold: licenses.length,
    totalEarningsCents: revenue?.totalEarningsCents ?? 0,
    platformFeesCents: revenue?.totalPlatformFeesCents ?? 0,
    aiRequests: aiSummary?.requestCount ?? 0,
    aiSpendUsd: aiSummary?.totalCostUsd ?? 0,
  };
}

export function buildRevenueTrend(byLicense: RevenueSummary['byLicense'] = []): RevenueTrendRow[] {
  const grouped = new Map<string, RevenueTrendRow>();
  for (const item of byLicense) {
    const date = item.grantedAt ? new Date(item.grantedAt).toISOString().slice(0, 10) : 'unknown';
    if (date === 'unknown') continue;

    const row = grouped.get(date) ?? { date, earningsUsd: 0, feesUsd: 0 };
    row.earningsUsd += (item.amountCents - item.platformFeeCents) / 100;
    row.feesUsd += item.platformFeeCents / 100;
    grouped.set(date, row);
  }

  return [...grouped.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export function buildRecentSales(
  byLicense: RevenueSummary['byLicense'] = [],
  limit = 8,
): RevenueSummary['byLicense'] {
  return [...byLicense]
    .sort((a, b) => {
      const dateA = a.grantedAt ? Date.parse(a.grantedAt) : 0;
      const dateB = b.grantedAt ? Date.parse(b.grantedAt) : 0;
      return dateB - dateA;
    })
    .slice(0, limit);
}

export function buildAiTrend(series: AiUsageSeriesResponse['series'] = []): AiTrendRow[] {
  return series.map((entry) => ({
    date: entry.date,
    totalCostUsd: entry.totalCostUsd,
    totalTokensK: Number((entry.totalTokens / 1000).toFixed(2)),
  }));
}

export function buildRevenueTotals(revenue?: RevenueSummary): {
  total: number;
  fees: number;
  gross: number;
} {
  const total = revenue?.totalEarningsCents ?? 0;
  const fees = revenue?.totalPlatformFeesCents ?? 0;
  return {
    total,
    fees,
    gross: total + fees,
  };
}
