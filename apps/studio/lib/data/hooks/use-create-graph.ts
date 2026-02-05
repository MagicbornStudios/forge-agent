'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { studioKeys } from '../keys';
import { GraphsService } from '@/lib/api-client';

export function useCreateGraph() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: { title: string; flow: unknown }) =>
      GraphsService.postApiGraphs({ title: body.title, flow: body.flow }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studioKeys.graphs() });
    },
  });
}
