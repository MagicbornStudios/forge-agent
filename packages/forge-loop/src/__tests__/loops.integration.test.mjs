import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';

import {
  mkTempRepo,
  readFile,
  runCli,
} from './helpers.mjs';

function parseJson(stdout, stderr) {
  const text = String(stdout || '').trim() || String(stderr || '').trim();
  return JSON.parse(text);
}

test('loop:new creates loop scaffold and loop:use + --loop drive progress routing', () => {
  const tempDir = mkTempRepo('forge-loop-multi-loop-');

  let result = runCli(tempDir, ['new-project', '--fresh']);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  result = runCli(tempDir, [
    'loop:new',
    'pkg-platform',
    '--name',
    'Platform Loop',
    '--scope',
    'apps/platform,packages/ui',
    '--profile',
    'forge-agent',
    '--runner',
    'codex',
    '--json',
  ]);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const created = parseJson(result.stdout, result.stderr);
  assert.equal(created.loopId, 'pkg-platform');
  assert.equal(created.planningRoot, '.planning/loops/pkg-platform');

  const loopProjectPath = path.join(tempDir, '.planning', 'loops', 'pkg-platform', 'PROJECT.md');
  const loopConfigPath = path.join(tempDir, '.planning', 'loops', 'pkg-platform', 'config.json');
  assert.equal(readFile(loopProjectPath).includes('Platform Loop'), true);
  assert.equal(JSON.parse(readFile(loopConfigPath)).env.profile, 'forge-agent');

  result = runCli(tempDir, ['progress', '--loop', 'pkg-platform', '--json']);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const progressExplicit = parseJson(result.stdout, result.stderr);
  assert.equal(progressExplicit.loopId, 'pkg-platform');
  assert.equal(progressExplicit.planningRoot, '.planning/loops/pkg-platform');

  result = runCli(tempDir, ['loop:use', 'pkg-platform']);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  result = runCli(tempDir, ['progress', '--json']);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const progressActive = parseJson(result.stdout, result.stderr);
  assert.equal(progressActive.loopId, 'pkg-platform');
  assert.equal(progressActive.planningRoot, '.planning/loops/pkg-platform');

  result = runCli(tempDir, ['loop:list', '--json']);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const list = parseJson(result.stdout, result.stderr);
  assert.equal(list.activeLoopId, 'pkg-platform');
  assert.equal(Array.isArray(list.loops), true);
  assert.equal(list.loops.some((item) => item.id === 'default'), true);
  assert.equal(list.loops.some((item) => item.id === 'pkg-platform'), true);
});

