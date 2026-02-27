'use client';

import { useMutation } from '@tanstack/react-query';
import {
  createForgeStoryFromPremise,
  type ForgeStoryBuilderRequest,
  type ForgeStoryBuilderResponse,
} from '@/lib/api-client/forge-story-builder';

export function useForgeStoryBuilder() {
  return useMutation<ForgeStoryBuilderResponse, Error, ForgeStoryBuilderRequest>({
    mutationFn: createForgeStoryFromPremise,
  });
}

export type { ForgeStoryBuilderRequest, ForgeStoryBuilderResponse };
