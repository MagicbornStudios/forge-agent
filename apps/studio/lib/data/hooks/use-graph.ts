'use client';

import { useQuery } from '@tanstack/react-query';
import { studioKeys } from '../keys';
import { studioClient } from '../studio-client';

export function useGraph(id: number | null) {
  return useQuery({
    queryKey: studioKeys.graph(id!),
    queryFn: () => studioClient.getGraph(id!),
    enabled: id != null,
  });
}
