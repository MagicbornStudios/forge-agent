import assert from 'node:assert/strict';
import test from 'node:test';

import { parsePlanningMarkdown, parsePlanningPlanDoc } from '../core/parsers/planning.mjs';

test('parsePlanningMarkdown extracts frontmatter, sections, and checklists', () => {
  const markdown = [
    '---',
    'phase: 07-structured-parsers-and-story-publish-pipeline',
    'plan: 01',
    'wave: 1',
    'depends_on:',
    '  - 07-00',
    'files_modified:',
    '  - apps/repo-studio/src/lib/planning/*',
    'must_haves:',
    '  truths:',
    '    - deterministic parser output',
    '  artifacts:',
    '    - path: ".planning/phases/07/07-01-SUMMARY.md"',
    '      provides: "summary"',
    '  key_links:',
    '    - from: ".planning/ANALYSIS-REFERENCES.md"',
    '      to: "repo_studio_analysis/PRD.md"',
    '      via: "traceability"',
    '---',
    '',
    '<objective>',
    'Parse planning docs.',
    '</objective>',
    '',
    '<context>',
    'Use analysis docs.',
    '</context>',
    '',
    '<tasks>',
    '- [ ] Implement parser',
    '- [x] Add tests',
    '</tasks>',
    '',
    '## Notes',
    'Secondary heading content.',
  ].join('\n');

  const parsed = parsePlanningMarkdown(markdown);
  assert.equal(parsed.frontmatter.phase, '07-structured-parsers-and-story-publish-pipeline');
  assert.equal(parsed.sections.objective, 'Parse planning docs.');
  assert.equal(parsed.sections.context, 'Use analysis docs.');
  assert.match(parsed.sections.tasks, /Implement parser/);
  assert.equal(parsed.checklists.total, 2);
  assert.equal(parsed.checklists.open, 1);
  assert.equal(parsed.checklists.closed, 1);
  assert.equal(parsed.warnings.length, 0);
});

test('parsePlanningPlanDoc normalizes required plan metadata', () => {
  const markdown = [
    '---',
    'phase: 07-structured-parsers-and-story-publish-pipeline',
    'plan: 4',
    'wave: 4',
    'depends_on:',
    '  - 07-03',
    'files_modified:',
    '  - apps/repo-studio/src/lib/story/*',
    'must_haves:',
    '  truths:',
    '    - approval-gated apply',
    '  artifacts:',
    '    - path: ".planning/phases/07/07-04-SUMMARY.md"',
    '      provides: "closeout"',
    '  key_links:',
    '    - from: ".planning/ANALYSIS-REFERENCES.md"',
    '      to: "repo_studio_analysis/DECISIONS.md"',
    '      via: "phase traceability"',
    '---',
    '',
    '<objective>Close phase.</objective>',
  ].join('\n');

  const parsed = parsePlanningPlanDoc(markdown);
  assert.equal(parsed.phase, '07-structured-parsers-and-story-publish-pipeline');
  assert.equal(parsed.plan, '04');
  assert.equal(parsed.wave, 4);
  assert.deepEqual(parsed.dependsOn, ['07-03']);
  assert.deepEqual(parsed.filesModified, ['apps/repo-studio/src/lib/story/*']);
  assert.equal(parsed.mustHaves.truths.length, 1);
  assert.equal(parsed.mustHaves.artifacts.length, 1);
  assert.equal(parsed.mustHaves.keyLinks.length, 1);
  assert.equal(parsed.warnings.length, 0);
});
