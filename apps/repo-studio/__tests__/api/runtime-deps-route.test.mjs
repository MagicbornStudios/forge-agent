import assert from 'node:assert/strict';
import test from 'node:test';

import * as runtimeDepsRouteModule from '../../app/api/repo/runtime/deps/route.ts';
import * as runtimeDepsEvaluatorModule from '../../src/lib/runtime-deps-evaluator.ts';

const evaluateRuntimeDepsSnapshot = (
  runtimeDepsEvaluatorModule.evaluateRuntimeDepsSnapshot
  || runtimeDepsEvaluatorModule.default?.evaluateRuntimeDepsSnapshot
);
const GET = (
  runtimeDepsRouteModule.GET
  || runtimeDepsRouteModule.default?.GET
);

function makeDeps(overrides = {}) {
  return {
    dockviewPackageResolved: true,
    dockviewCssResolved: true,
    sharedStylesResolved: true,
    cssPackagesResolved: true,
    runtimePackagesResolved: true,
    ...overrides,
  };
}

test('runtime deps evaluator treats standalone as diagnostic-only and keeps runtime-ready state', () => {
  assert.equal(typeof evaluateRuntimeDepsSnapshot, 'function');
  const evaluated = evaluateRuntimeDepsSnapshot({
    deps: makeDeps(),
    desktop: {
      electronInstalled: true,
      sqlitePathWritable: true,
      watcherAvailable: true,
      nextStandalonePresent: false,
    },
  });

  assert.equal(evaluated.ok, true);
  assert.equal(evaluated.desktopRuntimeReady, true);
  assert.equal(evaluated.desktopStandaloneReady, false);
  assert.equal(evaluated.severity, 'warn');
});

test('runtime deps route returns HTTP 200 with additive readiness fields', async () => {
  assert.equal(typeof GET, 'function');
  const response = await GET();
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(typeof payload.ok, 'boolean');
  assert.equal(typeof payload.desktopRuntimeReady, 'boolean');
  assert.equal(typeof payload.desktopStandaloneReady, 'boolean');
  assert.equal(['ok', 'warn', 'fail'].includes(String(payload.severity)), true);
  assert.equal('deps' in payload, true);
  assert.equal('desktop' in payload, true);
  assert.equal('desktopAuth' in payload, true);
});
