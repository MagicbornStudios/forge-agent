'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getStudioApiUrl, fetchCheckoutSessionResult } from '@/lib/api';
import type { CheckoutSessionResult } from '@/lib/api';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [result, setResult] = useState<CheckoutSessionResult | null | 'loading'>('loading');

  useEffect(() => {
    if (!sessionId?.trim()) {
      setResult(null);
      return;
    }
    fetchCheckoutSessionResult(sessionId)
      .then((data) => setResult(data ?? null))
      .catch(() => setResult(null));
  }, [sessionId]);

  const studioUrl = getStudioApiUrl();
  const openInStudioUrl =
    result && result !== 'loading' && result.clonedProjectId != null
      ? `${studioUrl}/?projectId=${result.clonedProjectId}`
      : studioUrl;

  return (
    <div className="min-w-0 flex-1 p-8">
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-2xl font-bold text-foreground">Payment successful</h1>
        {result === 'loading' && sessionId && (
          <p className="mt-2 text-muted-foreground">Loading your purchase…</p>
        )}
        {result !== 'loading' && (
          <>
            {result?.listingTitle && (
              <p className="mt-2 text-muted-foreground">
                You now have access to <strong>{result.listingTitle}</strong>.
              </p>
            )}
            {!result && (
              <p className="mt-2 text-muted-foreground">
                Payment received. Check your account or Studio for your new project.
              </p>
            )}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild size="lg">
                <a href={openInStudioUrl} target="_blank" rel="noopener noreferrer">
                  Open in Studio
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/account">Account</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              You can clone this project again from your account when we add the licenses page.
            </p>
          </>
        )}
        {!sessionId && (
          <p className="mt-2 text-muted-foreground">
            Payment received. Check your account or Studio.
          </p>
        )}
        <Button asChild variant="ghost" className="mt-6">
          <Link href="/catalog">Back to catalog</Link>
        </Button>
      </div>
    </div>
  );
}
