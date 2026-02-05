'use client';

import { useQuery } from '@tanstack/react-query';
import { studioKeys } from '../keys';
import { studioClient } from '../studio-client';

export function useVideoDoc(id: number | null) {
  return useQuery({
    queryKey: studioKeys.videoDoc(id!),
    queryFn: () => studioClient.getVideoDoc(id!),
    enabled: id != null,
  });
}
