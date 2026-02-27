import assert from 'node:assert/strict';
import test from 'node:test';

import * as viewportModule from '@forge/shared/components/workspace';

const resolveViewportOpenIds = (
  viewportModule.resolveViewportOpenIds
  || viewportModule.default?.resolveViewportOpenIds
);
const resolveViewportActiveId = (
  viewportModule.resolveViewportActiveId
  || viewportModule.default?.resolveViewportActiveId
);
const resolveViewportCloseState = (
  viewportModule.resolveViewportCloseState
  || viewportModule.default?.resolveViewportCloseState
);

test('resolveViewportOpenIds keeps known ids and can fall back to empty state', () => {
  assert.equal(typeof resolveViewportOpenIds, 'function');
  assert.deepEqual(
    resolveViewportOpenIds(['story', 'missing'], ['story', 'docs'], true),
    ['story'],
  );
  assert.deepEqual(
    resolveViewportOpenIds(['missing'], ['story', 'docs'], true),
    [],
  );
  assert.deepEqual(
    resolveViewportOpenIds(['missing'], ['story', 'docs'], false),
    ['story', 'docs'],
  );
});

test('resolveViewportActiveId prefers requested id and falls back to first open tab', () => {
  assert.equal(typeof resolveViewportActiveId, 'function');
  assert.equal(resolveViewportActiveId('docs', ['story', 'docs']), 'docs');
  assert.equal(resolveViewportActiveId('missing', ['story', 'docs']), 'story');
  assert.equal(resolveViewportActiveId(null, []), null);
});

test('resolveViewportCloseState allows closing last tab when allowEmpty=true', async () => {
  assert.equal(typeof resolveViewportCloseState, 'function');
  const next = await resolveViewportCloseState({
    panelId: 'story',
    openIds: ['story'],
    activeId: 'story',
    allowEmpty: true,
  });

  assert.equal(next.didClose, true);
  assert.deepEqual(next.openIds, []);
  assert.equal(next.activeId, null);
});

test('resolveViewportCloseState blocks close when close interceptor rejects', async () => {
  const next = await resolveViewportCloseState(
    {
      panelId: 'story',
      openIds: ['story', 'docs'],
      activeId: 'story',
      allowEmpty: true,
    },
    () => false,
  );

  assert.equal(next.didClose, false);
  assert.deepEqual(next.openIds, ['story', 'docs']);
  assert.equal(next.activeId, 'story');
});

test('resolveViewportCloseState keeps final tab open when allowEmpty=false', async () => {
  const next = await resolveViewportCloseState({
    panelId: 'story',
    openIds: ['story'],
    activeId: 'story',
    allowEmpty: false,
  });

  assert.equal(next.didClose, false);
  assert.deepEqual(next.openIds, ['story']);
  assert.equal(next.activeId, 'story');
});
