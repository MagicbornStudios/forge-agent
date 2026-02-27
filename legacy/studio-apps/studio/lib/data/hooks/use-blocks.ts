'use client';

import { useQuery } from '@tanstack/react-query';
import { payloadSdk, BLOCKS_SLUG } from '@/lib/api-client/payload-sdk';
import { studioKeys } from '../keys';
import type { BlockDoc } from '@forge/types/page';

export function useBlocks(pageId: number | null, parentBlockId?: number | null) {
  return useQuery({
    queryKey:
      pageId != null
        ? studioKeys.blocks(pageId, parentBlockId ?? undefined)
        : ['studio', 'blocks', 'empty'],
    queryFn: async () => {
      const and: Array<{ page?: { equals: number }; parent_block?: { equals: number | null } }> = [
        { page: { equals: pageId! } },
      ];
      if (parentBlockId != null) {
        and.push({ parent_block: { equals: parentBlockId } });
      } else {
        and.push({ parent_block: { equals: null } });
      }
      const result = await payloadSdk.find({
        collection: BLOCKS_SLUG,
        where: { and },
        sort: 'position',
      });
      return result.docs as BlockDoc[];
    },
    enabled: pageId != null,
  });
}

export function useBlock(id: number | null) {
  return useQuery({
    queryKey: id != null ? studioKeys.block(id) : ['studio', 'block', 'empty'],
    queryFn: () => payloadSdk.findByID({ collection: BLOCKS_SLUG, id: String(id!) }),
    enabled: id != null,
  });
}
