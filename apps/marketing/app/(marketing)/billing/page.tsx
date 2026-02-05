'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@forge/ui';
import { useAuth } from '@/components/AuthProvider';
import { getStudioApiUrl } from '@/lib/api';

export default function BillingPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

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
      <div className="space-y-6">
        <div className="rounded-lg border border-border bg-card p-6 text-card-foreground">
          <p className="text-sm text-muted-foreground">Current plan</p>
          <p className="text-xl font-semibold capitalize">{plan}</p>
          {plan === 'free' && (
            <p className="mt-2 text-sm text-muted-foreground">
              Upgrade to Pro for more AI usage and features. Pro is coming soon.
            </p>
          )}
        </div>
        {plan === 'free' && (
          <Link href="/waitlist">
            <Button>Join waitlist for Pro</Button>
          </Link>
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
