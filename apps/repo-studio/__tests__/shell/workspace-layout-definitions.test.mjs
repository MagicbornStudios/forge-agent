import assert from 'node:assert/strict';
import test from 'node:test';

import * as appSpecModule from '../../src/lib/app-spec.generated.ts';

const WORKSPACE_IDS = appSpecModule.WORKSPACE_IDS || appSpecModule.default?.WORKSPACE_IDS || [];
const getWorkspaceLayoutDefinition = (
  appSpecModule.getWorkspaceLayoutDefinition
  || appSpecModule.default?.getWorkspaceLayoutDefinition
);
const getWorkspaceLayoutId = (
  appSpecModule.getWorkspaceLayoutId
  || appSpecModule.default?.getWorkspaceLayoutId
);
const getWorkspacePanelSpecs = (
  appSpecModule.getWorkspacePanelSpecs
  || appSpecModule.default?.getWorkspacePanelSpecs
);

test('workspace layout definitions keep valid main anchors and panel rails', () => {
  assert.equal(typeof getWorkspaceLayoutDefinition, 'function');
  assert.equal(typeof getWorkspaceLayoutId, 'function');
  assert.equal(typeof getWorkspacePanelSpecs, 'function');
  assert.ok(Array.isArray(WORKSPACE_IDS));

  for (const workspaceId of WORKSPACE_IDS) {
    const definition = getWorkspaceLayoutDefinition(workspaceId);
    const panelSpecs = getWorkspacePanelSpecs(workspaceId);
    const mainPanelIds = panelSpecs.filter((panel) => panel.rail === 'main').map((panel) => panel.id);
    const panelIds = panelSpecs.map((panel) => panel.id);

    assert.equal(definition.workspaceId, workspaceId);
    assert.equal(definition.layoutId, getWorkspaceLayoutId(workspaceId));
    assert.ok(mainPanelIds.length > 0, `${workspaceId} should include at least one main panel`);
    assert.ok(mainPanelIds.includes(definition.mainAnchorPanelId), `${workspaceId} should include anchor in main rail`);
    assert.deepEqual(definition.mainPanelIds, mainPanelIds);
    assert.equal(panelIds.length, new Set(panelIds).size, `${workspaceId} should not duplicate panel ids`);
  }
});

test('story workspace is no longer statically generated in built-in app-spec', () => {
  assert.ok(Array.isArray(WORKSPACE_IDS));
  assert.ok(WORKSPACE_IDS.includes('extensions'));
  assert.ok(!WORKSPACE_IDS.includes('story'));
});
