'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { payloadSdk, BLOCKS_SLUG } from '@/lib/api-client/payload-sdk';
import { studioKeys } from '../keys';

export type CreateBlockInput = {
  pageId: number;
  parentBlockId?: number | null;
  type: string;
  position: number;
  payload: Record<string, unknown>;
  has_children?: boolean;
};

export function useCreateBlock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateBlockInput) =>
      payloadSdk.create({
        collection: BLOCKS_SLUG,
        data: {
          page: body.pageId,
          ...(body.parentBlockId != null && { parent_block: body.parentBlockId }),
          type: body.type,
          position: body.position,
          payload: body.payload,
          ...(body.has_children != null && { has_children: body.has_children }),
        },
      }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: studioKeys.blocks(variables.pageId, variables.parentBlockId ?? undefined),
      });
      if (data?.id != null) {
        queryClient.invalidateQueries({ queryKey: studioKeys.block(data.id) });
      }
    },
  });
}

export function useUpdateBlock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { id: number; pageId: number; parentBlockId?: number | null; data: Record<string, unknown> }) =>
      payloadSdk.update({
        collection: BLOCKS_SLUG,
        id: body.id,
        data: body.data,
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: studioKeys.block(variables.id) });
      queryClient.invalidateQueries({
        queryKey: studioKeys.blocks(variables.pageId, variables.parentBlockId ?? undefined),
      });
    },
  });
}
