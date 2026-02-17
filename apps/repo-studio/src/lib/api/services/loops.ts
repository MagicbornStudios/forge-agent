import { getJson, postJson } from '@/lib/api/http';
import type { LoopSnapshotResponse, LoopUseResponse } from '@/lib/api/types';

export async function fetchLoopSnapshot(loopId: string) {
  const params = new URLSearchParams({ loopId });
  return getJson<LoopSnapshotResponse>(`/api/repo/loops/snapshot?${params.toString()}`, {
    fallbackMessage: `Unable to load loop snapshot for ${loopId}.`,
  });
}

export async function setActiveLoop(loopId: string) {
  return postJson<LoopUseResponse>('/api/repo/loops/use', { loopId }, {
    fallbackMessage: `Unable to switch to loop ${loopId}.`,
  });
}
