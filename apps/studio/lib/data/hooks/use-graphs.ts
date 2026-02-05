'use client';

import { useQuery } from '@tanstack/react-query';
import { studioKeys } from '../keys';
import { studioClient } from '../studio-client';

export function useGraphs() {
  return useQuery({
    queryKey: studioKeys.graphs(),
    queryFn: () => studioClient.getGraphs(),
  });
}
