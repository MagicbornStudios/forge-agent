'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { studioKeys } from '../keys';
import { payloadSdk, FORGE_GRAPHS_SLUG } from '@/lib/api-client/payload-sdk';

export function useCreateGraph() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: { title: string; flow: unknown }) =>
      payloadSdk.create({
        collection: FORGE_GRAPHS_SLUG,
        data: { title: body.title, flow: body.flow as Record<string, unknown> },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studioKeys.graphs() });
    },
  });
}
