'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { studioKeys } from '../keys';
import { payloadSdk, FORGE_GRAPHS_SLUG } from '@/lib/api-client/payload-sdk';
import { useGraphStore } from '@/lib/store';

export function useSaveGraph() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const graph = useGraphStore.getState().graph;
      if (!graph) throw new Error('No graph to save');
      return payloadSdk.update({
        collection: FORGE_GRAPHS_SLUG,
        id: graph.id,
        data: { flow: graph.flow },
      });
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
