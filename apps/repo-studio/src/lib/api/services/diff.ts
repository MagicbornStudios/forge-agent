import { getJson } from '@/lib/api/http';
import type { DiffFilePayload, DiffStatusResponse } from '@/lib/api/types';

export async function fetchDiffStatus(input: {
  scope?: 'workspace' | 'loop' | 'story' | 'planning';
  loopId?: string;
}) {
  const params = new URLSearchParams({
    scope: input.scope || 'workspace',
  });
  if (input.loopId) params.set('loopId', input.loopId);
  return getJson<DiffStatusResponse>(`/api/repo/diff/status?${params.toString()}`, {
    fallbackMessage: 'Unable to load diff status.',
  });
}

export async function fetchDiffFile(input: {
  path: string;
  base?: string;
  head?: string;
  scope?: 'workspace' | 'loop' | 'story' | 'planning';
  loopId?: string;
}) {
  const params = new URLSearchParams({
    path: input.path,
    base: input.base || 'HEAD',
    head: input.head || 'WORKTREE',
  });
  if (input.scope) params.set('scope', input.scope);
  if (input.loopId) params.set('loopId', input.loopId);
  return getJson<DiffFilePayload>(`/api/repo/diff/file?${params.toString()}`, {
    fallbackMessage: `Unable to load diff for ${input.path}.`,
  });
}

