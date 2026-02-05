'use client';

import { useQuery } from '@tanstack/react-query';
import { studioKeys } from '../keys';
import { GraphsService } from '@/lib/api-client';

export function useGraph(id: number | null) {
  return useQuery({
    queryKey: studioKeys.graph(id!),
    queryFn: () => GraphsService.getApiGraphs(String(id!)),
    enabled: id != null,
  });
}
