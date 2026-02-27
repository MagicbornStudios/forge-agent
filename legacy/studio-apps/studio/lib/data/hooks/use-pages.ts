'use client';

import { useQuery } from '@tanstack/react-query';
import { payloadSdk, PAGES_SLUG } from '@/lib/api-client/payload-sdk';
import { studioKeys } from '../keys';
import type { PageDoc } from '@forge/types/page';

export function usePages(projectId: number | null) {
  return useQuery({
    queryKey: projectId != null ? studioKeys.pages(projectId) : ['studio', 'pages', 'empty'],
    queryFn: async () => {
      const result = await payloadSdk.find({
        collection: PAGES_SLUG,
        where: projectId != null ? { project: { equals: projectId } } : undefined,
      });
      return result.docs as PageDoc[];
    },
    enabled: projectId != null,
  });
}
