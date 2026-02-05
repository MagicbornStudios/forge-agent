'use client';

import { useQuery } from '@tanstack/react-query';
import { studioKeys } from '../keys';
import { VideoDocsService } from '@/lib/api-client';

export function useVideoDocs() {
  return useQuery({
    queryKey: studioKeys.videoDocs(),
    queryFn: () => VideoDocsService.getApiVideoDocs1(),
  });
}
