'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { payloadSdk, PAGES_SLUG } from '@/lib/api-client/payload-sdk';
import { studioKeys } from '../keys';
import type { PageDoc } from '@forge/types/page';

export type UpdatePageInput = {
  id: number;
  projectId: number;
  data: Partial<
    Pick<
      PageDoc,
      'parent' | 'properties' | 'cover' | 'icon' | 'archived' | 'in_trash' | 'url' | 'public_url'
    >
  >;
};

export function useUpdatePage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdatePageInput) =>
      payloadSdk.update({
        collection: PAGES_SLUG,
        id: body.id,
        data: body.data as Record<string, unknown>,
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: studioKeys.page(variables.id) });
      queryClient.invalidateQueries({ queryKey: studioKeys.pages(variables.projectId) });
    },
  });
}
