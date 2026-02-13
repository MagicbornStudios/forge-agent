import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import { validatePlanFrontmatter } from '../lib/validators.mjs';
import {
  mkTempRepo,
  planningPhaseDir,
  readFile,
  runCli,
} from './helpers.mjs';

test('plan-phase creates plan files with required frontmatter fields', () => {
  const tempDir = mkTempRepo('forge-loop-plan-phase-');

  let result = runCli(tempDir, ['new-project', '--fresh']);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  result = runCli(tempDir, ['plan-phase', '1', '--skip-research']);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const phaseDir = planningPhaseDir(tempDir, '01-');
  assert.ok(phaseDir, 'phase directory not found');

  const planFiles = fs
    .readdirSync(phaseDir)
    .filter((name) => name.endsWith('-PLAN.md'))
    .sort();

  assert.equal(planFiles.length >= 2, true, `expected at least 2 plan files, got ${planFiles.length}`);

  for (const planFile of planFiles) {
    const content = readFile(path.join(phaseDir, planFile));
    const validation = validatePlanFrontmatter(content);
    assert.equal(validation.valid, true, `${planFile} invalid: ${validation.errors.join('; ')}`);
  }
});

