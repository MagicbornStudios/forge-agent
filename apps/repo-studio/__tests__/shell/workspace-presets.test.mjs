import assert from 'node:assert/strict';
import test from 'node:test';

import * as presetsModule from '../../src/lib/app-shell/workspace-presets.ts';
import * as storeModule from '../../src/lib/app-shell/store.ts';

const getWorkspacePreset = (
  presetsModule.getWorkspacePreset
  || presetsModule.default?.getWorkspacePreset
);
const getWorkspaceVisiblePanelIds = (
  presetsModule.getWorkspaceVisiblePanelIds
  || presetsModule.default?.getWorkspaceVisiblePanelIds
);
const getWorkspaceHiddenPanelIds = (
  presetsModule.getWorkspaceHiddenPanelIds
  || presetsModule.default?.getWorkspaceHiddenPanelIds
);
const migrateRepoStudioShellPersistedState = (
  storeModule.migrateRepoStudioShellPersistedState
  || storeModule.default?.migrateRepoStudioShellPersistedState
);

test('workspace presets keep the configured main anchor visible', () => {
  assert.equal(typeof getWorkspacePreset, 'function');
  assert.equal(typeof getWorkspaceVisiblePanelIds, 'function');
  assert.equal(typeof getWorkspaceHiddenPanelIds, 'function');

  const preset = getWorkspacePreset('commands');
  const visible = getWorkspaceVisiblePanelIds('commands');
  const hidden = getWorkspaceHiddenPanelIds('commands');

  assert.equal(visible.includes(preset.mainAnchorPanelId), true);
  assert.equal(hidden.includes(preset.mainAnchorPanelId), false);
});

test('legacy hidden-panel migration is mapped into active workspace state', () => {
  assert.equal(typeof migrateRepoStudioShellPersistedState, 'function');
  const migrated = migrateRepoStudioShellPersistedState({
    route: {
      activeWorkspaceId: 'story',
      openWorkspaceIds: ['story'],
    },
    hiddenPanelIds: ['loop-cadence', 'docs'],
  }, 2);

  assert.equal(migrated.route.activeWorkspaceId, 'story');
  assert.deepEqual(migrated.workspaceHiddenPanelIds.story, ['loop-cadence', 'docs']);
  assert.deepEqual(migrated.hiddenPanelIds, ['loop-cadence', 'docs']);
});
