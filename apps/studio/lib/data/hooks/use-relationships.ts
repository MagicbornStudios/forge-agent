'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studioKeys } from '../keys';
import { payloadSdk, RELATIONSHIPS_SLUG } from '@/lib/api-client/payload-sdk';

/** Fetch all relationships for a given project. */
export function useRelationships(projectId: number | null) {
  return useQuery({
    queryKey: studioKeys.relationships(projectId!),
    queryFn: async () => {
      const result = await payloadSdk.find({
        collection: RELATIONSHIPS_SLUG,
        where: { project: { equals: projectId } },
        limit: 500,
      });
      return result.docs;
    },
    enabled: projectId != null,
  });
}

/** Create a new relationship between two characters. */
export function useCreateRelationship() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: {
      project: number;
      sourceCharacter: number;
      targetCharacter: number;
      label: string;
      description?: string;
    }) => payloadSdk.create({ collection: RELATIONSHIPS_SLUG, data: body }),
    onSuccess: (data) => {
      const projectId =
        typeof data?.project === 'number' ? data.project : (data?.project as { id: number })?.id;
      if (projectId != null) {
        queryClient.invalidateQueries({ queryKey: studioKeys.relationships(projectId) });
      }
    },
  });
}

/** Update a relationship (label, description). */
export function useUpdateRelationship() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: number;
      label?: string;
      description?: string;
    }) => payloadSdk.update({ collection: RELATIONSHIPS_SLUG, id, data }),
    onSuccess: (data) => {
      const projectId =
        typeof data?.project === 'number' ? data.project : (data?.project as { id: number })?.id;
      if (projectId != null) {
        queryClient.invalidateQueries({ queryKey: studioKeys.relationships(projectId) });
      }
    },
  });
}

/** Delete a relationship. */
export function useDeleteRelationship() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) =>
      payloadSdk.delete({ collection: RELATIONSHIPS_SLUG, id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studio', 'relationships'] });
    },
  });
}
