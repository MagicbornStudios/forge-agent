import { getJson, postJson } from '@/lib/api/http';
import type {
  AssistantRuntime,
  RepoModelSelectionResponse,
  RepoModelsCatalogResponse,
} from '@/lib/api/types';

export async function fetchModelCatalog(input: {
  runtime: AssistantRuntime;
  workspaceId?: string;
  loopId?: string;
}) {
  const params = new URLSearchParams({
    runtime: input.runtime,
    workspaceId: String(input.workspaceId || 'planning'),
    loopId: String(input.loopId || 'default'),
  });
  return getJson<RepoModelsCatalogResponse>(`/api/repo/models?${params.toString()}`, {
    fallbackMessage: `Unable to load ${input.runtime} model catalog.`,
    timeoutMs: input.runtime === 'codex' ? 30000 : 15000,
  });
}

export async function saveModelSelection(input: {
  runtime: AssistantRuntime;
  modelId: string;
  workspaceId?: string;
  loopId?: string;
}) {
  return postJson<RepoModelSelectionResponse>('/api/repo/models/selection', input, {
    fallbackMessage: `Unable to persist ${input.runtime} model selection.`,
  });
}
