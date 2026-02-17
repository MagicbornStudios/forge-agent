import { runDiscussPhase } from './discuss-phase.mjs';
import { runExecutePhase } from './execute-phase.mjs';
import { runPlanPhase } from './plan-phase.mjs';
import { runProgress } from './progress.mjs';
import { runSyncLegacy } from './sync-legacy.mjs';
import { runVerifyWork } from './verify-work.mjs';

const VALID_MODES = new Set(['discuss', 'plan', 'execute', 'verify', 'full']);

function normalizeMode(value) {
  const mode = String(value || 'full').trim().toLowerCase();
  return VALID_MODES.has(mode) ? mode : 'full';
}

function parsePhaseFromNextAction(nextAction) {
  const match = /(?:discuss-phase|plan-phase|execute-phase|verify-work)\s+(\d+)/i.exec(String(nextAction || ''));
  if (!match) return null;
  return String(match[1]).padStart(2, '0');
}

async function resolvePhaseNumber(explicitPhase) {
  if (explicitPhase != null) {
    return String(explicitPhase).padStart(2, '0');
  }

  const progress = await runProgress();
  return parsePhaseFromNextAction(progress?.nextAction) || '01';
}

function createStages(mode, phaseNumber, options = {}) {
  const stageOptions = {
    runner: options.runner,
    allowOutOfScope: options.allowOutOfScope === true,
  };

  if (mode === 'discuss') {
    return [{
      key: 'discuss',
      label: `Discuss phase ${phaseNumber}`,
      run: () => runDiscussPhase(phaseNumber, {
        notes: options.notes || 'Interactive loop discussion context.',
        nonInteractive: true,
        ...stageOptions,
      }),
    }];
  }

  if (mode === 'plan') {
    return [{
      key: 'plan',
      label: `Plan phase ${phaseNumber}`,
      run: () => runPlanPhase(phaseNumber, {
        skipResearch: options.skipResearch === true,
        gaps: options.gaps === true,
        ...stageOptions,
      }),
    }];
  }

  if (mode === 'execute') {
    return [{
      key: 'execute',
      label: `Execute phase ${phaseNumber}`,
      run: () => runExecutePhase(phaseNumber, {
        nonInteractive: true,
        headless: options.headless === true,
        gapsOnly: options.gapsOnly === true,
        ...stageOptions,
      }),
    }];
  }

  if (mode === 'verify') {
    return [{
      key: 'verify',
      label: `Verify phase ${phaseNumber}`,
      run: () => runVerifyWork(phaseNumber, {
        nonInteractive: true,
        headless: options.headless === true,
        strict: options.strict !== false,
        ...stageOptions,
      }),
    }];
  }

  return [
    {
      key: 'progress-start',
      label: 'Progress snapshot (start)',
      run: () => runProgress(),
    },
    {
      key: 'discuss',
      label: `Discuss phase ${phaseNumber}`,
      run: () => runDiscussPhase(phaseNumber, {
        notes: options.notes || 'Interactive loop discussion context.',
        nonInteractive: true,
        ...stageOptions,
      }),
    },
    {
      key: 'plan',
      label: `Plan phase ${phaseNumber}`,
      run: () => runPlanPhase(phaseNumber, {
        skipResearch: options.skipResearch === true,
        gaps: options.gaps === true,
        ...stageOptions,
      }),
    },
    {
      key: 'execute',
      label: `Execute phase ${phaseNumber}`,
      run: () => runExecutePhase(phaseNumber, {
        nonInteractive: true,
        headless: options.headless === true,
        gapsOnly: options.gapsOnly === true,
        ...stageOptions,
      }),
    },
    {
      key: 'verify',
      label: `Verify phase ${phaseNumber}`,
      run: () => runVerifyWork(phaseNumber, {
        nonInteractive: true,
        headless: options.headless === true,
        strict: options.strict !== false,
        ...stageOptions,
      }),
    },
    {
      key: 'progress-end',
      label: 'Progress snapshot (end)',
      run: () => runProgress(),
    },
    {
      key: 'sync',
      label: 'Sync legacy artifacts',
      run: () => runSyncLegacy({
        force: options.forceSync === true,
        ...stageOptions,
      }),
    },
  ];
}

async function runStages(stageList) {
  const results = [];

  for (const stage of stageList) {
    try {
      const result = await stage.run();
      const ok = result?.ok !== false;
      results.push({
        key: stage.key,
        label: stage.label,
        ok,
        result,
      });

      if (!ok) {
        return {
          ok: false,
          failed: {
            key: stage.key,
            message: result?.message || `${stage.key} failed.`,
            result,
          },
          stageResults: results,
        };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      results.push({
        key: stage.key,
        label: stage.label,
        ok: false,
        result: null,
      });
      return {
        ok: false,
        failed: {
          key: stage.key,
          message,
          result: null,
        },
        stageResults: results,
      };
    }
  }

  return {
    ok: true,
    failed: null,
    stageResults: results,
  };
}

export async function runInteractive(options = {}) {
  const mode = normalizeMode(options.mode);
  const phaseNumber = await resolvePhaseNumber(options.phase);
  const runner = String(options.runner || 'auto').trim().toLowerCase() || 'auto';
  const stages = createStages(mode, phaseNumber, options);

  if (options.json === true) {
    const execution = await runStages(stages);
    return {
      ok: execution.ok,
      status: execution.ok ? 'complete' : 'failed',
      mode,
      phaseNumber,
      runner,
      stageResults: execution.stageResults,
      failed: execution.failed,
      nextAction: execution.ok ? 'forge-loop progress' : `Fix ${execution.failed?.key || 'interactive'} and retry` ,
    };
  }

  const { runInteractiveTui } = await import('../tui/index.mjs');
  const result = await runInteractiveTui({
    title: 'Forge Loop Interactive',
    runner,
    mode,
    phaseNumber,
    steps: stages,
  });

  return {
    ok: result.ok,
    status: result.ok ? 'complete' : 'failed',
    mode,
    phaseNumber,
    runner,
    stageResults: result.stageResults,
    failed: result.failed,
    nextAction: result.ok ? 'forge-loop progress' : `Fix ${result.failed?.key || 'interactive'} and retry`,
  };
}
