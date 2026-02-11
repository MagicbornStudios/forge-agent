'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { RecentSales } from '@/components/dashboard/recent-sales';
import { RevenueAreaChart } from '@/components/dashboard/revenue-area-chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useRevenueSummary } from '@/lib/data/hooks/use-dashboard-data';

function formatCurrencyFromCents(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

export default function DashboardRevenuePage() {
  const { user, isLoading: authLoading, activeOrganizationId, activeOrganization } = useAuth();
  const router = useRouter();
  const revenueQuery = useRevenueSummary(activeOrganizationId, !!user);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?returnUrl=/dashboard/revenue');
    }
  }, [authLoading, user, router]);

  const loading = authLoading || revenueQuery.isLoading;
  const error =
    revenueQuery.error instanceof Error
      ? revenueQuery.error.message
      : revenueQuery.error
        ? 'Failed to load revenue'
        : null;

  const totals = useMemo(() => {
    const total = revenueQuery.data?.totalEarningsCents ?? 0;
    const fees = revenueQuery.data?.totalPlatformFeesCents ?? 0;
    const gross = total + fees;
    return { total, fees, gross };
  }, [revenueQuery.data?.totalEarningsCents, revenueQuery.data?.totalPlatformFeesCents]);

  const trend = useMemo(() => {
    const grouped = new Map<string, { date: string; earningsUsd: number; feesUsd: number }>();
    for (const entry of revenueQuery.data?.byLicense ?? []) {
      const date = entry.grantedAt
        ? new Date(entry.grantedAt).toISOString().slice(0, 10)
        : 'unknown';
      if (date === 'unknown') continue;
      const row = grouped.get(date) ?? { date, earningsUsd: 0, feesUsd: 0 };
      row.earningsUsd += (entry.amountCents - entry.platformFeeCents) / 100;
      row.feesUsd += entry.platformFeeCents / 100;
      grouped.set(date, row);
    }
    return [...grouped.values()].sort((a, b) => a.date.localeCompare(b.date));
  }, [revenueQuery.data?.byLicense]);

  const recentSales = useMemo(
    () =>
      [...(revenueQuery.data?.byLicense ?? [])]
        .sort((a, b) => {
          const dateA = a.grantedAt ? Date.parse(a.grantedAt) : 0;
          const dateB = b.grantedAt ? Date.parse(b.grantedAt) : 0;
          return dateB - dateA;
        })
        .slice(0, 8),
    [revenueQuery.data?.byLicense],
  );

  if (loading) {
    return (
      <main className="p-6">
        <p className="text-sm text-muted-foreground">Loading revenue...</p>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="space-y-6 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Revenue</h1>
        <p className="text-sm text-muted-foreground">
          Earnings and fee breakdown for {activeOrganization?.organizationName ?? 'your workspace'}.
        </p>
      </header>

      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Gross sales</CardDescription>
            <CardTitle>{formatCurrencyFromCents(totals.gross)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Platform fees</CardDescription>
            <CardTitle>{formatCurrencyFromCents(totals.fees)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Net earnings</CardDescription>
            <CardTitle>{formatCurrencyFromCents(totals.total)}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue trend</CardTitle>
            <CardDescription>Net and fee totals by day.</CardDescription>
          </CardHeader>
          <CardContent>
            {trend.length === 0 ? (
              <p className="text-sm text-muted-foreground">No revenue data yet.</p>
            ) : (
              <RevenueAreaChart data={trend} />
            )}
          </CardContent>
        </Card>
        <RecentSales sales={recentSales} />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>
            {revenueQuery.data?.byLicense?.length ?? 0} transaction(s) tracked from licenses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!revenueQuery.data || revenueQuery.data.byLicense.length === 0 ? (
            <p className="text-sm text-muted-foreground">No revenue data yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Listing</TableHead>
                  <TableHead>Gross</TableHead>
                  <TableHead>Platform fee</TableHead>
                  <TableHead>Net</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {revenueQuery.data.byLicense.map((entry) => (
                  <TableRow key={entry.licenseId}>
                    <TableCell className="font-medium">{entry.listingTitle}</TableCell>
                    <TableCell>{formatCurrencyFromCents(entry.amountCents)}</TableCell>
                    <TableCell>{formatCurrencyFromCents(entry.platformFeeCents)}</TableCell>
                    <TableCell>{formatCurrencyFromCents(entry.amountCents - entry.platformFeeCents)}</TableCell>
                    <TableCell>
                      {entry.grantedAt ? new Date(entry.grantedAt).toLocaleDateString() : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
