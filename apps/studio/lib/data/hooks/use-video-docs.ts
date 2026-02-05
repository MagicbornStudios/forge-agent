'use client';

import { useQuery } from '@tanstack/react-query';
import { studioKeys } from '../keys';
import { studioClient } from '../studio-client';

export function useVideoDocs() {
  return useQuery({
    queryKey: studioKeys.videoDocs(),
    queryFn: () => studioClient.getVideoDocs(),
  });
}
