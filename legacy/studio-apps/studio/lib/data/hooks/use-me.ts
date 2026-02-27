'use client';

import { useQuery } from '@tanstack/react-query';
import { authKeys } from '../keys';
import { AuthService } from '@/lib/api-client';
import { ApiError } from '@/lib/api-client';

export function useMe() {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: async () => {
      try {
        return await AuthService.getApiMe();
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          return { user: null };
        }
        throw err;
      }
    },
    staleTime: 30 * 1000,
    retry: false,
  });
}
