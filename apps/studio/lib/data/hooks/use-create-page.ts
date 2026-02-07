'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { payloadSdk, PAGES_SLUG } from '@/lib/api-client/payload-sdk';
import { studioKeys } from '../keys';
import type { PageParent } from '@forge/types/page';

export type CreatePageInput = {
  projectId: number;
  parent: PageParent;
  properties: Record<string, unknown>;
  cover?: Record<string, unknown> | null;
  icon?: Record<string, unknown> | null;
};

export function useCreatePage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreatePageInput) =>
      payloadSdk.create({
        collection: PAGES_SLUG,
        data: {
          project: body.projectId,
          parent: body.parent as Record<string, unknown>,
          properties: body.properties,
          ...(body.cover != null && { cover: body.cover }),
          ...(body.icon != null && { icon: body.icon }),
        },
      }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: studioKeys.pages(variables.projectId) });
      if (data?.id != null) {
        queryClient.invalidateQueries({ queryKey: studioKeys.page(data.id) });
      }
    },
  });
}
