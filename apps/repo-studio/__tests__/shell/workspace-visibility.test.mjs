import assert from 'node:assert/strict';
import test from 'node:test';

import * as appSpecModule from '../../src/lib/app-spec.generated.ts';

const getWorkspaceLayoutDefinition = (
  appSpecModule.getWorkspaceLayoutDefinition
  || appSpecModule.default?.getWorkspaceLayoutDefinition
);
const sanitizeWorkspaceHiddenPanelIds = (
  appSpecModule.sanitizeWorkspaceHiddenPanelIds
  || appSpecModule.default?.sanitizeWorkspaceHiddenPanelIds
);

test('workspace hidden panel sanitization drops unknown panel ids', () => {
  assert.equal(typeof sanitizeWorkspaceHiddenPanelIds, 'function');
  const hidden = sanitizeWorkspaceHiddenPanelIds('planning', ['assistant', 'unknown-panel']);
  assert.deepEqual(hidden, ['assistant']);
});

test('workspace hidden panel sanitization keeps at least one main panel visible', () => {
  assert.equal(typeof getWorkspaceLayoutDefinition, 'function');
  const definition = getWorkspaceLayoutDefinition('git');
  const hidden = sanitizeWorkspaceHiddenPanelIds('git', definition.mainPanelIds);
  const hiddenSet = new Set(hidden);
  const visibleMainPanels = definition.mainPanelIds.filter((panelId) => !hiddenSet.has(panelId));

  assert.ok(visibleMainPanels.length > 0);
  assert.ok(visibleMainPanels.includes(definition.mainAnchorPanelId));
});

test('workspace hidden panel sanitization does not allow viewport to be hidden', () => {
  const hidden = sanitizeWorkspaceHiddenPanelIds('code', ['viewport', 'assistant']);

  assert.ok(!hidden.includes('viewport'));
  assert.ok(hidden.includes('assistant'));
});
