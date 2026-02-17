import { getJson } from '@/lib/api/http';
import type { RepoScope, RepoSearchResponse } from '@/lib/api/types';

export async function searchRepo(input: {
  query: string;
  regex?: boolean;
  include?: string[];
  exclude?: string[];
  scope?: RepoScope;
  loopId?: string;
}) {
  const params = new URLSearchParams({
    q: input.query,
    regex: input.regex ? '1' : '0',
    scope: input.scope || 'workspace',
  });
  if (input.loopId) params.set('loopId', input.loopId);
  if (input.include && input.include.length > 0) {
    params.set('include', input.include.join(','));
  }
  if (input.exclude && input.exclude.length > 0) {
    params.set('exclude', input.exclude.join(','));
  }
  return getJson<RepoSearchResponse>(`/api/repo/search?${params.toString()}`, {
    fallbackMessage: 'Unable to search repository.',
  });
}

