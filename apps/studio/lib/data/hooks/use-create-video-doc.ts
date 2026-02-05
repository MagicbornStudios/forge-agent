'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { studioKeys } from '../keys';
import { VideoDocsService } from '@/lib/api-client';

export function useCreateVideoDoc() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: { title: string; doc: unknown }) =>
      VideoDocsService.postApiVideoDocs({ title: body.title, doc: body.doc }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studioKeys.videoDocs() });
    },
  });
}
