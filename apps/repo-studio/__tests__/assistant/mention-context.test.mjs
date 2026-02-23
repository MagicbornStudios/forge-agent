import assert from 'node:assert/strict';
import test from 'node:test';

import * as mentionContextModule from '../../src/lib/assistant/mention-context.ts';

const parsePlanningMentions = (
  mentionContextModule.parsePlanningMentions
  || mentionContextModule.default?.parsePlanningMentions
);
const resolvePlanningMentionContext = (
  mentionContextModule.resolvePlanningMentionContext
  || mentionContextModule.default?.resolvePlanningMentionContext
);

const DOCS = [
  {
    id: 'core:STATE.md',
    title: 'STATE.md',
    filePath: '.planning/STATE.md',
    content: 'state content',
    category: 'core',
  },
  {
    id: 'phase:phase-01/PLAN.md',
    title: 'phase-01/PLAN.md',
    filePath: '.planning/phases/phase-01/PLAN.md',
    content: 'A'.repeat(5000),
    category: 'phase',
  },
];

test('parsePlanningMentions extracts unique planning mentions', () => {
  assert.equal(typeof parsePlanningMentions, 'function');
  const parsed = parsePlanningMentions('check @planning/core:STATE.md and @planning/core:STATE.md');
  assert.deepEqual(parsed, ['core:state.md']);
});

test('resolvePlanningMentionContext ignores unknown mentions and clips long docs', () => {
  assert.equal(typeof resolvePlanningMentionContext, 'function');
  const resolved = resolvePlanningMentionContext({
    text: 'Use @planning/phase:phase-01/plan.md and @planning/missing-doc',
    docs: DOCS,
    maxDocChars: 120,
    maxTotalChars: 160,
  });

  assert.equal(resolved.resolved.length, 1);
  assert.equal(resolved.resolved[0].mention, 'phase:phase-01/plan.md');
  assert.equal(resolved.resolved[0].clipped, true);
  assert.deepEqual(resolved.ignored, ['missing-doc']);
  assert.match(resolved.contextBlock, /Mentioned Planning Context/);
  assert.match(resolved.contextBlock, /\.\.\.\[clipped\]/);
});
