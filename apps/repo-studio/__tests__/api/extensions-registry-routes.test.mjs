import assert from 'node:assert/strict';
import test from 'node:test';

import * as registryRouteModule from '../../app/api/repo/extensions/registry/route.ts';
import * as installRouteModule from '../../app/api/repo/extensions/install/route.ts';
import * as removeRouteModule from '../../app/api/repo/extensions/remove/route.ts';

const GET_REGISTRY = (
  registryRouteModule.GET
  || registryRouteModule.default?.GET
);
const POST_INSTALL = (
  installRouteModule.POST
  || installRouteModule.default?.POST
);
const POST_REMOVE = (
  removeRouteModule.POST
  || removeRouteModule.default?.POST
);

test('extensions registry route returns deterministic payload shape', async () => {
  assert.equal(typeof GET_REGISTRY, 'function');
  const response = await GET_REGISTRY();
  const payload = await response.json();
  assert.equal(response.status, 200);
  assert.match(String(response.headers.get('cache-control') || ''), /no-store/i);
  assert.equal(payload.ok, true);
  assert.equal(typeof payload.activeRoot, 'string');
  assert.equal(typeof payload.registryRoot, 'string');
  assert.equal(typeof payload.submoduleReady, 'boolean');
  assert.ok(Array.isArray(payload.entries));
  assert.ok(Array.isArray(payload.examples));
  assert.ok(Array.isArray(payload.warnings));
});

test('extensions install route validates extensionId', async () => {
  assert.equal(typeof POST_INSTALL, 'function');
  const response = await POST_INSTALL(new Request('http://localhost/api/repo/extensions/install', {
    method: 'POST',
    body: JSON.stringify({}),
    headers: { 'content-type': 'application/json' },
  }));
  const payload = await response.json();
  assert.equal(response.status, 400);
  assert.equal(payload.ok, false);
  assert.match(String(payload.message || ''), /extensionId is required/i);
});

test('extensions install route rejects unsafe extensionId values', async () => {
  assert.equal(typeof POST_INSTALL, 'function');
  const response = await POST_INSTALL(new Request('http://localhost/api/repo/extensions/install', {
    method: 'POST',
    body: JSON.stringify({ extensionId: '../story' }),
    headers: { 'content-type': 'application/json' },
  }));
  const payload = await response.json();
  assert.equal(response.status, 400);
  assert.equal(payload.ok, false);
  assert.match(String(payload.message || ''), /extensionId is required and must be alphanumeric/i);
});

test('extensions remove route validates extensionId', async () => {
  assert.equal(typeof POST_REMOVE, 'function');
  const response = await POST_REMOVE(new Request('http://localhost/api/repo/extensions/remove', {
    method: 'POST',
    body: JSON.stringify({}),
    headers: { 'content-type': 'application/json' },
  }));
  const payload = await response.json();
  assert.equal(response.status, 400);
  assert.equal(payload.ok, false);
  assert.match(String(payload.message || ''), /extensionId is required/i);
});

test('extensions install route rejects studio examples as non-installable', async () => {
  assert.equal(typeof GET_REGISTRY, 'function');
  assert.equal(typeof POST_INSTALL, 'function');

  const registryResponse = await GET_REGISTRY();
  const registryPayload = await registryResponse.json();
  const hasAssistantOnlyExample = Array.isArray(registryPayload.examples)
    && registryPayload.examples.some((entry) => String(entry?.id) === 'assistant-only');
  if (!hasAssistantOnlyExample) return;

  const response = await POST_INSTALL(new Request('http://localhost/api/repo/extensions/install', {
    method: 'POST',
    body: JSON.stringify({ extensionId: 'assistant-only' }),
    headers: { 'content-type': 'application/json' },
  }));
  const payload = await response.json();
  assert.equal(response.status, 400);
  assert.equal(payload.ok, false);
  assert.match(String(payload.message || ''), /studio example/i);
});
