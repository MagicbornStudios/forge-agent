import assert from 'node:assert/strict';
import test from 'node:test';

import * as typesModule from '../../src/lib/types.ts';
import * as definitionsModule from '../../src/lib/app-shell/workspace-layout-definitions.ts';

const REPO_WORKSPACE_IDS = typesModule.REPO_WORKSPACE_IDS || typesModule.default?.REPO_WORKSPACE_IDS || [];
const getWorkspaceLayoutDefinition = (
  definitionsModule.getWorkspaceLayoutDefinition
  || definitionsModule.default?.getWorkspaceLayoutDefinition
);
const getWorkspaceLayoutId = (
  definitionsModule.getWorkspaceLayoutId
  || definitionsModule.default?.getWorkspaceLayoutId
);
const getWorkspacePanelSpecs = (
  definitionsModule.getWorkspacePanelSpecs
  || definitionsModule.default?.getWorkspacePanelSpecs
);

test('workspace layout definitions keep valid main anchors and panel rails', () => {
  assert.equal(typeof getWorkspaceLayoutDefinition, 'function');
  assert.equal(typeof getWorkspaceLayoutId, 'function');
  assert.equal(typeof getWorkspacePanelSpecs, 'function');
  assert.ok(Array.isArray(REPO_WORKSPACE_IDS));

  for (const workspaceId of REPO_WORKSPACE_IDS) {
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
