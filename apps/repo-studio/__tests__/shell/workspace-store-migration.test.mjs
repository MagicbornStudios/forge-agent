import assert from 'node:assert/strict';
import test from 'node:test';

import * as storeModule from '../../src/lib/app-shell/store.ts';
import * as definitionsModule from '../../src/lib/app-shell/workspace-layout-definitions.ts';

const LEGACY_REPO_STUDIO_LAYOUT_ID = (
  storeModule.LEGACY_REPO_STUDIO_LAYOUT_ID
  || storeModule.default?.LEGACY_REPO_STUDIO_LAYOUT_ID
);
const migrateRepoStudioShellPersistedState = (
  storeModule.migrateRepoStudioShellPersistedState
  || storeModule.default?.migrateRepoStudioShellPersistedState
);
const getWorkspaceLayoutId = (
  definitionsModule.getWorkspaceLayoutId
  || definitionsModule.default?.getWorkspaceLayoutId
);

test('legacy hidden panel ids migrate into active workspace with sanitization', () => {
  assert.equal(typeof migrateRepoStudioShellPersistedState, 'function');
  const migrated = migrateRepoStudioShellPersistedState({
    route: {
      activeWorkspaceId: 'story',
      openWorkspaceIds: ['story'],
    },
    hiddenPanelIds: ['loop-assistant', 'unknown-panel'],
  }, 3);

  assert.deepEqual(migrated.workspaceHiddenPanelIds.story, ['loop-assistant']);
  assert.deepEqual(migrated.hiddenPanelIds, ['loop-assistant']);
});

test('legacy single-layout key migrates into active workspace layout id', () => {
  assert.equal(typeof getWorkspaceLayoutId, 'function');
  assert.equal(typeof LEGACY_REPO_STUDIO_LAYOUT_ID, 'string');
  const activeLayoutId = getWorkspaceLayoutId('code');
  const migrated = migrateRepoStudioShellPersistedState({
    route: {
      activeWorkspaceId: 'code',
      openWorkspaceIds: ['code'],
    },
    dockLayouts: {
      [LEGACY_REPO_STUDIO_LAYOUT_ID]: '{\"layout\":\"legacy\"}',
    },
  }, 3);

  assert.equal(migrated.dockLayouts?.[activeLayoutId], '{\"layout\":\"legacy\"}');
  assert.equal(migrated.dockLayouts?.[LEGACY_REPO_STUDIO_LAYOUT_ID], undefined);
});
