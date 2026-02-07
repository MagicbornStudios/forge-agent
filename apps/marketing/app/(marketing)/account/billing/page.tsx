'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@forge/ui';
import { useAuth } from '@/components/providers/AuthProvider';
import { getStudioApiUrl, createCheckoutSession } from '@/lib/api';

export default function AccountBillingPage() {
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
      const base =
        typeof window !== 'undefined' ? window.location.origin : '';
      const billingUrl = `${base}/account/billing`;
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
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!user) return null;

  const plan = user.plan ?? 'free';

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Billing</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your plan and usage.
        </p>
      </div>

      {success && (
        <p className="rounded-md bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
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

      <div>
        <a href={getStudioApiUrl()} target="_blank" rel="noopener noreferrer">
          <Button variant="outline">Open app</Button>
        </a>
      </div>
    </div>
  );
}
