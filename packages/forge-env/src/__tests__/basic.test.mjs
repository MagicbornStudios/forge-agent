import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const THIS_DIR = path.dirname(fileURLToPath(import.meta.url));
const CLI_PATH = path.resolve(THIS_DIR, '..', 'cli.mjs');

function mkTempRepo(prefix = 'forge-env-test-') {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function runCli(cwd, args) {
  return spawnSync('node', [CLI_PATH, ...args], {
    cwd,
    encoding: 'utf8',
  });
}

test('init maps generic alias to forge-loop', () => {
  const tempDir = mkTempRepo();
  const result = runCli(tempDir, ['init', '--profile', 'generic']);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const configPath = path.join(tempDir, '.forge-env', 'config.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  assert.equal(config.profile, 'forge-loop');
});

test('reconcile preserves unknown keys and existing non-empty values', () => {
  const tempDir = mkTempRepo();

  let result = runCli(tempDir, ['init', '--profile', 'forge-loop']);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  fs.writeFileSync(path.join(tempDir, '.env.local'), 'OPENROUTER_API_KEY=abc123\nLEGACY_KEY=legacy\n', 'utf8');
  fs.writeFileSync(path.join(tempDir, '.env.example'), 'OPENROUTER_API_KEY=\n', 'utf8');

  result = runCli(tempDir, ['reconcile', '--write', '--sync-examples']);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const envLocal = fs.readFileSync(path.join(tempDir, '.env.local'), 'utf8');
  assert.match(envLocal, /OPENROUTER_API_KEY=abc123/);
  assert.match(envLocal, /LEGACY_KEY=legacy/);
});

test('doctor headless passes when provider key exists in discovered env files', () => {
  const tempDir = mkTempRepo();

  let result = runCli(tempDir, ['init', '--profile', 'forge-loop']);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  fs.writeFileSync(path.join(tempDir, '.env'), 'OPENAI_API_KEY=key-from-env\n', 'utf8');

  result = runCli(tempDir, ['doctor', '--mode', 'headless', '--runner', 'openrouter', '--strict']);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /forge-env doctor/i);
});

test('doctor json includes workspace discovery diagnostics', () => {
  const tempDir = mkTempRepo();

  fs.writeFileSync(path.join(tempDir, 'pnpm-workspace.yaml'), 'packages:\n  - "apps/*"\n', 'utf8');
  fs.mkdirSync(path.join(tempDir, 'apps', 'sample'), { recursive: true });
  fs.writeFileSync(
    path.join(tempDir, 'apps', 'sample', 'package.json'),
    JSON.stringify({ name: '@sample/app', scripts: { dev: 'echo dev' } }, null, 2),
    'utf8',
  );
  fs.writeFileSync(path.join(tempDir, 'apps', 'sample', '.env.local'), 'SAMPLE_KEY=1\n', 'utf8');

  let result = runCli(tempDir, ['init', '--profile', 'forge-loop']);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  result = runCli(tempDir, ['doctor', '--json', '--mode', 'local']);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.ok, true);
  assert.ok(payload.discovery);
  assert.ok((payload.discovery.discoveredCount || 0) >= 1);
});

