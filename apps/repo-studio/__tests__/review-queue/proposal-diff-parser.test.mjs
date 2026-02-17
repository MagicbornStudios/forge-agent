import assert from 'node:assert/strict';
import test from 'node:test';

import * as diffParserModule from '../../src/lib/proposals/diff-parser.ts';

const parseProposalUnifiedDiff = (
  diffParserModule.parseProposalUnifiedDiff
  || diffParserModule.default?.parseProposalUnifiedDiff
);

test('parseProposalUnifiedDiff extracts deterministic file summaries', () => {
  assert.equal(typeof parseProposalUnifiedDiff, 'function');
  const diff = [
    'diff --git a/content/story/act-01/chapter-01/page-001.md b/content/story/act-01/chapter-01/page-001.md',
    '--- a/content/story/act-01/chapter-01/page-001.md',
    '+++ b/content/story/act-01/chapter-01/page-001.md',
    '@@ -1,2 +1,3 @@',
    ' # Page 001',
    '+New line',
    '-Old line',
    'diff --git a/content/story/act-01/chapter-01/page-002.md b/content/story/act-01/chapter-01/page-002.md',
    '--- a/content/story/act-01/chapter-01/page-002.md',
    '+++ b/content/story/act-01/chapter-01/page-002.md',
    '@@ -4,0 +4,2 @@',
    '+Added A',
    '+Added B',
  ].join('\n');

  const parsed = parseProposalUnifiedDiff({ diff });
  assert.equal(parsed.files.length, 2);
  assert.deepEqual(parsed.files.map((file) => file.path), [
    'content/story/act-01/chapter-01/page-001.md',
    'content/story/act-01/chapter-01/page-002.md',
  ]);
  assert.equal(parsed.files[0].additions, 1);
  assert.equal(parsed.files[0].deletions, 1);
  assert.equal(parsed.files[1].additions, 2);
  assert.equal(parsed.files[1].hunkCount, 1);
});

test('parseProposalUnifiedDiff falls back to provided file list when diff headers are absent', () => {
  const parsed = parseProposalUnifiedDiff({
    diff: 'No structured diff available for this proposal.',
    fallbackFiles: ['apps/repo-studio/src/lib/proposals/index.ts'],
  });
  assert.equal(parsed.files.length, 1);
  assert.equal(parsed.files[0].path, 'apps/repo-studio/src/lib/proposals/index.ts');
  assert.equal(parsed.files[0].hasPatch, true);
  assert.match(parsed.warnings[0], /Diff payload did not include file headers/i);
});
