'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { StorageSummaryResponse } from '@/lib/api/studio';

function formatBytes(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let remaining = value;
  let index = 0;
  while (remaining >= 1024 && index < units.length - 1) {
    remaining /= 1024;
    index += 1;
  }
  const digits = index <= 1 ? 0 : 2;
  return `${remaining.toFixed(digits)} ${units[index]}`;
}

function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return '0%';
  return `${value.toFixed(1)}%`;
}

type StorageUsageCardsProps = {
  data: StorageSummaryResponse | null | undefined;
};

export function StorageUsageCards({ data }: StorageUsageCardsProps) {
  const summary = data?.summary;
  if (!summary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Storage</CardTitle>
          <CardDescription>Storage usage data is not available yet.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Plan tier</CardDescription>
          <CardTitle className="capitalize">{data?.planTier ?? 'free'}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Storage used</CardDescription>
          <CardTitle>{formatBytes(summary.storageUsedBytes)}</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground">
          {formatPercent(summary.storageUsagePercent)} of quota.
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Storage quota</CardDescription>
          <CardTitle>{formatBytes(summary.storageQuotaBytes)}</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground">
          Warning at {summary.storageWarningThresholdPercent}%.
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Remaining</CardDescription>
          <CardTitle>{formatBytes(summary.storageRemainingBytes)}</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground">
          {summary.overLimit
            ? 'Over storage limit.'
            : summary.warning
              ? 'Approaching storage limit.'
              : 'Within storage limits.'}
        </CardContent>
      </Card>
    </section>
  );
}
