'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { studioKeys } from '../keys';
import { studioClient } from '../studio-client';
import { useVideoStore } from '@/lib/domains/video/store';

export function useSaveVideoDoc() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const doc = useVideoStore.getState().doc;
      if (!doc) throw new Error('No video doc to save');
      return studioClient.updateVideoDoc(doc.id, { doc: doc.doc });
    },
    onSuccess: (data) => {
      if (data?.id != null) {
        queryClient.invalidateQueries({ queryKey: studioKeys.videoDoc(data.id) });
        queryClient.invalidateQueries({ queryKey: studioKeys.videoDocs() });
      }
      useVideoStore.setState({ isDirty: false });
    },
  });
}
