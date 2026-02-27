'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { payloadSdk, FORGE_GRAPHS_SLUG } from '@/lib/api-client/payload-sdk';
import { studioKeys } from '../keys';
import type { ForgeGraphDoc, ForgeGraphKind } from '@forge/types/graph';

export function useForgeGraphs(projectId: number | null, kind: ForgeGraphKind) {
  return useQuery({
    queryKey: projectId != null ? studioKeys.forgeGraphs(projectId, kind) : ['studio', 'forge-graphs', 'empty'],
    queryFn: async () => {
      const result = await payloadSdk.find({
        collection: FORGE_GRAPHS_SLUG,
        where: {
          and: [
            { project: { equals: projectId } },
            { kind: { equals: kind } },
          ],
        },
      });
      return result.docs as ForgeGraphDoc[];
    },
    enabled: projectId != null,
  });
}

export function useForgeGraph(id: number | null) {
  return useQuery({
    queryKey: id != null ? studioKeys.forgeGraph(id) : ['studio', 'forge-graph', 'empty'],
    queryFn: () => payloadSdk.findByID({ collection: FORGE_GRAPHS_SLUG, id: String(id!) }),
    enabled: id != null,
  });
}

export function useCreateForgeGraph() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { projectId: number; kind: ForgeGraphKind; title: string; flow: unknown }) =>
      payloadSdk.create({
        collection: FORGE_GRAPHS_SLUG,
        data: {
          project: body.projectId,
          kind: body.kind,
          title: body.title,
          flow: body.flow as Record<string, unknown>,
        },
      }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: studioKeys.forgeGraphs(variables.projectId, variables.kind) });
      if (data?.id != null) {
        queryClient.invalidateQueries({ queryKey: studioKeys.forgeGraph(data.id) });
      }
    },
  });
}

export function useUpdateForgeGraph() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { id: number; data: Partial<Pick<ForgeGraphDoc, 'title' | 'flow'>>; projectId: number; kind: ForgeGraphKind }) =>
      payloadSdk.update({
        collection: FORGE_GRAPHS_SLUG,
        id: body.id,
        data: body.data as Record<string, unknown>,
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: studioKeys.forgeGraph(variables.id) });
      queryClient.invalidateQueries({ queryKey: studioKeys.forgeGraphs(variables.projectId, variables.kind) });
    },
  });
}
