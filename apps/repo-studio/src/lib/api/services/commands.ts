import { getJson, postJson } from '@/lib/api/http';
import type {
  CommandViewResponse,
  CommandsListResponse,
  RepoCommandView,
  ToggleCommandResponse,
} from '@/lib/api/types';

export async function fetchCommandsModel() {
  return getJson<CommandsListResponse>('/api/repo/commands/list', {
    fallbackMessage: 'Unable to load command list.',
  });
}

export async function saveCommandView(view: RepoCommandView) {
  return postJson<CommandViewResponse>('/api/repo/commands/view', view, {
    fallbackMessage: 'Unable to save command view.',
  });
}

export async function toggleCommandPolicy(input: { commandId: string; disabled: boolean }) {
  return postJson<ToggleCommandResponse>('/api/repo/commands/toggle', input, {
    fallbackMessage: `Unable to update command policy for ${input.commandId}.`,
  });
}

