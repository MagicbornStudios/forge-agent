'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { studioKeys } from '../keys';
import { payloadSdk, FORGE_GRAPHS_SLUG } from '@/lib/api-client/payload-sdk';
import type { ForgeGraphKind } from '@forge/types/graph';

export function useCreateGraph() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: { title: string; flow: unknown; projectId: number; kind: ForgeGraphKind }) =>
      payloadSdk.create({
        collection: FORGE_GRAPHS_SLUG,
        data: {
          title: body.title,
          flow: body.flow as Record<string, unknown>,
          project: body.projectId,
          kind: body.kind,
        },
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: studioKeys.forgeGraphs(variables.projectId, variables.kind) });
    },
  });
}
