import { getRuntimeSettings } from '../config.mjs';
import {
  RUNNER_AUTO,
  RUNNER_CODEX,
  RUNNER_PROMPT_PACK,
  normalizeRunner,
} from './contracts.mjs';

export function resolveRuntimeRunner({
  config,
  requestedRunner,
  codexReadiness,
} = {}) {
  const runtime = getRuntimeSettings(config);
  const requested = requestedRunner ? normalizeRunner(requestedRunner) : null;
  const configured = normalizeRunner(runtime.mode || RUNNER_PROMPT_PACK);
  const preferred = requested || configured;
  const codexFallbackEnabled = runtime.codex.execFallbackAllowed === true;

  const selectPromptPack = (reason = null) => ({
    runnerSelected: RUNNER_PROMPT_PACK,
    fallbackReason: reason,
    codexFallbackEnabled,
    runtime,
    codexReadiness: codexReadiness || null,
  });

  if (preferred === RUNNER_PROMPT_PACK) return selectPromptPack();

  const codexReady = codexReadiness?.ok === true;
  if (preferred === RUNNER_CODEX) {
    if (codexReady) {
      return {
        runnerSelected: RUNNER_CODEX,
        fallbackReason: null,
        codexFallbackEnabled,
        runtime,
        codexReadiness: codexReadiness || null,
      };
    }

    if (codexFallbackEnabled) {
      return selectPromptPack('codex_unavailable_fallback_to_prompt_pack');
    }

    throw new Error('Codex runner requested but runtime readiness check failed.');
  }

  if (preferred === RUNNER_AUTO) {
    if (codexReady) {
      return {
        runnerSelected: RUNNER_CODEX,
        fallbackReason: null,
        codexFallbackEnabled,
        runtime,
        codexReadiness: codexReadiness || null,
      };
    }
    return selectPromptPack(codexFallbackEnabled ? 'auto_fallback_to_prompt_pack' : 'auto_no_codex_readiness');
  }

  return selectPromptPack('unknown_runner_default_prompt_pack');
}
