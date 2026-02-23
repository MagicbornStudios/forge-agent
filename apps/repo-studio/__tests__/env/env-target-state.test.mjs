import assert from 'node:assert/strict';
import test from 'node:test';

import * as envTargetStateModule from '../../src/components/features/env/env-target-state.ts';

const deriveNextSelectedTargetId = (
  envTargetStateModule.deriveNextSelectedTargetId
  || envTargetStateModule.default?.deriveNextSelectedTargetId
);
const shouldResetTargetState = (
  envTargetStateModule.shouldResetTargetState
  || envTargetStateModule.default?.shouldResetTargetState
);

test('empty targets with already empty local state does not request reset', () => {
  assert.equal(typeof shouldResetTargetState, 'function');
  const reset = shouldResetTargetState({
    selectedTargetId: '',
    targetPayload: null,
    editedValues: {},
    hasTargets: false,
  });
  assert.equal(reset, false);
});

test('empty targets with dirty local state requests reset exactly once', () => {
  assert.equal(typeof shouldResetTargetState, 'function');
  const reset = shouldResetTargetState({
    selectedTargetId: 'apps/repo-studio/.env.local',
    targetPayload: {
      ok: true,
      targetId: 'apps/repo-studio/.env.local',
      profile: 'forge-agent',
      mode: 'local',
      scope: 'app',
      entries: [],
      readiness: { ok: true, missing: [], warnings: [] },
      warnings: [],
    },
    editedValues: { FOO: 'bar' },
    hasTargets: false,
  });
  assert.equal(reset, true);
});

test('deriveNextSelectedTargetId selects first available target when current id is invalid', () => {
  assert.equal(typeof deriveNextSelectedTargetId, 'function');
  const next = deriveNextSelectedTargetId(
    [
      { targetId: 'apps/repo-studio/.env.local' },
      { targetId: 'packages/repo-studio/.env.local' },
    ],
    'missing-target',
  );
  assert.equal(next, 'apps/repo-studio/.env.local');
});
