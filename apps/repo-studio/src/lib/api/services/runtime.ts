import { getJson, postJson } from '@/lib/api/http';
import type { RuntimeDepsResponse, RuntimeStopResponse } from '@/lib/api/types';

export async function fetchRuntimeDependencies() {
  return getJson<RuntimeDepsResponse>('/api/repo/runtime/deps', {
    fallbackMessage: 'Unable to load runtime dependency health.',
  });
}

export async function stopRuntime() {
  return postJson<RuntimeStopResponse>('/api/repo/runtime/stop', {}, {
    fallbackMessage: 'Unable to stop RepoStudio runtime.',
  });
}

