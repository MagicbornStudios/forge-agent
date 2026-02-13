import path from 'node:path';

import { PLANNING_FILES, PLANNING_PROMPTS_DIR } from '../lib/paths.mjs';
import { fileExists, readText, writeText } from '../lib/fs-utils.mjs';
import { getAutoCommitEnabled, getCommitScope, loadPlanningConfig } from '../lib/config.mjs';
import { assertCommitResult, commitPaths, formatArtifactCommitMessage } from '../lib/git.mjs';
import { askLine } from '../lib/prompting.mjs';
import { ensurePhaseDir, findPhase } from '../lib/planning.mjs';

export async function runDiscussPhase(phaseNumber, options = {}) {
  if (!fileExists(PLANNING_FILES.roadmap)) {
    throw new Error('ROADMAP.md not found. Run forge-loop new-project first.');
  }

  const roadmap = readText(PLANNING_FILES.roadmap, '');
  const phase = findPhase(roadmap, phaseNumber);
  if (!phase) {
    throw new Error(`Phase ${phaseNumber} not found in .planning/ROADMAP.md`);
  }

  const phaseDirInfo = ensurePhaseDir(phase.phaseNumber, phase.name);
  const contextPath = path.join(phaseDirInfo.fullPath, `${phase.phaseNumber}-CONTEXT.md`);
  const promptPackPath = path.join(PLANNING_PROMPTS_DIR, `${phase.phaseNumber}-discuss-prompt.md`);

  const providedNotes = String(options.notes || '').trim();

  const desiredOutcome = providedNotes || (await askLine('Describe desired outcome for this phase (optional): ', ''));
  const constraints = await askLine('List constraints for this phase (optional): ', '');
  const nonGoals = await askLine('List non-goals for this phase (optional): ', '');

  const decisions = [
    desiredOutcome ? `- Desired outcome: ${desiredOutcome}` : '- Desired outcome: use roadmap goal as baseline.',
    constraints ? `- Constraints: ${constraints}` : '- Constraints: none specified.',
    nonGoals ? `- Non-goals: ${nonGoals}` : '- Non-goals: none specified.',
  ].join('\n');

  const contextBody = `# Phase ${phase.phaseNumber}: ${phase.name} - Context\n\n**Gathered:** ${new Date().toISOString()}\n**Status:** Ready for planning\n\n## Phase Boundary\n\n${phase.goal || 'No explicit goal recorded in roadmap.'}\n\n## Implementation Decisions\n\n${decisions}\n\n## Implementation Discretion\n\n- Specific implementation details not explicitly constrained above.\n\n## Deferred Ideas\n\n- Capture new capabilities in ROADMAP instead of expanding phase scope.\n`;

  writeText(contextPath, contextBody);

  const promptPack = `# Forge Loop Discuss Prompt - Phase ${phase.phaseNumber}\n\nUse this prompt with a coding agent or manual execution to prepare planning context.\n\n## Inputs\n- Roadmap phase: ${phase.phaseNumber} - ${phase.name}\n- Goal: ${phase.goal || 'N/A'}\n- Requirements: ${(phase.requirements || []).join(', ') || 'N/A'}\n- Context file: ${path.relative(process.cwd(), contextPath).replace(/\\/g, '/')}\n\n## Task\n1. Review context decisions and verify scope boundaries.\n2. Identify ambiguities that require clarifying assumptions.\n3. Prepare a plan draft with explicit must-haves.\n`;

  writeText(promptPackPath, promptPack);

  const commitFiles = [contextPath, promptPackPath].map((filePath) => path.relative(process.cwd(), filePath).replace(/\\/g, '/'));
  const config = loadPlanningConfig();
  if (options.autoCommit ?? getAutoCommitEnabled(config)) {
    const commitResult = commitPaths(
      process.cwd(),
      formatArtifactCommitMessage(`capture phase ${phase.phaseNumber} context`),
      commitFiles,
      { commitScope: getCommitScope(config), allowOutOfScope: options.allowOutOfScope === true },
    );
    assertCommitResult(commitResult, `discuss-phase ${phase.phaseNumber}`);
  }

  return {
    phase,
    contextPath,
    promptPackPath,
  };
}
