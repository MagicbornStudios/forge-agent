import assert from 'node:assert/strict';
import test from 'node:test';

import * as startRouteModule from '../../app/api/repo/terminal/session/start/route.ts';
import * as inputRouteModule from '../../app/api/repo/terminal/session/[sessionId]/input/route.ts';
import * as streamRouteModule from '../../app/api/repo/terminal/session/[sessionId]/stream/route.ts';
import * as stopRouteModule from '../../app/api/repo/terminal/session/[sessionId]/stop/route.ts';

const startSession = (
  startRouteModule.POST
  || startRouteModule.default?.POST
);
const sendInput = (
  inputRouteModule.POST
  || inputRouteModule.default?.POST
);
const streamSession = (
  streamRouteModule.GET
  || streamRouteModule.default?.GET
);
const stopSession = (
  stopRouteModule.POST
  || stopRouteModule.default?.POST
);

test('terminal session routes can start, stream, write input, and stop', async () => {
  assert.equal(typeof startSession, 'function');
  assert.equal(typeof sendInput, 'function');
  assert.equal(typeof streamSession, 'function');
  assert.equal(typeof stopSession, 'function');

  const startResponse = await startSession(new Request('http://localhost/api/repo/terminal/session/start', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ reuse: false }),
  }));
  assert.equal(startResponse.status, 200);
  const startPayload = await startResponse.json();
  assert.equal(startPayload.ok, true);
  assert.equal(typeof startPayload.session?.sessionId, 'string');
  const sessionId = String(startPayload.session.sessionId);

  const streamResponse = await streamSession(
    new Request(`http://localhost/api/repo/terminal/session/${sessionId}/stream`),
    { params: Promise.resolve({ sessionId }) },
  );
  assert.equal(streamResponse.status, 200);
  assert.equal(streamResponse.headers.get('content-type')?.includes('text/event-stream'), true);

  const inputResponse = await sendInput(
    new Request(`http://localhost/api/repo/terminal/session/${sessionId}/input`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ data: '\r' }),
    }),
    { params: Promise.resolve({ sessionId }) },
  );
  assert.equal(inputResponse.status, 200);
  const inputPayload = await inputResponse.json();
  assert.equal(inputPayload.ok, true);

  await streamResponse.body?.cancel();

  const stopResponse = await stopSession(
    new Request(`http://localhost/api/repo/terminal/session/${sessionId}/stop`, {
      method: 'POST',
    }),
    { params: Promise.resolve({ sessionId }) },
  );
  assert.equal(stopResponse.status, 200);
  const stopPayload = await stopResponse.json();
  assert.equal(stopPayload.ok, true);
});
