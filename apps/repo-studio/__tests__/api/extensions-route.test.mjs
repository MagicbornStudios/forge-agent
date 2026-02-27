import assert from 'node:assert/strict';
import test from 'node:test';

import * as extensionsRouteModule from '../../app/api/repo/extensions/route.ts';

const GET = (
  extensionsRouteModule.GET
  || extensionsRouteModule.default?.GET
);

test('extensions route returns discoverable extensions payload and validates story tool contract when present', async () => {
  assert.equal(typeof GET, 'function');
  const response = await GET();
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.match(String(response.headers.get('cache-control') || ''), /no-store/i);
  assert.equal(payload.ok, true);
  assert.ok(Array.isArray(payload.extensions));
  assert.equal(typeof payload.activeRoot, 'string');
  assert.ok(Array.isArray(payload.warnings));

  const story = payload.extensions.find((entry) => String(entry.workspaceId) === 'story');
  if (!story) return;

  assert.equal(String(story.workspaceKind), 'story');
  const tools = Array.isArray(story?.assistant?.forge?.tools) ? story.assistant.forge.tools : [];
  const hasAboutWorkspaceTool = tools.some((tool) =>
    String(tool?.name) === 'forge_open_about_workspace'
    && String(tool?.action) === 'open_about_workspace');
  assert.equal(hasAboutWorkspaceTool, true);
});
