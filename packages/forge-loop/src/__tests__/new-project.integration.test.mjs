import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import {
  mkTempRepo,
  readFile,
  runCli,
  writeLegacyArtifacts,
} from './helpers.mjs';

test('new-project migrates legacy docs into .planning tree', () => {
  const tempDir = mkTempRepo('forge-loop-new-project-migrate-');
  writeLegacyArtifacts(tempDir);

  const result = runCli(tempDir, ['new-project']);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const expectedFiles = [
    '.planning/PROJECT.md',
    '.planning/REQUIREMENTS.md',
    '.planning/ROADMAP.md',
    '.planning/STATE.md',
    '.planning/DECISIONS.md',
    '.planning/ERRORS.md',
    '.planning/TASK-REGISTRY.md',
    '.planning/TEMP-REFACTOR-BACKLOG.md',
    '.planning/config.json',
    '.planning/migration-report.json',
  ];

  for (const relPath of expectedFiles) {
    assert.equal(fs.existsSync(path.join(tempDir, relPath)), true, `missing ${relPath}`);
  }

  const report = JSON.parse(readFile(path.join(tempDir, '.planning', 'migration-report.json')));
  assert.equal(typeof report.counts.doneItems, 'number');
  assert.equal(typeof report.counts.nextItems, 'number');
  assert.equal(report.sources.status.path.replace(/\\/g, '/'), 'docs/agent-artifacts/core/STATUS.md');
  assert.equal(typeof report.sources.status.mtime, 'string');
});

test('new-project on existing .planning reports guidance and does not overwrite', () => {
  const tempDir = mkTempRepo('forge-loop-new-project-rerun-');
  writeLegacyArtifacts(tempDir);

  let result = runCli(tempDir, ['new-project', '--fresh']);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const projectPath = path.join(tempDir, '.planning', 'PROJECT.md');
  const sentinel = '\nSENTINEL_KEEP_THIS_LINE\n';
  fs.appendFileSync(projectPath, sentinel, 'utf8');

  result = runCli(tempDir, ['new-project']);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /\.planning already exists/i);

  const content = readFile(projectPath);
  assert.match(content, /SENTINEL_KEEP_THIS_LINE/);
});

test('new-project supports generic profile', () => {
  const tempDir = mkTempRepo('forge-loop-new-project-generic-');
  const result = runCli(tempDir, ['new-project', '--fresh', '--profile', 'generic']);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const configPath = path.join(tempDir, '.planning', 'config.json');
  const config = JSON.parse(readFile(configPath));
  assert.equal(config.verification.profile, 'generic');
});
