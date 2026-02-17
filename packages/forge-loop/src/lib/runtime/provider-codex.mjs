import { RUNNER_CODEX } from './contracts.mjs';

export function createCodexProvider(codexRuntime = null) {
  return {
    name: RUNNER_CODEX,
    canRun() {
      if (!codexRuntime || codexRuntime.ok !== true) {
        return {
          ok: false,
          issues: codexRuntime?.issues || ['codex runtime unavailable'],
        };
      }
      return { ok: true, issues: [] };
    },
  };
}
