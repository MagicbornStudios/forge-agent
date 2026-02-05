'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { studioKeys } from '../keys';
import { payloadSdk, VIDEO_DOCS_SLUG } from '@/lib/api-client/payload-sdk';

export function useCreateVideoDoc() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: { title: string; doc: unknown }) =>
      payloadSdk.create({
        collection: VIDEO_DOCS_SLUG,
        data: { title: body.title, doc: body.doc as Record<string, unknown> },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studioKeys.videoDocs() });
    },
  });
}
