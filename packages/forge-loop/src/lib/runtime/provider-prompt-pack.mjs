import { RUNNER_PROMPT_PACK } from './contracts.mjs';

export function createPromptPackProvider() {
  return {
    name: RUNNER_PROMPT_PACK,
    canRun() {
      return { ok: true, issues: [] };
    },
  };
}
