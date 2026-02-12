'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { PricingTable, type PricingPlan } from '@/components/pricing/pricing-table';
import { BillingStatusBanner } from '@/components/dashboard/billing-status-banner';
import { EnterpriseAccessCard } from '@/components/dashboard/enterprise-access-card';
import { StorageBreakdownTable } from '@/components/dashboard/storage-breakdown-table';
import { StorageUsageCards } from '@/components/dashboard/storage-usage-cards';
import {
  createCheckoutSession,
  createConnectAccount,
  createConnectOnboardingLink,
  createStorageUpgradeCheckoutSession,
  getStudioApiUrl,
} from '@/lib/api/studio';
import {
  useStorageBreakdown,
  useStorageSummary,
} from '@/lib/data/hooks/use-dashboard-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const planOptions: PricingPlan[] = [
  {
    id: 'free',
    title: 'Free',
    description: 'Browse catalog and use base platform features.',
    price: '$0',
    period: 'No monthly fee',
    features: ['Catalog access', 'Docs access', 'Starter AI usage'],
    ctaLabel: 'Current default',
    ctaHref: '/dashboard/billing',
  },
  {
    id: 'pro',
    title: 'Pro',
    description: 'Publish and monetize listings with Stripe Connect payouts.',
    price: '$19',
    period: 'per month',
    features: ['Publish listings', 'Paid clone monetization', 'Priority usage limits'],
    ctaLabel: 'Upgrade to Pro',
    ctaHref: '/dashboard/billing',
    highlight: true,
    badge: 'Recommended',
  },
];

export default function DashboardBillingPage() {
  const { user, activeOrganizationId, activeOrganization, refreshUser } = useAuth();
  const searchParams = useSearchParams();

  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [storageUpgradeLoading, setStorageUpgradeLoading] = useState(false);
  const [connectLoading, setConnectLoading] = useState(false);
  const [onboardingLoading, setOnboardingLoading] = useState(false);
  const [breakdownGroupBy, setBreakdownGroupBy] = useState<'org' | 'user' | 'project'>('project');
  const [error, setError] = useState<string | null>(null);

  const success = searchParams.get('success') === '1';
  const storageSummaryQuery = useStorageSummary(activeOrganizationId, !!user);
  const storageBreakdownQuery = useStorageBreakdown(
    activeOrganizationId,
    breakdownGroupBy,
    !!user,
  );

  async function handleUpgrade() {
    setUpgradeLoading(true);
    setError(null);
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const billingUrl = `${origin}/dashboard/billing`;
      const { url } = await createCheckoutSession({
        successUrl: `${billingUrl}?success=1`,
        cancelUrl: billingUrl,
        orgId: activeOrganizationId,
      });
      if (url) {
        window.location.href = url;
        return;
      }
      setUpgradeLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start checkout');
      setUpgradeLoading(false);
    }
  }

  async function handleCreateConnectAccount() {
    setConnectLoading(true);
    setError(null);
    try {
      await createConnectAccount(activeOrganizationId ?? undefined);
      await refreshUser();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create payouts account');
    } finally {
      setConnectLoading(false);
    }
  }

  async function handleStorageUpgrade() {
    setStorageUpgradeLoading(true);
    setError(null);
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const { url } = await createStorageUpgradeCheckoutSession({
        orgId: activeOrganizationId,
        successUrl: `${origin}/dashboard/billing?storage=success`,
        cancelUrl: `${origin}/dashboard/billing?storage=cancel`,
      });
      if (url) {
        window.location.href = url;
        return;
      }
      setStorageUpgradeLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start storage checkout');
      setStorageUpgradeLoading(false);
    }
  }

  async function handleOnboarding() {
    setOnboardingLoading(true);
    setError(null);
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const returnUrl = `${origin}/dashboard/billing?connect=success`;
      const refreshUrl = `${origin}/dashboard/billing?connect=refresh`;
      const { url } = await createConnectOnboardingLink({
        orgId: activeOrganizationId,
        baseUrl: origin,
        returnUrl,
        refreshUrl,
      });
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create onboarding link');
      setOnboardingLoading(false);
    }
  }

  if (storageSummaryQuery.isLoading || storageBreakdownQuery.isLoading) {
    return (
      <main className="p-6">
        <p className="text-sm text-muted-foreground">Loading billing...</p>
      </main>
    );
  }

  if (!user) return null;

  const plan = activeOrganization?.planTier ?? user.plan ?? 'free';

  return (
    <main className="space-y-6 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
        <p className="text-sm text-muted-foreground">
          Plan management, checkout, and creator payout onboarding.
        </p>
      </header>

      {success ? (
        <p className="rounded-md border border-border bg-card px-3 py-2 text-sm text-muted-foreground">
          Payment successful. Your plan has been updated.
        </p>
      ) : null}

      {searchParams.get('storage') === 'success' ? (
        <p className="rounded-md border border-border bg-card px-3 py-2 text-sm text-muted-foreground">
          Storage upgrade applied successfully.
        </p>
      ) : null}

      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <BillingStatusBanner storage={storageSummaryQuery.data?.summary} />

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current plan</CardTitle>
            <CardDescription>Upgrade to Pro to publish and monetize listings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-3xl font-semibold capitalize">{plan}</p>
            <div className="flex flex-wrap gap-2">
              {plan === 'free' ? (
                <Button onClick={handleUpgrade} disabled={upgradeLoading}>
                  {upgradeLoading ? 'Redirecting...' : 'Upgrade to Pro'}
                </Button>
              ) : (
                <Button variant="outline" disabled>
                  Pro active
                </Button>
              )}
              <Button asChild variant="outline">
                <Link href="/pricing">Compare plans</Link>
              </Button>
              <Button variant="outline" onClick={handleStorageUpgrade} disabled={storageUpgradeLoading}>
                {storageUpgradeLoading ? 'Redirecting...' : 'Upgrade storage'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payout account</CardTitle>
            <CardDescription>Stripe Connect account used for creator payouts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {activeOrganization?.stripeConnectAccountId
                ? `Connected account: ${activeOrganization.stripeConnectAccountId}`
                : 'No payouts account connected yet.'}
            </p>
            <div className="flex flex-wrap gap-2">
              {!activeOrganization?.stripeConnectAccountId ? (
                <Button onClick={handleCreateConnectAccount} disabled={connectLoading}>
                  {connectLoading ? 'Creating account...' : 'Create payouts account'}
                </Button>
              ) : null}
              <Button
                variant="outline"
                onClick={handleOnboarding}
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
      </section>

      <StorageUsageCards data={storageSummaryQuery.data} />

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold">Storage allocation</h2>
            <p className="text-sm text-muted-foreground">
              Usage grouped by organization, user, or project.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={breakdownGroupBy === 'org' ? 'default' : 'outline'}
              onClick={() => setBreakdownGroupBy('org')}
            >
              Org
            </Button>
            <Button
              size="sm"
              variant={breakdownGroupBy === 'user' ? 'default' : 'outline'}
              onClick={() => setBreakdownGroupBy('user')}
            >
              User
            </Button>
            <Button
              size="sm"
              variant={breakdownGroupBy === 'project' ? 'default' : 'outline'}
              onClick={() => setBreakdownGroupBy('project')}
            >
              Project
            </Button>
          </div>
        </div>
        <StorageBreakdownTable
          rows={storageBreakdownQuery.data?.rows}
          groupBy={breakdownGroupBy}
        />
      </section>

      <EnterpriseAccessCard
        orgId={activeOrganizationId}
        activeOrganization={activeOrganization}
      />

      <PricingTable
        plans={planOptions}
        title="Plan options"
        description="Stripe Checkout is used for all upgrades. Creator payouts require Stripe Connect onboarding."
        className="pt-2"
      />

      <Button asChild variant="ghost">
        <a href={getStudioApiUrl()} target="_blank" rel="noreferrer">
          Open Studio
        </a>
      </Button>
    </main>
  );
}
