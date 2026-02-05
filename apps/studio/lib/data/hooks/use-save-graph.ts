'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { studioKeys } from '../keys';
import { GraphsService } from '@/lib/api-client';
import { useGraphStore } from '@/lib/store';

export function useSaveGraph() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const graph = useGraphStore.getState().graph;
      if (!graph) throw new Error('No graph to save');
      return GraphsService.patchApiGraphs(String(graph.id), { flow: graph.flow });
    },
    onSuccess: (data) => {
      if (data?.id != null) {
        queryClient.invalidateQueries({ queryKey: studioKeys.graph(data.id) });
        queryClient.invalidateQueries({ queryKey: studioKeys.graphs() });
      }
      useGraphStore.setState({ isDirty: false });
    },
  });
}
