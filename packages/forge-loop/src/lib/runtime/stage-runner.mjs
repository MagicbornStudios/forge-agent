import { getRuntimeSettings } from '../config.mjs';
import { evaluateCodexRuntimeReadiness } from '../codex/cli-status.mjs';
import { createCodexProvider, stopCodexProviderSession } from './provider-codex.mjs';
import { createPromptPackProvider } from './provider-prompt-pack.mjs';
import { resolveRuntimeRunner } from './resolver.mjs';
import { createRunEventWriter } from './results.mjs';

function isPromptPack(runner) {
  return String(runner || '').trim().toLowerCase() === 'prompt-pack';
}

export function createStageRunnerContext({
  config,
  requestedRunner,
  phaseNumber,
  stage,
  keepSession = false,
} = {}) {
  const runtimeSettings = getRuntimeSettings(config);
  const codexReadiness = evaluateCodexRuntimeReadiness(runtimeSettings);
  const selection = resolveRuntimeRunner({
    config,
    requestedRunner,
    codexReadiness,
  });

  const provider = isPromptPack(selection.runnerSelected)
    ? createPromptPackProvider()
    : createCodexProvider(runtimeSettings);

  const writer = createRunEventWriter({
    phaseNumber,
    stage,
    runner: selection.runnerSelected,
  });
  writer.write('stage-start', {
    stage,
    runner: selection.runnerSelected,
    fallbackReason: selection.fallbackReason,
    mode: runtimeSettings.mode,
  });

  return {
    ...selection,
    runtimeSettings,
    codexReadiness,
    provider,
    writer,
    keepSession,
  };
}

export async function finalizeStageRunnerContext(context, result = {}) {
  context?.writer?.write('stage-finish', {
    ok: result?.ok !== false,
    status: result?.status || null,
    nextAction: result?.nextAction || null,
    taskResultCount: Array.isArray(result?.taskResults) ? result.taskResults.length : 0,
  });

  if (!context?.keepSession && !isPromptPack(context?.runnerSelected)) {
    await stopCodexProviderSession();
  }
}
