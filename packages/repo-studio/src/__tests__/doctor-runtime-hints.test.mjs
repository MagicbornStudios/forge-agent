import assert from 'node:assert/strict';
import test from 'node:test';

import { buildDoctorRuntimeQuickActions } from '../commands/doctor.mjs';

test('doctor runtime quick actions include start commands when runtime is stopped', () => {
  const summary = buildDoctorRuntimeQuickActions({
    runtime: {
      running: false,
      state: null,
      stale: false,
    },
    portConflicts: [],
    linksEnabled: false,
  });

  const plain = summary.plainSectionLines.join('\n');
  assert.match(plain, /Runtime Quick Actions/);
  assert.match(plain, /pnpm dev:repo-studio/);
  assert.match(plain, /pnpm --filter @forge\/repo-studio-app dev/);
  assert.equal(summary.summaryStatus, 'info');
});

test('doctor runtime quick actions include url and stop command when runtime is running', () => {
  const summary = buildDoctorRuntimeQuickActions({
    runtime: {
      running: true,
      state: {
        mode: 'app',
        pid: 4242,
        port: 3010,
      },
      stale: false,
    },
    runtimeUrl: 'http://127.0.0.1:3010',
    portConflicts: [],
    linksEnabled: false,
  });

  const plain = summary.plainSectionLines.join('\n');
  assert.match(plain, /http:\/\/127\.0\.0\.1:3010/);
  assert.match(plain, /pnpm forge-repo-studio stop/);
  assert.equal(summary.summaryStatus, 'ok');
});
