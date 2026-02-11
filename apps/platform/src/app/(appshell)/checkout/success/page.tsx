'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  fetchCheckoutSessionResult,
  getStudioApiUrl,
  type CheckoutSessionResult,
} from '@/lib/api/studio';

function parsePositiveInt(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const mode = searchParams.get('mode');
  const isFreeClone = mode === 'free';
  const freeProjectId = parsePositiveInt(searchParams.get('project_id'));
  const freeListingId = parsePositiveInt(searchParams.get('listing_id'));
  const freeListingTitle = searchParams.get('listing_title');
  const [result, setResult] = useState<CheckoutSessionResult | null | 'loading'>('loading');

  useEffect(() => {
    if (isFreeClone) {
      setResult({
        clonedProjectId: freeProjectId,
        listingTitle: freeListingTitle ?? null,
        listingId: freeListingId ?? 0,
      });
      return;
    }

    if (!sessionId?.trim()) {
      setResult(null);
      return;
    }
    fetchCheckoutSessionResult(sessionId)
      .then((data) => setResult(data ?? null))
      .catch(() => setResult(null));
  }, [freeListingId, freeListingTitle, freeProjectId, isFreeClone, sessionId]);

  const studioUrl = getStudioApiUrl();
  const openInStudioUrl =
    result && result !== 'loading' && result.clonedProjectId != null
      ? `${studioUrl}/?projectId=${result.clonedProjectId}`
      : studioUrl;

  return (
    <div className="mx-auto max-w-md py-12 text-center">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        {isFreeClone ? 'Clone successful' : 'Payment successful'}
      </h1>
      {result === 'loading' && sessionId && !isFreeClone ? (
        <p className="mt-2 text-muted-foreground">Loading your purchase...</p>
      ) : null}
      {result !== 'loading' ? (
        <>
          {result?.listingTitle ? (
            <p className="mt-2 text-muted-foreground">
              {isFreeClone ? (
                <>
                  <strong>{result.listingTitle}</strong> was cloned to your account.
                </>
              ) : (
                <>
                  You now have access to <strong>{result.listingTitle}</strong>.
                </>
              )}
            </p>
          ) : (
            <p className="mt-2 text-muted-foreground">
              {isFreeClone
                ? 'Clone completed. Open Studio to continue editing.'
                : 'Payment received. Check your dashboard or Studio for your new project.'}
            </p>
          )}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg">
              <a href={openInStudioUrl} target="_blank" rel="noopener noreferrer">
                Open in Studio
              </a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/dashboard/licenses">Licenses</Link>
            </Button>
          </div>
        </>
      ) : null}
      {!sessionId && !isFreeClone ? (
        <p className="mt-2 text-muted-foreground">Payment received. Check your dashboard or Studio.</p>
      ) : null}
      <Button asChild variant="ghost" className="mt-6">
        <Link href="/catalog">Back to catalog</Link>
      </Button>
    </div>
  );
}
