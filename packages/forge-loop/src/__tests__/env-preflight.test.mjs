import assert from 'node:assert/strict';
import test from 'node:test';

import { shouldRunHeadlessEnvGate } from '../lib/env-preflight.mjs';

test('headless env gate runs only when headless flag is set', () => {
  const config = {
    env: {
      enabled: true,
      enforceHeadless: true,
    },
  };

  assert.equal(shouldRunHeadlessEnvGate(config, { nonInteractive: true }), false);
  assert.equal(shouldRunHeadlessEnvGate(config, { headless: true }), true);
});

test('headless env gate respects env enabled and enforce flags', () => {
  assert.equal(
    shouldRunHeadlessEnvGate({ env: { enabled: false, enforceHeadless: true } }, { headless: true }),
    false,
  );

  assert.equal(
    shouldRunHeadlessEnvGate({ env: { enabled: true, enforceHeadless: false } }, { headless: true }),
    false,
  );
});
