import assert from 'node:assert/strict';
import test from 'node:test';

import { mkTempRepo, runCli } from './helpers.mjs';

test('doctor validates planning artifacts and reports next action', () => {
  const tempDir = mkTempRepo('forge-loop-doctor-');

  let result = runCli(tempDir, ['new-project', '--fresh']);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  result = runCli(tempDir, ['doctor']);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /Forge Loop Doctor/i);
  assert.match(result.stdout, /Next action: forge-loop progress/i);
});
