import assert from 'node:assert/strict';
import test from 'node:test';

import searchInput from '../../src/lib/search-input.ts';

const { parseRepoSearchInput } = searchInput;

test('parseRepoSearchInput reads q/scope/include/exclude values', () => {
  const url = new URL(
    'http://localhost/api/repo/search?q=RepoStudio&scope=loop&loopId=default&include=apps/*,packages/*&exclude=node_modules/*',
  );
  const parsed = parseRepoSearchInput(url);

  assert.equal(parsed.query, 'RepoStudio');
  assert.equal(parsed.scope, 'loop');
  assert.equal(parsed.loopId, 'default');
  assert.deepEqual(parsed.include, ['apps/*', 'packages/*']);
  assert.deepEqual(parsed.exclude, ['node_modules/*']);
  assert.equal(parsed.regex, false);
});

test('parseRepoSearchInput validates regex queries', () => {
  const url = new URL('http://localhost/api/repo/search?q=(unclosed&regex=1');
  assert.throws(() => parseRepoSearchInput(url), /Invalid regex/i);
});

test('parseRepoSearchInput rejects unsafe glob patterns', () => {
  const url = new URL('http://localhost/api/repo/search?q=foo&include=../secret/*');
  assert.throws(() => parseRepoSearchInput(url), /Invalid include pattern/i);
});
