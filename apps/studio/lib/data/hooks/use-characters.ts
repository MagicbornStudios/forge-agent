'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studioKeys } from '../keys';
import { payloadSdk, CHARACTERS_SLUG } from '@/lib/api-client/payload-sdk';

/** Fetch all characters for a given project. */
export function useCharacters(projectId: number | null) {
  return useQuery({
    queryKey: studioKeys.characters(projectId!),
    queryFn: async () => {
      const result = await payloadSdk.find({
        collection: CHARACTERS_SLUG,
        where: { project: { equals: projectId } },
        limit: 200,
      });
      return result.docs;
    },
    enabled: projectId != null,
  });
}

/** Create a new character in a project. */
export function useCreateCharacter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: {
      name: string;
      description?: string;
      imageUrl?: string;
      project: number;
    }) => payloadSdk.create({ collection: CHARACTERS_SLUG, data: body }),
    onSuccess: (data) => {
      const projectId =
        typeof data?.project === 'number' ? data.project : (data?.project as { id: number })?.id;
      if (projectId != null) {
        queryClient.invalidateQueries({ queryKey: studioKeys.characters(projectId) });
      }
    },
  });
}

/** Update an existing character. */
export function useUpdateCharacter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: number;
      name?: string;
      description?: string;
      imageUrl?: string;
    }) => payloadSdk.update({ collection: CHARACTERS_SLUG, id, data }),
    onSuccess: (data) => {
      if (data?.id != null) {
        queryClient.invalidateQueries({ queryKey: studioKeys.character(data.id) });
      }
      const projectId =
        typeof data?.project === 'number' ? data.project : (data?.project as { id: number })?.id;
      if (projectId != null) {
        queryClient.invalidateQueries({ queryKey: studioKeys.characters(projectId) });
      }
    },
  });
}

/** Delete a character. */
export function useDeleteCharacter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => payloadSdk.delete({ collection: CHARACTERS_SLUG, id }),
    onSuccess: () => {
      // Broad invalidation since we don't know the project ID at this point.
      queryClient.invalidateQueries({ queryKey: ['studio', 'characters'] });
    },
  });
}
