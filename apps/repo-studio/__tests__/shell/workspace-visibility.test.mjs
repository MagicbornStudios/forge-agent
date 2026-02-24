import assert from 'node:assert/strict';
import test from 'node:test';

import * as definitionsModule from '../../src/lib/app-shell/workspace-layout-definitions.ts';

const getWorkspaceLayoutDefinition = (
  definitionsModule.getWorkspaceLayoutDefinition
  || definitionsModule.default?.getWorkspaceLayoutDefinition
);
const sanitizeWorkspaceHiddenPanelIds = (
  definitionsModule.sanitizeWorkspaceHiddenPanelIds
  || definitionsModule.default?.sanitizeWorkspaceHiddenPanelIds
);

test('workspace hidden panel sanitization drops unknown panel ids', () => {
  assert.equal(typeof sanitizeWorkspaceHiddenPanelIds, 'function');
  const hidden = sanitizeWorkspaceHiddenPanelIds('planning', ['loop-cadence', 'unknown-panel']);
  assert.deepEqual(hidden, ['loop-cadence']);
});

test('workspace hidden panel sanitization keeps at least one main panel visible', () => {
  assert.equal(typeof getWorkspaceLayoutDefinition, 'function');
  const definition = getWorkspaceLayoutDefinition('review-queue');
  const hidden = sanitizeWorkspaceHiddenPanelIds('review-queue', definition.mainPanelIds);
  const hiddenSet = new Set(hidden);
  const visibleMainPanels = definition.mainPanelIds.filter((panelId) => !hiddenSet.has(panelId));

  assert.ok(visibleMainPanels.length > 0);
  assert.ok(visibleMainPanels.includes(definition.mainAnchorPanelId));
});
