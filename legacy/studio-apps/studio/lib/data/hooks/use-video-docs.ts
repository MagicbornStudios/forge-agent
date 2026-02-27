'use client';

import { useQuery } from '@tanstack/react-query';
import { studioKeys } from '../keys';
import { payloadSdk, VIDEO_DOCS_SLUG } from '@/lib/api-client/payload-sdk';

export function useVideoDocs() {
  return useQuery({
    queryKey: studioKeys.videoDocs(),
    queryFn: async () => {
      const result = await payloadSdk.find({ collection: VIDEO_DOCS_SLUG });
      return result.docs;
    },
  });
}
