'use client';

import { useQuery } from '@tanstack/react-query';
import { payloadSdk, PAGES_SLUG } from '@/lib/api-client/payload-sdk';
import { studioKeys } from '../keys';

export function usePage(id: number | null) {
  return useQuery({
    queryKey: id != null ? studioKeys.page(id) : ['studio', 'page', 'empty'],
    queryFn: () => payloadSdk.findByID({ collection: PAGES_SLUG, id: String(id!) }),
    enabled: id != null,
  });
}
