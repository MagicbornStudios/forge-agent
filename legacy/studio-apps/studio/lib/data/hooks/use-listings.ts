'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { payloadSdk, LISTINGS_SLUG } from '@/lib/api-client/payload-sdk';
import { studioKeys } from '../keys';

export type CreateListingInput = {
  title: string;
  slug: string;
  description?: string;
  listingType: 'project' | 'template' | 'strategy-core';
  project?: number | null;
  price: number;
  currency?: string;
  creator: number;
  category?: 'narrative' | 'character' | 'template' | 'strategy' | null;
  status: 'draft' | 'published';
  cloneMode: 'indefinite' | 'version-only';
};

export function useCreateListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateListingInput) =>
      payloadSdk.create({
        collection: LISTINGS_SLUG,
        data: {
          title: body.title,
          slug: body.slug,
          description: body.description ?? undefined,
          listingType: body.listingType,
          project: body.project ?? undefined,
          price: body.price,
          currency: body.currency ?? 'USD',
          creator: body.creator,
          category: body.category ?? undefined,
          status: body.status,
          cloneMode: body.cloneMode ?? 'indefinite',
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studioKeys.listings() });
    },
  });
}
