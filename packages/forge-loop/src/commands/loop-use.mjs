import {
  LOOPS_INDEX_RELATIVE_PATH,
  loadLoopIndex,
  resolveLoopSelection,
  writeLoopIndex,
} from '../lib/loops.mjs';

export async function runLoopUse(loopId) {
  const requested = String(loopId || '').trim().toLowerCase();
  if (!requested) {
    throw new Error('loop:use requires a loop id. Example: forge-loop loop:use default');
  }

  const current = loadLoopIndex();
  const selected = resolveLoopSelection(requested);
  if (current.activeLoopId !== selected.loopId) {
    writeLoopIndex({
      ...current,
      activeLoopId: selected.loopId,
    });
  }

  return {
    ok: true,
    activeLoopId: selected.loopId,
    planningRoot: selected.planningRoot,
    indexPath: LOOPS_INDEX_RELATIVE_PATH,
    report: `Active loop set to "${selected.loopId}" (${selected.planningRoot}).\n`,
  };
}

