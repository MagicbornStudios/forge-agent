import { useQuery } from '@tanstack/react-query';
import { authKeys } from '../keys';
import { studioClient } from '../studio-client';

export function useMe() {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: () => studioClient.getMe(),
    staleTime: 30 * 1000,
    retry: false,
  });
}
