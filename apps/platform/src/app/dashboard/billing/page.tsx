'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { PricingTable, type PricingPlan } from '@/components/pricing/pricing-table';
import {
  createCheckoutSession,
  createConnectAccount,
  createConnectOnboardingLink,
  getStudioApiUrl,
} from '@/lib/api/studio';
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
  const { user, isLoading, activeOrganizationId, activeOrganization, refreshUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [connectLoading, setConnectLoading] = useState(false);
  const [onboardingLoading, setOnboardingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const success = searchParams.get('success') === '1';

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login?returnUrl=/dashboard/billing');
    }
  }, [isLoading, user, router]);

  async function handleUpgrade() {
    setUpgradeLoading(true);
    setError(null);
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const billingUrl = `${origin}/dashboard/billing`;
      const { url } = await createCheckoutSession(`${billingUrl}?success=1`, billingUrl);
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

  if (isLoading) {
    return (
      <main className="p-6">
        <p className="text-sm text-muted-foreground">Loading billing...</p>
      </main>
    );
  }

  if (!user) return null;

  const plan = user.plan ?? 'free';

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

      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

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
