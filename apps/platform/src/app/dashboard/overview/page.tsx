'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { AiUsageAreaChart } from '@/components/dashboard/ai-usage-area-chart';
import { BillingStatusBanner } from '@/components/dashboard/billing-status-banner';
import { EnterpriseAccessCard } from '@/components/dashboard/enterprise-access-card';
import { RecentSales } from '@/components/dashboard/recent-sales';
import { RecentSalesSkeleton } from '@/components/dashboard/recent-sales-skeleton';
import { RevenueAreaChart } from '@/components/dashboard/revenue-area-chart';
import { StorageUsageCards } from '@/components/dashboard/storage-usage-cards';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  useAiUsageSeries,
  useAiUsageSummary,
  useCreatorListings,
  useLicenses,
  useRevenueSummary,
  useStorageSummary,
} from '@/lib/data/hooks/use-dashboard-data';
import { createConnectAccount, createConnectOnboardingLink, getStudioApiUrl } from '@/lib/api/studio';
import { formatCurrencyFromCents, formatUsd } from '@/lib/dashboard/format';
import {
  buildAiTrend,
  buildOverviewMetrics,
  buildRecentSales,
  buildRevenueTrend,
} from '@/lib/dashboard/selectors';
import { PLATFORM_ROUTES } from '@/lib/constants/routes';

export default function DashboardOverviewPage() {
  const {
    user,
    activeOrganizationId,
    activeOrganization,
    refreshUser,
  } = useAuth();
  const searchParams = useSearchParams();
  const [connectLoading, setConnectLoading] = useState(false);
  const [onboardingLoading, setOnboardingLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const listingsQuery = useCreatorListings(activeOrganizationId, !!user);
  const licensesQuery = useLicenses(activeOrganizationId, !!user);
  const revenueQuery = useRevenueSummary(activeOrganizationId, !!user);
  const aiSummaryQuery = useAiUsageSummary(activeOrganizationId, '30d', !!user);
  const aiSeriesQuery = useAiUsageSeries(activeOrganizationId, '30d', !!user);
  const storageSummaryQuery = useStorageSummary(activeOrganizationId, !!user);

  const loading =
    listingsQuery.isLoading ||
    licensesQuery.isLoading ||
    revenueQuery.isLoading ||
    aiSummaryQuery.isLoading ||
    aiSeriesQuery.isLoading ||
    storageSummaryQuery.isLoading;

  const queryError =
    listingsQuery.error ??
    licensesQuery.error ??
    revenueQuery.error ??
    aiSummaryQuery.error ??
    aiSeriesQuery.error ??
    storageSummaryQuery.error;
  const error =
    localError ??
    (queryError instanceof Error
      ? queryError.message
      : queryError
        ? 'Failed to load dashboard data'
        : null);

  const metrics = useMemo(
    () =>
      buildOverviewMetrics(
        listingsQuery.data ?? [],
        licensesQuery.data ?? [],
        revenueQuery.data,
        aiSummaryQuery.data?.summary,
      ),
    [aiSummaryQuery.data?.summary, licensesQuery.data, listingsQuery.data, revenueQuery.data],
  );

  const revenueTrend = useMemo(
    () => buildRevenueTrend(revenueQuery.data?.byLicense ?? []),
    [revenueQuery.data?.byLicense],
  );

  const aiTrend = useMemo(() => buildAiTrend(aiSeriesQuery.data?.series ?? []), [aiSeriesQuery.data?.series]);

  const recentSales = useMemo(
    () => buildRecentSales(revenueQuery.data?.byLicense ?? [], 6),
    [revenueQuery.data?.byLicense],
  );

  async function handleCreateConnectAccount() {
    setConnectLoading(true);
    setLocalError(null);
    try {
      await createConnectAccount(activeOrganizationId ?? undefined);
      await refreshUser();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to create payouts account');
    } finally {
      setConnectLoading(false);
    }
  }

  async function handleCompleteOnboarding() {
    setOnboardingLoading(true);
    setLocalError(null);
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const returnUrl = `${origin}/dashboard/overview?connect=success`;
      const refreshUrl = `${origin}/dashboard/overview?connect=refresh`;
      const { url } = await createConnectOnboardingLink({
        orgId: activeOrganizationId,
        baseUrl: origin,
        returnUrl,
        refreshUrl,
      });
      window.location.href = url;
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to create onboarding link');
      setOnboardingLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="space-y-4 p-6">
        <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        <RecentSalesSkeleton />
      </main>
    );
  }

  if (!user) return null;

  const connectState = searchParams.get('connect');

  return (
    <main className="space-y-6 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Creator overview</h1>
        <p className="text-sm text-muted-foreground">
          Listings, revenue, and AI cost visibility for {activeOrganization?.organizationName ?? 'your workspace'}.
        </p>
      </header>

      {connectState === 'success' ? (
        <p className="rounded-md border border-border bg-card px-3 py-2 text-sm text-muted-foreground">
          Stripe onboarding updated successfully.
        </p>
      ) : null}

      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total listings</CardDescription>
            <CardTitle>{metrics.totalListings}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {metrics.publishedListings} published, {metrics.freeListings} free.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Licenses sold</CardDescription>
            <CardTitle>{metrics.licensesSold}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Includes free and paid listing grants.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total earnings</CardDescription>
            <CardTitle>{formatCurrencyFromCents(metrics.totalEarningsCents)}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Platform fees: {formatCurrencyFromCents(metrics.platformFeesCents)}.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>AI usage (30d)</CardDescription>
            <CardTitle>{formatUsd(metrics.aiSpendUsd)}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {metrics.aiRequests} request(s) processed.
          </CardContent>
        </Card>
      </section>

      <BillingStatusBanner storage={storageSummaryQuery.data?.summary} />
      <StorageUsageCards data={storageSummaryQuery.data} />

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue trend</CardTitle>
            <CardDescription>Net earnings and platform fees over time.</CardDescription>
          </CardHeader>
          <CardContent>
            {revenueTrend.length === 0 ? (
              <p className="text-sm text-muted-foreground">No revenue trend data yet.</p>
            ) : (
              <RevenueAreaChart data={revenueTrend} />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>AI spend trend</CardTitle>
            <CardDescription>Usage costs and token volume over the last 30 days.</CardDescription>
          </CardHeader>
          <CardContent>
            {aiTrend.length === 0 ? (
              <p className="text-sm text-muted-foreground">No AI usage recorded yet.</p>
            ) : (
              <AiUsageAreaChart data={aiTrend} />
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Payout setup</CardTitle>
            <CardDescription>
              Connect Stripe so paid clones route payouts to your creator account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {activeOrganization?.stripeConnectAccountId
                ? `Connected account: ${activeOrganization.stripeConnectAccountId}`
                : 'No connected Stripe account yet.'}
            </p>
            <div className="flex flex-wrap gap-2">
              {!activeOrganization?.stripeConnectAccountId ? (
                <Button onClick={handleCreateConnectAccount} disabled={connectLoading}>
                  {connectLoading ? 'Creating account...' : 'Create payouts account'}
                </Button>
              ) : null}
              <Button
                variant="outline"
                onClick={handleCompleteOnboarding}
                disabled={onboardingLoading || !activeOrganization?.stripeConnectAccountId}
              >
                {onboardingLoading ? 'Redirecting...' : 'Complete onboarding'}
              </Button>
              {activeOrganization?.stripeConnectAccountId ? (
                <Button asChild variant="outline">
                  <a href="https://dashboard.stripe.com/express" target="_blank" rel="noreferrer">
                    Open Stripe dashboard
                  </a>
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>

        {revenueQuery.isLoading ? (
          <RecentSalesSkeleton />
        ) : (
          <RecentSales sales={recentSales} />
        )}
      </section>

      <section className="flex flex-wrap gap-2">
        <Button asChild variant="outline">
          <Link href={PLATFORM_ROUTES.dashboardListings}>Manage listings</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={PLATFORM_ROUTES.dashboardGames}>View games</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={PLATFORM_ROUTES.dashboardRevenue}>Open revenue</Link>
        </Button>
        <Button asChild>
          <a href={getStudioApiUrl()} target="_blank" rel="noreferrer">
            Open Studio
          </a>
        </Button>
      </section>

      <EnterpriseAccessCard
        orgId={activeOrganizationId}
        activeOrganization={activeOrganization}
      />
    </main>
  );
}
