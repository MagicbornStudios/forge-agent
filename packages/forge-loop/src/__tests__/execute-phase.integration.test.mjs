import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import {
  mkTempRepo,
  planningPhaseDir,
  readFile,
  runCli,
} from './helpers.mjs';

function countTaskLineOccurrences(summaryContent, taskNumber) {
  const matcher = new RegExp(`^- \\[[ x]\\] ${taskNumber}\\. `, 'gm');
  return [...summaryContent.matchAll(matcher)].length;
}

test('execute-phase summary upserts tasks and remains idempotent on rerun', () => {
  const tempDir = mkTempRepo('forge-loop-execute-idempotent-');

  let result = runCli(tempDir, ['new-project', '--fresh']);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  result = runCli(tempDir, ['plan-phase', '1', '--skip-research']);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  result = runCli(tempDir, ['execute-phase', '1', '--non-interactive']);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  result = runCli(tempDir, ['execute-phase', '1', '--non-interactive']);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const phaseDir = planningPhaseDir(tempDir, '01-');
  assert.ok(phaseDir, 'phase directory not found');

  const summaryFiles = fs.readdirSync(phaseDir).filter((name) => name.endsWith('-SUMMARY.md')).sort();
  assert.equal(summaryFiles.length > 0, true, 'expected at least one summary file');

  const content = readFile(path.join(phaseDir, summaryFiles[0]));
  assert.equal(countTaskLineOccurrences(content, '01'), 1);
  assert.equal(countTaskLineOccurrences(content, '02'), 1);
  assert.equal(countTaskLineOccurrences(content, '03'), 1);
});
