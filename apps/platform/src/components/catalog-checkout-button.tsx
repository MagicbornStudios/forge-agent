'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cloneFreeListing, createListingCheckoutSession, fetchMe } from '@/lib/api/studio';

type CatalogCheckoutButtonProps = {
  listingId: number;
  listingSlug: string;
  listingPrice: number;
};

export function CatalogCheckoutButton({
  listingId,
  listingSlug,
  listingPrice,
}: CatalogCheckoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);
    try {
      const { user } = await fetchMe();
      if (!user) {
        router.push(`/login?returnUrl=${encodeURIComponent(`/catalog/${listingSlug}`)}`);
        return;
      }

      if (listingPrice === 0) {
        const cloned = await cloneFreeListing(listingId);
        router.push(
          `/checkout/success?mode=free&project_id=${encodeURIComponent(String(cloned.projectId))}&listing_id=${encodeURIComponent(String(cloned.listingId))}&listing_title=${encodeURIComponent(cloned.listingTitle)}`,
        );
        return;
      }

      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const { url } = await createListingCheckoutSession(listingId, {
        successUrl: `${origin}/checkout/success`,
        cancelUrl: `${origin}/checkout/cancel`,
        baseUrl: origin,
      });

      if (url) {
        window.location.href = url;
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to start checkout', error);
      setLoading(false);
    }
  }

  return (
    <Button size="lg" onClick={handleCheckout} disabled={loading}>
      {loading ? 'Redirecting...' : listingPrice === 0 ? 'Clone for free' : 'Get'}
    </Button>
  );
}
