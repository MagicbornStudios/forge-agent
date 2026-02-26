import assert from 'node:assert/strict';
import test from 'node:test';

import * as registryModule from '../../src/lib/settings/registry.ts';
import * as appSpecModule from '../../src/lib/app-spec.generated.ts';

const buildRepoSettingsDefaultsFromRegistry = (
  registryModule.buildRepoSettingsDefaultsFromRegistry
  || registryModule.default?.buildRepoSettingsDefaultsFromRegistry
);
const REPO_SETTINGS_GENERATED_DEFAULTS = (
  appSpecModule.REPO_SETTINGS_GENERATED_DEFAULTS
  || appSpecModule.default?.REPO_SETTINGS_GENERATED_DEFAULTS
);

test('repo-studio settings defaults stay deterministic against registry declarations', () => {
  assert.equal(typeof buildRepoSettingsDefaultsFromRegistry, 'function');
  assert.ok(REPO_SETTINGS_GENERATED_DEFAULTS);
  const fromRegistry = buildRepoSettingsDefaultsFromRegistry();

  assert.deepEqual(fromRegistry.env, REPO_SETTINGS_GENERATED_DEFAULTS.env);
  assert.deepEqual(fromRegistry.commands, {
    confirmRuns: REPO_SETTINGS_GENERATED_DEFAULTS.commands.confirmRuns,
  });
  assert.deepEqual(fromRegistry.reviewQueue, {
    trustMode: REPO_SETTINGS_GENERATED_DEFAULTS.reviewQueue.trustMode,
    autoApplyEnabled: REPO_SETTINGS_GENERATED_DEFAULTS.reviewQueue.autoApplyEnabled,
    lastAutoApplyAt: REPO_SETTINGS_GENERATED_DEFAULTS.reviewQueue.lastAutoApplyAt,
  });
  assert.equal(REPO_SETTINGS_GENERATED_DEFAULTS.commands.view.sort, 'id');
});
