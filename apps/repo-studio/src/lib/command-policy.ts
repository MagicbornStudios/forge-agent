import { runRepoStudioCli } from './cli-runner';

export type CommandEntry = {
  id: string;
  source: string;
  command: string;
  blocked?: boolean;
  blockedBy?: string | null;
  recommended?: boolean;
};

export function loadCommandsFromCli() {
  const result = runRepoStudioCli(['commands-list', '--json']);
  const payload = (result.payload || {}) as {
    ok?: boolean;
    commands?: CommandEntry[];
    disabledCommandIds?: string[];
    commandView?: Record<string, unknown> | null;
  };

  const commands = Array.isArray(payload.commands) ? payload.commands : [];
  return {
    ok: payload.ok !== false && result.ok,
    commands,
    disabledCommandIds: Array.isArray(payload.disabledCommandIds) ? payload.disabledCommandIds : [],
    commandView: payload.commandView || null,
    raw: result,
  };
}
