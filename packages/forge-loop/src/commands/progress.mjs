import path from 'node:path';

import { ACTIVE_LOOP_ID, PLANNING_DIR, PLANNING_FILES, PLANNING_PHASES_DIR } from '../lib/paths.mjs';
import { fileExists, readText } from '../lib/fs-utils.mjs';
import { parseRoadmapPhases, phaseDirName, getPhaseExecutionState } from '../lib/planning.mjs';

function progressBar(percent) {
  const clamped = Math.max(0, Math.min(100, percent));
  const filled = Math.round(clamped / 10);
  return `[${'#'.repeat(filled)}${'.'.repeat(10 - filled)}] ${clamped}%`;
}

export async function runProgress() {
  if (!fileExists(PLANNING_FILES.roadmap)) {
    throw new Error('ROADMAP.md not found. Run forge-loop new-project first.');
  }

  const roadmap = readText(PLANNING_FILES.roadmap, '');
  const phases = parseRoadmapPhases(roadmap);
  const addLoop = (command) => (
    ACTIVE_LOOP_ID && ACTIVE_LOOP_ID !== 'default'
      ? `${command} --loop ${ACTIVE_LOOP_ID}`
      : command
  );

  if (phases.length === 0) {
    return {
      status: 'empty',
      loopId: ACTIVE_LOOP_ID,
      planningRoot: PLANNING_DIR.replace(/\\/g, '/'),
      message: 'No phases found in roadmap.',
      nextAction: addLoop('forge-loop plan-phase 01'),
    };
  }

  const rows = phases.map((phase) => {
    const dirName = phaseDirName(phase.phaseNumber, phase.name);
    const fullDir = path.join(PLANNING_PHASES_DIR, dirName);
    const execution = getPhaseExecutionState(fullDir);

    let status = 'not-started';
    if (execution.planCount > 0 && execution.summaryCount === 0) status = 'planned';
    if (execution.summaryCount > 0 && !execution.complete) status = 'in-progress';
    if (execution.complete) status = 'complete';

    return {
      phaseNumber: phase.phaseNumber,
      phaseName: phase.name,
      goal: phase.goal || '',
      requirements: Array.isArray(phase.requirements) ? phase.requirements : [],
      status,
      plans: execution.planCount,
      summaries: execution.summaryCount,
      complete: execution.complete,
      incompletePlans: execution.incompletePlans.map((item) => path.basename(item)),
    };
  });

  const completed = rows.filter((item) => item.status === 'complete').length;
  const percent = Math.round((completed / rows.length) * 100);

  let nextAction = null;
  let nextReason = null;

  for (const row of rows) {
    if (row.status === 'not-started') {
      nextAction = addLoop(`forge-loop discuss-phase ${row.phaseNumber}`);
      nextReason = `Phase ${row.phaseNumber} has no plans yet.`;
      break;
    }

    if (row.status === 'planned' || row.status === 'in-progress') {
      nextAction = addLoop(`forge-loop execute-phase ${row.phaseNumber}`);
      nextReason = `Phase ${row.phaseNumber} has pending plan execution.`;
      break;
    }
  }

  if (!nextAction) {
    const lastPhase = rows[rows.length - 1].phaseNumber;
    nextAction = addLoop(`forge-loop verify-work ${lastPhase}`);
    nextReason = 'All known plans appear complete; verify latest phase outputs.';
  }

  const reportLines = [
    '# Forge Loop Progress',
    '',
    `Progress: ${progressBar(percent)}`,
    '',
    '| Phase | Status | Plans | Summaries |',
    '|---|---|---:|---:|',
    ...rows.map((row) => `| ${row.phaseNumber} - ${row.phaseName} | ${row.status} | ${row.plans} | ${row.summaries} |`),
    '',
    `Next: ${nextAction}`,
    nextReason ? `Reason: ${nextReason}` : '',
  ].filter(Boolean);

  return {
    status: 'ok',
    loopId: ACTIVE_LOOP_ID,
    planningRoot: PLANNING_DIR.replace(/\\/g, '/'),
    percent,
    completePhases: completed,
    totalPhases: rows.length,
    rows,
    nextAction,
    nextReason,
    report: `${reportLines.join('\n')}\n`,
  };
}
