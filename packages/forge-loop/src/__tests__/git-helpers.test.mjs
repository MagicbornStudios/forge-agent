import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import {
  assertCommitResult,
  commitPaths,
  formatArtifactCommitMessage,
  formatTaskCommitMessage,
  formatVerificationCommitMessage,
  isInCommitScope,
} from '../lib/git.mjs';
import {
  hasGit,
  initGitRepo,
  mkTempRepo,
  runGit,
  writeFile,
} from './helpers.mjs';

test('commit message formatters follow contract', () => {
  assert.equal(formatTaskCommitMessage('01', '02', '03', 'Implement step'), 'feat(phase-01 plan-02 task-03): Implement step');
  assert.equal(formatArtifactCommitMessage('sync artifacts'), 'docs(forge-loop): sync artifacts');
  assert.equal(formatVerificationCommitMessage('01'), 'test(phase-01): verification report');
});

test('commitPaths skips when repository is not git', () => {
  const tempDir = mkTempRepo('forge-loop-non-git-');
  const filePath = path.join(tempDir, 'a.txt');
  writeFile(filePath, 'hello');

  const result = commitPaths(tempDir, 'docs(forge-loop): no-op', ['a.txt']);
  assert.equal(result.committed, false);
  assert.equal(result.skipped, true);
  assert.equal(result.reason, 'not-a-git-repo');
});

test('commitPaths skips when no tracked changes are present', { skip: !hasGit() }, () => {
  const tempDir = mkTempRepo('forge-loop-git-nochanges-');
  initGitRepo(tempDir);

  writeFile(path.join(tempDir, 'tracked.txt'), 'v1');
  let result = runGit(tempDir, ['add', '.']);
  assert.equal(result.status, 0, result.stderr);
  result = runGit(tempDir, ['commit', '-m', 'init']);
  assert.equal(result.status, 0, result.stderr);

  const commitResult = commitPaths(tempDir, 'docs(forge-loop): should skip', ['tracked.txt']);
  assert.equal(commitResult.committed, false);
  assert.equal(commitResult.skipped, true);
  assert.equal(commitResult.reason, 'no-changes');

  fs.rmSync(tempDir, { recursive: true, force: true });
});

test('isInCommitScope matches allowed glob patterns', () => {
  assert.equal(isInCommitScope('.planning/STATE.md', ['.planning/**']), true);
  assert.equal(isInCommitScope('docs/agent-artifacts/core/STATUS.md', ['docs/agent-artifacts/core/**']), true);
  assert.equal(isInCommitScope('apps/studio/app/page.tsx', ['.planning/**']), false);
});

test('commitPaths blocks out-of-scope files when commitScope is set', { skip: !hasGit() }, () => {
  const tempDir = mkTempRepo('forge-loop-git-scope-');
  initGitRepo(tempDir);

  writeFile(path.join(tempDir, '.planning', 'STATE.md'), 'state');
  writeFile(path.join(tempDir, 'apps', 'studio', 'page.tsx'), 'export default null;');

  const result = commitPaths(
    tempDir,
    'docs(forge-loop): scoped commit',
    ['.planning/STATE.md', 'apps/studio/page.tsx'],
    { commitScope: ['.planning/**'] },
  );

  assert.equal(result.committed, false);
  assert.equal(result.reason, 'out-of-scope-files');
  assert.ok(result.outOfScope.includes('apps/studio/page.tsx'));

  fs.rmSync(tempDir, { recursive: true, force: true });
});

test('commitPaths blocks staged files outside commit scope', { skip: !hasGit() }, () => {
  const tempDir = mkTempRepo('forge-loop-git-staged-scope-');
  initGitRepo(tempDir);

  writeFile(path.join(tempDir, '.planning', 'STATE.md'), 'state');
  writeFile(path.join(tempDir, 'apps', 'studio', 'index.ts'), 'export const x = 1;');

  let result = runGit(tempDir, ['add', '--', 'apps/studio/index.ts']);
  assert.equal(result.status, 0, result.stderr);

  const commitResult = commitPaths(
    tempDir,
    'docs(forge-loop): scoped commit',
    ['.planning/STATE.md'],
    { commitScope: ['.planning/**'] },
  );

  assert.equal(commitResult.committed, false);
  assert.equal(commitResult.reason, 'staged-out-of-scope-files');
  assert.ok(commitResult.outOfScope.includes('apps/studio/index.ts'));

  fs.rmSync(tempDir, { recursive: true, force: true });
});

test('assertCommitResult throws on failed commit result', () => {
  assert.throws(
    () => assertCommitResult({ committed: false, skipped: false, reason: 'git-commit-failed', stderr: 'boom' }, 'unit-test'),
    /unit-test: git-commit-failed/i,
  );
});
