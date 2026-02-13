import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const THIS_DIR = path.dirname(fileURLToPath(import.meta.url));

export const FORGE_AGENT_ROOT = path.resolve(THIS_DIR, '..', '..', '..', '..');
export const FORGE_LOOP_CLI = path.join(FORGE_AGENT_ROOT, 'packages', 'forge-loop', 'src', 'cli.mjs');

export function mkTempRepo(prefix = 'forge-loop-test-') {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

export function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

export function writeFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf8');
}

export function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

export function runCli(cwd, args, options = {}) {
  const env = { ...process.env, ...(options.env || {}) };
  return spawnSync(process.execPath, [FORGE_LOOP_CLI, ...args], {
    cwd,
    env,
    encoding: 'utf8',
  });
}

export function hasGit() {
  const result = spawnSync('git', ['--version'], { encoding: 'utf8' });
  return result.status === 0;
}

export function runGit(cwd, args) {
  return spawnSync('git', args, {
    cwd,
    encoding: 'utf8',
  });
}

export function initGitRepo(cwd) {
  let result = runGit(cwd, ['init']);
  if (result.status !== 0) throw new Error(`git init failed: ${result.stderr}`);

  result = runGit(cwd, ['config', 'user.email', 'forge-loop-tests@example.local']);
  if (result.status !== 0) throw new Error(`git config user.email failed: ${result.stderr}`);

  result = runGit(cwd, ['config', 'user.name', 'Forge Loop Tests']);
  if (result.status !== 0) throw new Error(`git config user.name failed: ${result.stderr}`);
}

export function writeLegacyArtifacts(cwd) {
  const legacyDir = path.join(cwd, 'docs', 'agent-artifacts', 'core');
  ensureDir(legacyDir);

  writeFile(
    path.join(legacyDir, 'STATUS.md'),
    `# Status

## Current
- Stable component baseline for docs and platform updates.

## Ralph Wiggum loop
- Done (2026-02-12): Migrated component docs index.
- Done (2026-02-12): Stabilized editor shell slots.

## Next
1. **Forge loop bootstrap** - Create planning source of truth.
2. **Platform docs alignment** - Align docs structure with product direction.
3. **Verification matrix hardening** - Ensure commands run by changed paths.
`,
  );

  writeFile(
    path.join(legacyDir, 'task-registry.md'),
    `# Task registry

| id | title | impact | status |
|----|-------|--------|--------|
| loop-bootstrap | Forge loop bootstrap | Medium | open |
| docs-alignment | Platform docs alignment | Medium | open |
`,
  );

  writeFile(
    path.join(legacyDir, 'decisions.md'),
    `# Decisions

## Source of truth
- \`.planning\` will own planning lifecycle artifacts.
`,
  );

  writeFile(
    path.join(legacyDir, 'errors-and-attempts.md'),
    `# Errors and Attempts

## Avoid dual ownership
- Do not keep two writable planning systems in parallel.
`,
  );
}

export function planningPhaseDir(cwd, phasePrefix = '01-') {
  const phasesDir = path.join(cwd, '.planning', 'phases');
  const entries = fs.readdirSync(phasesDir, { withFileTypes: true });
  const phaseDir = entries.find((entry) => entry.isDirectory() && entry.name.startsWith(phasePrefix));
  if (!phaseDir) return null;
  return path.join(phasesDir, phaseDir.name);
}
