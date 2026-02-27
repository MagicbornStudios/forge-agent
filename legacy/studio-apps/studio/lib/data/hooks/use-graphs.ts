'use client';

import { useQuery } from '@tanstack/react-query';
import { studioKeys } from '../keys';
import { payloadSdk, FORGE_GRAPHS_SLUG } from '@/lib/api-client/payload-sdk';

export function useGraphs() {
  return useQuery({
    queryKey: studioKeys.graphs(),
    queryFn: async () => {
      const result = await payloadSdk.find({ collection: FORGE_GRAPHS_SLUG });
      return result.docs;
    },
  });
}
