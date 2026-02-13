import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildMigrationWarnings,
  parseNextItems,
  parseRalphDoneItems,
  parseStatusSections,
  parseTaskRegistryInitiatives,
} from '../lib/legacy-parsers.mjs';

test('parseStatusSections returns expected heading sections', () => {
  const markdown = `# Status

## Current
- active baseline

## Ralph Wiggum loop
- Done (2026-02-12): shipped A

## Next
1. first thing
`;

  const parsed = parseStatusSections(markdown);
  assert.match(parsed.current, /active baseline/);
  assert.match(parsed.ralphLoop, /Done/);
  assert.match(parsed.next, /1\. first thing/);
});

test('parseRalphDoneItems returns only done bullet lines', () => {
  const done = parseRalphDoneItems(`
- Done (2026-02-12): one
- TODO: not done
- Done (2026-02-13): two
`);

  assert.deepEqual(done, ['Done (2026-02-12): one', 'Done (2026-02-13): two']);
});

test('parseNextItems parses bold and non-bold numbered lines', () => {
  const items = parseNextItems(`
1. **Alpha phase** - harden docs
2. Beta phase follow-up
`);

  assert.equal(items.length, 2);
  assert.equal(items[0].title, 'Alpha phase');
  assert.equal(items[0].description, 'harden docs');
  assert.equal(items[1].title, 'Beta phase follow-up');
});

test('parseTaskRegistryInitiatives parses markdown table rows', () => {
  const initiatives = parseTaskRegistryInitiatives(`
| id | title | impact | status |
|----|-------|--------|--------|
| one | Task One | Small | open |
| two | Task Two | Medium | done |
`);

  assert.deepEqual(
    initiatives.map((item) => item.id),
    ['one', 'two'],
  );
  assert.equal(initiatives[1].status, 'done');
});

test('buildMigrationWarnings reports missing key inputs', () => {
  const warnings = buildMigrationWarnings({
    status: { current: '', next: '' },
    nextItems: [],
    initiatives: [],
  });

  assert.ok(warnings.some((item) => item.code === 'STATUS_CURRENT_MISSING'));
  assert.ok(warnings.some((item) => item.code === 'STATUS_NEXT_MISSING'));
  assert.ok(warnings.some((item) => item.code === 'STATUS_NEXT_ITEMS_EMPTY'));
  assert.ok(warnings.some((item) => item.code === 'TASK_REGISTRY_TABLE_EMPTY'));
});
