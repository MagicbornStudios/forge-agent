import { getJson } from '@/lib/api/http';
import type { PlanningStructuredModelResponse } from '@/lib/api/types';

export async function fetchPlanningModel(loopId: string) {
  const params = new URLSearchParams({ loopId });
  return getJson<PlanningStructuredModelResponse>(`/api/repo/planning/model?${params.toString()}`, {
    fallbackMessage: `Unable to load structured planning model for ${loopId}.`,
  });
}
