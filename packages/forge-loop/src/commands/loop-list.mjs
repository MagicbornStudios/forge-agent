import { LOOPS_INDEX_RELATIVE_PATH, loadLoopIndex } from '../lib/loops.mjs';

export async function runLoopList() {
  const index = loadLoopIndex();
  const rows = index.loops.map((loop) => ({
    ...loop,
    active: loop.id === index.activeLoopId,
  }));

  const report = [
    '# Forge Loop Loops',
    '',
    `index: ${LOOPS_INDEX_RELATIVE_PATH}`,
    '',
    '| ID | Name | Active | Planning Root | Profile | Runner | Scope |',
    '|---|---|---|---|---|---|---|',
    ...rows.map((row) => `| ${row.id} | ${row.name} | ${row.active ? 'yes' : 'no'} | ${row.planningRoot} | ${row.profile} | ${row.runner} | ${row.scope.join(', ')} |`),
    '',
    `Active loop: ${index.activeLoopId}`,
  ].join('\n');

  return {
    ok: true,
    indexPath: LOOPS_INDEX_RELATIVE_PATH,
    activeLoopId: index.activeLoopId,
    loops: rows,
    report: `${report}\n`,
  };
}

