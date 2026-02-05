'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@forge/ui';
import { useAuth } from '@/components/providers/AuthProvider';
import { getStudioApiUrl, createCheckoutSession } from '@/lib/api';

export default function BillingPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const success = searchParams.get('success') === '1';

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  async function handleUpgrade() {
    setUpgradeLoading(true);
    try {
      const billingUrl = typeof window !== 'undefined' ? `${window.location.origin}/billing` : '/billing';
      const { url } = await createCheckoutSession(
        `${billingUrl}?success=1`,
        billingUrl
      );
      if (url) window.location.href = url;
    } catch {
      setUpgradeLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="container flex min-h-[40vh] items-center justify-center px-4">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!user) return null;

  const plan = user.plan ?? 'free';

  return (
    <div className="container max-w-2xl px-4 py-12">
      <h1 className="mb-6 text-2xl font-semibold">Billing</h1>
      {success && (
        <p className="mb-4 rounded-md bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
          Payment successful. Your plan has been updated.
        </p>
      )}
      <div className="space-y-6">
        <div className="rounded-lg border border-border bg-card p-6 text-card-foreground">
          <p className="text-sm text-muted-foreground">Current plan</p>
          <p className="text-xl font-semibold capitalize">{plan}</p>
          {plan === 'free' && (
            <p className="mt-2 text-sm text-muted-foreground">
              Upgrade to Pro for more AI usage and features.
            </p>
          )}
        </div>
        {plan === 'free' && (
          <div className="flex gap-4">
            <Button onClick={handleUpgrade} disabled={upgradeLoading}>
              {upgradeLoading ? 'Redirecting…' : 'Upgrade to Pro'}
            </Button>
            <Link href="/waitlist">
              <Button variant="outline">Join waitlist</Button>
            </Link>
          </div>
        )}
      </div>
      <div className="mt-6">
        <a href={getStudioApiUrl()} target="_blank" rel="noopener noreferrer">
          <Button variant="outline">Open app</Button>
        </a>
      </div>
    </div>
  );
}
