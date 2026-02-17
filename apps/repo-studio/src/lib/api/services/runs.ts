import { postJson } from '@/lib/api/http';
import type { StartRunResponse, StopRunResponse } from '@/lib/api/types';

export async function startCommandRun(input: { commandId: string; confirm: boolean }) {
  return postJson<StartRunResponse>('/api/repo/runs/start', input, {
    fallbackMessage: `Unable to start run ${input.commandId}.`,
  });
}

export async function stopCommandRun(stopPath: string) {
  return postJson<StopRunResponse>(stopPath, {}, {
    fallbackMessage: 'Unable to stop active run.',
  });
}

