export const RUNNER_PROMPT_PACK = 'prompt-pack';
export const RUNNER_CODEX = 'codex';
export const RUNNER_AUTO = 'auto';

export const RUNNER_VALUES = [RUNNER_PROMPT_PACK, RUNNER_CODEX, RUNNER_AUTO];

export const STAGE_DISCUSS = 'discuss';
export const STAGE_PLAN = 'plan';
export const STAGE_EXECUTE = 'execute';

export const STAGE_VALUES = [STAGE_DISCUSS, STAGE_PLAN, STAGE_EXECUTE];

export function normalizeRunner(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (raw === RUNNER_CODEX) return RUNNER_CODEX;
  if (raw === RUNNER_AUTO) return RUNNER_AUTO;
  return RUNNER_PROMPT_PACK;
}

export function normalizeStage(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (raw === STAGE_PLAN) return STAGE_PLAN;
  if (raw === STAGE_EXECUTE) return STAGE_EXECUTE;
  return STAGE_DISCUSS;
}
