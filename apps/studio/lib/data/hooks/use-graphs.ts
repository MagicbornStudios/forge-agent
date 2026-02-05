'use client';

import { useQuery } from '@tanstack/react-query';
import { studioKeys } from '../keys';
import { GraphsService } from '@/lib/api-client';

export function useGraphs() {
  return useQuery({
    queryKey: studioKeys.graphs(),
    queryFn: () => GraphsService.getApiGraphs1(),
  });
}
