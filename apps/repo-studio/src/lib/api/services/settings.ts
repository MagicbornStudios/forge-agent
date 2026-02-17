import { getJson, postJson } from '@/lib/api/http';
import type {
  RepoSettingsSnapshot,
  RepoSettingsUpsertRequest,
  RepoSettingsUpsertResponse,
} from '@/lib/api/types';

export async function fetchSettingsSnapshot(input: { workspaceId: string; loopId: string }) {
  const params = new URLSearchParams({
    workspaceId: input.workspaceId,
    loopId: input.loopId,
  });
  return getJson<RepoSettingsSnapshot>(`/api/repo/settings/snapshot?${params.toString()}`, {
    fallbackMessage: 'Unable to load settings snapshot.',
  });
}

export async function upsertSettings(input: RepoSettingsUpsertRequest) {
  return postJson<RepoSettingsUpsertResponse>('/api/repo/settings/upsert', input, {
    fallbackMessage: 'Unable to save settings.',
  });
}

