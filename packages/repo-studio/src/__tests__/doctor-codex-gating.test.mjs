import assert from 'node:assert/strict';
import test from 'node:test';

import { evaluateDoctorCodexReadiness } from '../commands/doctor.mjs';

function makeCodexStatus(input = {}) {
  return {
    readiness: {
      codex: {
        enabled: input.enabled !== false,
      },
      cli: {
        installed: input.cliInstalled !== false,
      },
      login: {
        loggedIn: input.loggedIn === true,
        authType: input.authType || 'none',
      },
      ok: input.ready === true,
    },
  };
}

test('doctor default mode does not require codex login', () => {
  const codexStatus = makeCodexStatus({
    cliInstalled: true,
    loggedIn: false,
    authType: 'none',
    ready: false,
  });

  assert.equal(
    evaluateDoctorCodexReadiness(codexStatus, { requireCodexLogin: false }),
    true,
  );
});

test('doctor strict mode requires chatgpt login', () => {
  const codexStatus = makeCodexStatus({
    cliInstalled: true,
    loggedIn: false,
    authType: 'none',
    ready: false,
  });

  assert.equal(
    evaluateDoctorCodexReadiness(codexStatus, { requireCodexLogin: true }),
    false,
  );
});

test('doctor always fails when codex cli is missing', () => {
  const codexStatus = makeCodexStatus({
    cliInstalled: false,
    loggedIn: false,
  });

  assert.equal(
    evaluateDoctorCodexReadiness(codexStatus, { requireCodexLogin: false }),
    false,
  );
});
