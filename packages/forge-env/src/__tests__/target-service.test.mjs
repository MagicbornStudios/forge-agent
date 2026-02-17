import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const THIS_DIR = path.dirname(fileURLToPath(import.meta.url));
const CLI_PATH = path.resolve(THIS_DIR, '..', 'cli.mjs');

function mkTempRepo(prefix = 'forge-env-target-') {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function runCli(cwd, args) {
  return spawnSync('node', [CLI_PATH, ...args], {
    cwd,
    encoding: 'utf8',
  });
}

function parseJson(text) {
  try {
    return JSON.parse(String(text || '').trim());
  } catch {
    return null;
  }
}

test('target-read returns root snapshot with entries and readiness', () => {
  const tempDir = mkTempRepo();

  let result = runCli(tempDir, ['init', '--profile', 'forge-loop']);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  result = runCli(tempDir, ['target-read', 'root', '--mode', 'local', '--json']);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const payload = parseJson(result.stdout);
  assert.equal(payload?.ok, true);
  assert.equal(payload?.targetId, 'root');
  assert.equal(payload?.scope, 'root');
  assert.ok(Array.isArray(payload?.entries));
  assert.ok(payload.entries.length > 0);
  assert.ok(payload.readiness && typeof payload.readiness === 'object');
});

test('target-write rejects headless mode deterministically', () => {
  const tempDir = mkTempRepo();

  let result = runCli(tempDir, ['init', '--profile', 'forge-loop']);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  result = runCli(tempDir, [
    'target-write',
    'root',
    '--mode',
    'headless',
    '--values',
    '{"OPENAI_API_KEY":"abc"}',
    '--json',
  ]);
  assert.notEqual(result.status, 0);

  const payload = parseJson(result.stderr);
  assert.equal(payload?.ok, false);
  assert.match(String(payload?.message || ''), /read-only/i);
});

test('target-write mode mapping writes the expected mode-specific env files', () => {
  const tempDir = mkTempRepo();

  let result = runCli(tempDir, ['init', '--profile', 'forge-loop']);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  result = runCli(tempDir, [
    'target-write',
    'root',
    '--mode',
    'local',
    '--values',
    '{"LOCAL_KEY":"local-1"}',
    '--json',
  ]);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  result = runCli(tempDir, [
    'target-write',
    'root',
    '--mode',
    'preview',
    '--values',
    '{"PREVIEW_KEY":"preview-1"}',
    '--json',
  ]);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  result = runCli(tempDir, [
    'target-write',
    'root',
    '--mode',
    'production',
    '--values',
    '{"PROD_KEY":"prod-1"}',
    '--json',
  ]);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  assert.match(fs.readFileSync(path.join(tempDir, '.env.local'), 'utf8'), /LOCAL_KEY=local-1/);
  assert.match(fs.readFileSync(path.join(tempDir, '.env.development.local'), 'utf8'), /PREVIEW_KEY=preview-1/);
  assert.match(fs.readFileSync(path.join(tempDir, '.env.production.local'), 'utf8'), /PROD_KEY=prod-1/);
});
