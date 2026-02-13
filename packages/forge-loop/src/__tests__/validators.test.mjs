import assert from 'node:assert/strict';
import test from 'node:test';

import {
  parsePlanFrontmatterYaml,
  parsePlanWave,
  validatePlanFrontmatter,
  validateWaveOrdering,
} from '../lib/validators.mjs';

const VALID_PLAN = `---
phase: 01-bootstrap
plan: 01
wave: 1
depends_on: []
files_modified: ['.planning/STATE.md']
autonomous: true
must_haves:
  truths:
    - "example truth"
  artifacts:
    - path: ".planning/phases/01-bootstrap/01-01-SUMMARY.md"
      provides: "summary"
      min_lines: 10
  key_links:
    - from: ".planning/ROADMAP.md"
      to: ".planning/phases/01-bootstrap/01-01-SUMMARY.md"
      via: "traceability"
---
`;

test('validatePlanFrontmatter accepts required schema', () => {
  const result = validatePlanFrontmatter(VALID_PLAN);
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
});

test('validatePlanFrontmatter fails missing required schema fields', () => {
  const result = validatePlanFrontmatter(`---
phase: 01-bootstrap
plan: 01
wave: 1
depends_on: []
files_modified: []
autonomous: true
must_haves:
  truths:
    - "truth only"
---
`);

  assert.equal(result.valid, false);
  assert.ok(result.errors.some((item) => item.includes('artifacts')));
  assert.ok(result.errors.some((item) => item.includes('key_links')));
});

test('parsePlanFrontmatterYaml returns typed values', () => {
  const parsed = parsePlanFrontmatterYaml(VALID_PLAN);
  assert.equal(parsed.ok, true);
  assert.equal(typeof parsed.data.wave, 'number');
  assert.equal(Array.isArray(parsed.data.depends_on), true);
  assert.equal(typeof parsed.data.autonomous, 'boolean');
});

test('validateWaveOrdering checks dependency graph and wave ordering', () => {
  const result = validateWaveOrdering([
    { id: '01-01', wave: 1, dependsOn: [] },
    { id: '01-02', wave: 2, dependsOn: ['01-01'] },
    { id: '01-03', wave: 2, dependsOn: ['01-99'] },
  ]);

  assert.equal(result.valid, false);
  assert.ok(result.issues.some((item) => item.includes('missing plan 01-99')));
});

test('parsePlanWave reads wave from frontmatter', () => {
  assert.equal(parsePlanWave(VALID_PLAN), 1);
  assert.equal(parsePlanWave('# No frontmatter'), 0);
});
