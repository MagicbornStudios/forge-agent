'use client';

import { useQuery } from '@tanstack/react-query';
import { studioKeys } from '../keys';
import { payloadSdk, VIDEO_DOCS_SLUG } from '@/lib/api-client/payload-sdk';

export function useVideoDoc(id: number | null) {
  return useQuery({
    queryKey: studioKeys.videoDoc(id!),
    queryFn: () => payloadSdk.findByID({ collection: VIDEO_DOCS_SLUG, id: String(id!) }),
    enabled: id != null,
  });
}
