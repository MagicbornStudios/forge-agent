import assert from 'node:assert/strict';
import test from 'node:test';

import { buildReclaimPlan } from '../lib/process-reclaim.mjs';

test('reclaim planner safe scope targets repo-studio/codex only', async () => {
  const plan = await buildReclaimPlan({
    scope: 'repo-studio',
    dryRun: true,
    force: false,
    repoRoot: '/repo',
    inventory: {
      ok: true,
      processes: [
        {
          pid: 100,
          name: 'node',
          commandLine: '/repo/apps/repo-studio/node_modules/next dev -p 3010',
          repoOwned: true,
          repoStudioOwned: true,
          knownPorts: [3010],
        },
        {
          pid: 101,
          name: 'node',
          commandLine: '/repo/apps/studio/node_modules/next dev -p 3000',
          repoOwned: true,
          repoStudioOwned: false,
          knownPorts: [3000],
        },
        {
          pid: 103,
          name: 'node',
          commandLine: '/repo/node_modules/.pnpm/next@15/node_modules/next/dist/server/lib/start-server.js',
          repoOwned: true,
          repoStudioOwned: false,
          knownPorts: [3010],
        },
        {
          pid: 102,
          name: 'node',
          commandLine: '/repo/node_modules/.pnpm/@openai+codex@0.104.0/node_modules/@openai/codex/bin/codex.js app-server',
          repoOwned: true,
          repoStudioOwned: true,
          knownPorts: [],
        },
      ],
    },
    trackedPids: [102],
    excludePids: [],
  });

  assert.deepEqual(plan.targets.map((item) => item.pid), [100, 102, 103]);
  assert.equal(plan.targets.every((item) => item.repoOwned), true);
});

test('reclaim planner repo scope includes repo runtime sweep and protects excluded pids', async () => {
  const protectedPid = 550;
  const plan = await buildReclaimPlan({
    scope: 'repo',
    dryRun: false,
    force: true,
    repoRoot: '/repo',
    inventory: {
      ok: true,
      processes: [
        {
          pid: protectedPid,
          name: 'node',
          commandLine: '/repo/apps/studio/node_modules/next dev -p 3000',
          repoOwned: true,
          repoStudioOwned: false,
          knownPorts: [3000],
        },
        {
          pid: 560,
          name: 'electron',
          commandLine: '/repo/packages/repo-studio/src/desktop/main.mjs',
          repoOwned: true,
          repoStudioOwned: true,
          knownPorts: [3020],
        },
      ],
    },
    trackedPids: [],
    excludePids: [protectedPid],
  });

  assert.equal(plan.knownPorts.includes(3000), true);
  assert.equal(plan.targets.some((item) => item.pid === 560), true);
  assert.equal(plan.targets.some((item) => item.pid === protectedPid), false);
  assert.equal(plan.skipped.some((item) => item.pid === protectedPid && item.reason === 'protected-pid'), true);
});
