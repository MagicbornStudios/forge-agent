import assert from 'node:assert/strict';
import test from 'node:test';

import { runReclaim } from '../commands/reclaim.mjs';

test('reclaim command dry-run does not invoke kill calls', async () => {
  let killCalls = 0;
  const result = await runReclaim(
    {
      scope: 'repo-studio',
      dryRun: true,
    },
    {
      loadConfig: async () => ({}),
      buildReclaimPlan: async () => ({
        ok: true,
        scope: 'repo-studio',
        force: false,
        dryRun: true,
        repoRoot: process.cwd(),
        knownPorts: [3010],
        targets: [
          {
            pid: 777,
            name: 'node',
            commandLine: '/repo/apps/repo-studio/node_modules/next dev -p 3010',
            repoOwned: true,
            repoStudioOwned: true,
            knownPorts: [3010],
            action: 'would-kill',
            reason: 'repo-studio',
          },
        ],
        skipped: [],
        inventory: { ok: true, processes: [] },
      }),
      stopProcessTree: async () => {
        killCalls += 1;
        return { ok: true, stdout: '', stderr: '' };
      },
      isProcessAlive: () => false,
    },
  );

  assert.equal(result.ok, true);
  assert.equal(result.dryRun, true);
  assert.equal(result.targetCount, 1);
  assert.equal(killCalls, 0);
});

test('reclaim command blocks repo scope without --force', async () => {
  const result = await runReclaim({
    scope: 'repo',
    dryRun: false,
    force: false,
  });

  assert.equal(result.ok, false);
  assert.match(String(result.message || ''), /requires --force/);
  assert.equal(Array.isArray(result.remediation), true);
  assert.equal(result.remediation.includes('forge-repo-studio reclaim --scope repo --force'), true);
});

test('reclaim command returns deterministic response shape', async () => {
  const result = await runReclaim(
    {
      scope: 'repo-studio',
      dryRun: true,
    },
    {
      loadConfig: async () => ({}),
      buildReclaimPlan: async () => ({
        ok: true,
        scope: 'repo-studio',
        force: false,
        dryRun: true,
        repoRoot: process.cwd(),
        knownPorts: [3010],
        targets: [],
        skipped: [],
        inventory: { ok: true, processes: [] },
      }),
    },
  );

  const requiredFields = [
    'ok',
    'scope',
    'force',
    'dryRun',
    'targetCount',
    'stoppedCount',
    'failedCount',
    'knownPorts',
    'targets',
    'stopped',
    'failed',
    'skipped',
    'clearedStateFiles',
    'message',
    'report',
  ];
  for (const field of requiredFields) {
    assert.equal(field in result, true, `missing field: ${field}`);
  }
});
