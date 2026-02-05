'use client';

import { useQuery } from '@tanstack/react-query';
import { studioKeys } from '../keys';
import { payloadSdk, FORGE_GRAPHS_SLUG } from '@/lib/api-client/payload-sdk';

export function useGraph(id: number | null) {
  return useQuery({
    queryKey: studioKeys.graph(id!),
    queryFn: () => payloadSdk.findByID({ collection: FORGE_GRAPHS_SLUG, id: String(id!) }),
    enabled: id != null,
  });
}
