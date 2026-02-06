'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { payloadSdk, PROJECTS_SLUG } from '@/lib/api-client/payload-sdk';
import { studioKeys } from '../keys';
import type { ProjectRecord } from '@forge/types/payload';

export function useProjects(domain?: ProjectRecord['domain']) {
  return useQuery({
    queryKey: studioKeys.projects(domain),
    queryFn: async () => {
      const result = await payloadSdk.find({
        collection: PROJECTS_SLUG,
        ...(domain
          ? {
              where: {
                domain: { equals: domain },
              },
            }
          : {}),
      });
      return result.docs as ProjectRecord[];
    },
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: {
      title: string;
      slug: string;
      description?: string;
      domain: ProjectRecord['domain'];
    }) =>
      payloadSdk.create({
        collection: PROJECTS_SLUG,
        data: {
          title: body.title,
          slug: body.slug,
          description: body.description,
          domain: body.domain,
          status: 'active',
        },
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: studioKeys.projects(variables.domain) });
    },
  });
}
