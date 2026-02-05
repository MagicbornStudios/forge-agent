'use client';

import { useQuery } from '@tanstack/react-query';
import { studioKeys } from '../keys';
import { VideoDocsService } from '@/lib/api-client';

export function useVideoDoc(id: number | null) {
  return useQuery({
    queryKey: studioKeys.videoDoc(id!),
    queryFn: () => VideoDocsService.getApiVideoDocs(String(id!)),
    enabled: id != null,
  });
}
