import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import { buildVerificationCommandPlan } from '../commands/verify-work.mjs';
import {
  mkTempRepo,
  planningPhaseDir,
  readFile,
  runCli,
} from './helpers.mjs';

test('buildVerificationCommandPlan selects matrix commands by changed paths', () => {
  const commands = buildVerificationCommandPlan(
    {
      verification: {
        docs: true,
        build: true,
        tests: true,
      },
    },
    ['apps/docs/content/docs/components/index.mdx', 'packages/shared/src/index.ts'],
  );

  const rendered = commands.map((item) => `${item.command} ${item.args.join(' ')}`);
  assert.ok(rendered.includes('pnpm docs:platform:doctor'));
  assert.ok(rendered.includes('pnpm docs:showcase:doctor'));
  assert.ok(rendered.includes('pnpm docs:runtime:doctor'));
  assert.ok(rendered.includes('pnpm --filter @forge/platform build'));
  assert.ok(rendered.includes('pnpm --filter @forge/studio build'));
  assert.ok(!rendered.includes('pnpm --filter @forge/repo-studio-app build'));
  assert.ok(rendered.includes('pnpm --filter @forge/studio test -- --runInBand'));
  assert.ok(rendered.includes('pnpm forge-loop:test'));
});

test('buildVerificationCommandPlan adds repo-studio build for repo-studio app changes only', () => {
  const commands = buildVerificationCommandPlan(
    {
      verification: {
        docs: true,
        build: true,
        tests: true,
      },
    },
    ['apps/repo-studio/src/components/RepoStudioRoot.tsx'],
  );

  const rendered = commands.map((item) => `${item.command} ${item.args.join(' ')}`);
  assert.ok(rendered.includes('pnpm --filter @forge/repo-studio-app build'));
  assert.ok(!rendered.includes('pnpm --filter @forge/studio build'));
  assert.ok(!rendered.includes('pnpm --filter @forge/studio test -- --runInBand'));
});

test('buildVerificationCommandPlan supports forge-loop profile', () => {
  const commands = buildVerificationCommandPlan(
    {
      verification: {
        profile: 'forge-loop',
        tests: true,
        genericCommands: ['echo custom-check'],
      },
    },
    ['src/index.ts'],
  );

  const rendered = commands.map((item) => `${item.command} ${item.args.join(' ')}`);
  assert.deepEqual(rendered, ['pnpm forge-loop:test', 'echo custom-check']);
});

test('verify-work emits expected check matrix in command output', () => {
  const tempDir = mkTempRepo('forge-loop-verify-work-');

  let result = runCli(tempDir, ['new-project', '--fresh']);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  result = runCli(tempDir, ['plan-phase', '1', '--skip-research']);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const phaseDir = planningPhaseDir(tempDir, '01-');
  assert.ok(phaseDir, 'phase directory not found');

  const firstPlan = fs
    .readdirSync(phaseDir)
    .filter((name) => name.endsWith('-PLAN.md'))
    .sort()[0];
  assert.ok(firstPlan, 'first plan file not found');

  const firstPlanPath = path.join(phaseDir, firstPlan);
  const planContent = readFile(firstPlanPath).replace(
    'files_modified: []',
    "files_modified: ['apps/docs/content/docs/components/index.mdx', 'packages/shared/src/index.ts']",
  );
  fs.writeFileSync(firstPlanPath, planContent, 'utf8');

  const configPath = path.join(tempDir, '.planning', 'config.json');
  const config = JSON.parse(readFile(configPath));
  config.verification = { ...(config.verification || {}), strictDefault: false };
  fs.writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`, 'utf8');

  result = runCli(tempDir, ['verify-work', '1', '--non-interactive']);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  assert.match(result.stdout, /pnpm docs:platform:doctor/i);
  assert.match(result.stdout, /pnpm docs:showcase:doctor/i);
  assert.match(result.stdout, /pnpm docs:runtime:doctor/i);
  assert.match(result.stdout, /pnpm --filter @forge\/platform build/i);
  assert.match(result.stdout, /pnpm --filter @forge\/studio build/i);
  assert.match(result.stdout, /pnpm --filter @forge\/studio test -- --runInBand/i);
  assert.match(result.stdout, /pnpm forge-loop:test/i);

  const uatPath = path.join(phaseDir, '01-UAT.md');
  const uatContent = readFile(uatPath);
  assert.match(uatContent, /result: skipped/i);
});

test('verify-work --strict exits non-zero when checks fail', () => {
  const tempDir = mkTempRepo('forge-loop-verify-work-strict-');

  let result = runCli(tempDir, ['new-project', '--fresh']);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  result = runCli(tempDir, ['plan-phase', '1', '--skip-research']);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  result = runCli(tempDir, ['verify-work', '1', '--non-interactive', '--strict']);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}\n${result.stdout}`, /Verification failed in strict mode/i);
});
