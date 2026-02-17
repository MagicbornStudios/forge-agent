import path from 'node:path';

import { PLANNING_FILES, PLANNING_PROMPTS_DIR } from '../lib/paths.mjs';
import { fileExists, readText, writeText } from '../lib/fs-utils.mjs';
import { getAutoCommitEnabled, getCommitScope, loadPlanningConfig } from '../lib/config.mjs';
import { assertCommitResult, commitPaths, formatArtifactCommitMessage } from '../lib/git.mjs';
import { askLine } from '../lib/prompting.mjs';
import { ensurePhaseDir, findPhase } from '../lib/planning.mjs';
import { enrichStageResult } from '../lib/runtime/results.mjs';
import { createStageRunnerContext, finalizeStageRunnerContext } from '../lib/runtime/stage-runner.mjs';

function makeContextBody({ phase, desiredOutcome, constraints, nonGoals }) {
  const decisions = [
    desiredOutcome ? `- Desired outcome: ${desiredOutcome}` : '- Desired outcome: use roadmap goal as baseline.',
    constraints ? `- Constraints: ${constraints}` : '- Constraints: none specified.',
    nonGoals ? `- Non-goals: ${nonGoals}` : '- Non-goals: none specified.',
  ].join('\n');

  return `# Phase ${phase.phaseNumber}: ${phase.name} - Context\n\n**Gathered:** ${new Date().toISOString()}\n**Status:** Ready for planning\n\n## Phase Boundary\n\n${phase.goal || 'No explicit goal recorded in roadmap.'}\n\n## Implementation Decisions\n\n${decisions}\n\n## Implementation Discretion\n\n- Specific implementation details not explicitly constrained above.\n\n## Deferred Ideas\n\n- Capture new capabilities in ROADMAP instead of expanding phase scope.\n`;
}

function makeDiscussPromptPack({ phase, contextPath }) {
  return `# Forge Loop Discuss Prompt - Phase ${phase.phaseNumber}\n\nUse this prompt with a coding agent or manual execution to prepare planning context.\n\n## Inputs\n- Roadmap phase: ${phase.phaseNumber} - ${phase.name}\n- Goal: ${phase.goal || 'N/A'}\n- Requirements: ${(phase.requirements || []).join(', ') || 'N/A'}\n- Context file: ${path.relative(process.cwd(), contextPath).replace(/\\/g, '/')}\n\n## Task\n1. Review context decisions and verify scope boundaries.\n2. Identify ambiguities that require clarifying assumptions.\n3. Prepare a plan draft with explicit must-haves.\n`;
}

async function collectPromptPackInputs(options) {
  const providedNotes = String(options.notes || '').trim();

  if (options.nonInteractive === true) {
    return {
      desiredOutcome: providedNotes || 'Capture phase intent from roadmap and continue with deterministic defaults.',
      constraints: '',
      nonGoals: '',
    };
  }

  const desiredOutcome = providedNotes || (await askLine('Describe desired outcome for this phase (optional): ', ''));
  const constraints = await askLine('List constraints for this phase (optional): ', '');
  const nonGoals = await askLine('List non-goals for this phase (optional): ', '');

  return {
    desiredOutcome,
    constraints,
    nonGoals,
  };
}

function buildStagePrompt(phase) {
  return [
    `Phase ${phase.phaseNumber}: ${phase.name}`,
    `Goal: ${phase.goal || 'N/A'}`,
    'Summarize desired outcome, constraints, and non-goals for planning context.',
    'Respond in concise bullet points.',
  ].join('\n');
}

export async function runDiscussPhase(phaseNumber, options = {}) {
  if (!fileExists(PLANNING_FILES.roadmap)) {
    throw new Error('ROADMAP.md not found. Run forge-loop new-project first.');
  }

  const roadmap = readText(PLANNING_FILES.roadmap, '');
  const phase = findPhase(roadmap, phaseNumber);
  if (!phase) {
    throw new Error(`Phase ${phaseNumber} not found in .planning/ROADMAP.md`);
  }

  const config = loadPlanningConfig();
  const runtime = createStageRunnerContext({
    config,
    requestedRunner: options.runner,
    phaseNumber: phase.phaseNumber,
    stage: 'discuss',
    keepSession: options.keepRuntimeSession === true,
  });

  const phaseDirInfo = ensurePhaseDir(phase.phaseNumber, phase.name);
  const contextPath = path.join(phaseDirInfo.fullPath, `${phase.phaseNumber}-CONTEXT.md`);
  const promptPackPath = path.join(PLANNING_PROMPTS_DIR, `${phase.phaseNumber}-discuss-prompt.md`);
  const artifactsWritten = [contextPath, promptPackPath];

  const taskResults = [];
  let desiredOutcome = '';
  let constraints = '';
  let nonGoals = '';

  if (runtime.runnerSelected === 'prompt-pack') {
    const inputs = await collectPromptPackInputs(options);
    desiredOutcome = inputs.desiredOutcome;
    constraints = inputs.constraints;
    nonGoals = inputs.nonGoals;

    taskResults.push({
      taskId: `discuss-${phase.phaseNumber}`,
      status: 'completed',
      reason: 'prompt-pack context capture completed.',
      filesTouched: [contextPath, promptPackPath],
    });
  } else {
    const turn = await runtime.provider.runDiscuss({
      prompt: buildStagePrompt(phase),
      metadata: {
        phase: phase.phaseNumber,
        stage: 'discuss',
      },
      writer: runtime.writer,
    });

    desiredOutcome = String(options.notes || '').trim() || turn.text || 'Captured by automated stage runner.';
    constraints = '';
    nonGoals = '';

    taskResults.push({
      taskId: `discuss-${phase.phaseNumber}`,
      status: turn.ok ? 'completed' : 'blocked',
      reason: turn.reason || null,
      filesTouched: Array.isArray(turn.filesTouched) ? turn.filesTouched : [],
    });
  }

  writeText(contextPath, makeContextBody({ phase, desiredOutcome, constraints, nonGoals }));
  writeText(promptPackPath, makeDiscussPromptPack({ phase, contextPath }));

  const commitFiles = [contextPath, promptPackPath].map((filePath) => path.relative(process.cwd(), filePath).replace(/\\/g, '/'));
  if (options.autoCommit ?? getAutoCommitEnabled(config)) {
    const commitResult = commitPaths(
      process.cwd(),
      formatArtifactCommitMessage(`capture phase ${phase.phaseNumber} context`),
      commitFiles,
      { commitScope: getCommitScope(config), allowOutOfScope: options.allowOutOfScope === true },
    );
    assertCommitResult(commitResult, `discuss-phase ${phase.phaseNumber}`);
  }

  const result = enrichStageResult({
    phase,
    contextPath,
    promptPackPath,
    runnerUsed: runtime.runnerSelected,
    taskResults,
    artifactsWritten,
    nextAction: `forge-loop plan-phase ${phase.phaseNumber}`,
    status: taskResults.every((item) => item.status === 'completed') ? 'ready_for_plan' : 'blocked',
  });

  await finalizeStageRunnerContext(runtime, {
    ok: result.status !== 'blocked',
    status: result.status,
    nextAction: result.nextAction,
    taskResults: result.taskResults,
  });

  return result;
}
