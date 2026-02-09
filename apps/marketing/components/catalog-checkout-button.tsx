'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { fetchMe, createListingCheckoutSession } from '@/lib/api';

type CatalogCheckoutButtonProps = {
  listingId: number;
  listingSlug: string;
};

export function CatalogCheckoutButton({ listingId, listingSlug }: CatalogCheckoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleGet() {
    setLoading(true);
    try {
      const { user } = await fetchMe();
      if (!user) {
        router.push(`/login?returnUrl=${encodeURIComponent(`/catalog/${listingSlug}`)}`);
        return;
      }
      const origin =
        typeof window !== 'undefined' ? window.location.origin : '';
      const { url } = await createListingCheckoutSession(listingId, {
        successUrl: `${origin}/checkout/success`,
        cancelUrl: `${origin}/checkout/cancel`,
        baseUrl: origin,
      });
      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      console.error('Checkout failed', err);
      setLoading(false);
    }
  }

  return (
    <Button size="lg" onClick={handleGet} disabled={loading}>
      {loading ? 'Redirecting…' : 'Get'}
    </Button>
  );
}
