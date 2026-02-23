import assert from 'node:assert/strict';
import test from 'node:test';

import * as codexServiceModule from '../../src/lib/api/services/codex.ts';

const fetchCodexSessionStatus = (
  codexServiceModule.fetchCodexSessionStatus
  || codexServiceModule.default?.fetchCodexSessionStatus
);
const loginCodex = (
  codexServiceModule.loginCodex
  || codexServiceModule.default?.loginCodex
);

test('codex service requests use expected endpoints and methods', async () => {
  const calls = [];
  const originalFetch = global.fetch;

  global.fetch = async (url, init = {}) => {
    calls.push({ url: String(url), init });
    if (String(url).includes('/api/repo/codex/session/status')) {
      return new Response(JSON.stringify({
        ok: false,
        codex: {
          readiness: {
            ok: false,
            missing: ['codex_chatgpt_login'],
            cli: {
              installed: true,
              version: '0.104.0',
              source: 'bundled',
              invocation: {
                command: 'node',
                args: ['codex.js'],
                display: 'node codex.js',
              },
            },
            login: {
              loggedIn: false,
              authType: 'none',
            },
          },
        },
        message: 'Codex is not ready.',
      }), { status: 200, headers: { 'content-type': 'application/json' } });
    }

    return new Response(JSON.stringify({
      ok: true,
      message: 'Codex login completed.',
      authUrl: 'https://auth.openai.com/oauth/authorize?state=test',
      readiness: {
        ok: true,
        missing: [],
      },
    }), { status: 200, headers: { 'content-type': 'application/json' } });
  };

  try {
    const status = await fetchCodexSessionStatus();
    const login = await loginCodex();

    assert.equal(status.ok, false);
    assert.equal(status.codex?.readiness?.cli?.source, 'bundled');
    assert.equal(login.ok, true);
    assert.match(String(login.authUrl || ''), /https:\/\/auth\.openai\.com\/oauth\/authorize/);

    assert.equal(calls[0].url, '/api/repo/codex/session/status');
    assert.equal(calls[0].init.method, 'GET');
    assert.equal(calls[1].url, '/api/repo/codex/login');
    assert.equal(calls[1].init.method, 'POST');
  } finally {
    global.fetch = originalFetch;
  }
});
