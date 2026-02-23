import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { runCodexLogin } from '../lib/codex.mjs';

async function createFakeCodexCommand() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-studio-codex-login-'));
  const scriptPath = path.join(dir, 'fake-codex.js');

  const script = [
    "const args = process.argv.slice(2);",
    "if (args[0] === '--version') {",
    "  console.log('codex-cli 9.9.9');",
    '  process.exit(0);',
    '}',
    "if (args[0] === 'login' && args[1] === 'status') {",
    "  console.log('Logged in using ChatGPT');",
    '  process.exit(0);',
    '}',
    "if (args[0] === 'login') {",
    "  console.log('If your browser did not open, navigate to this URL to authenticate:');",
    "  console.log('https://auth.openai.com/oauth/authorize?state=test-token');",
    "  console.log('Successfully logged in');",
    '  process.exit(0);',
    '}',
    "console.error('unexpected args: ' + args.join(' '));",
    'process.exit(1);',
  ].join('\n');

  await fs.writeFile(scriptPath, `${script}\n`, 'utf8');
  return {
    dir,
    invocation: {
      command: process.execPath,
      args: [scriptPath],
      source: 'configured',
    },
  };
}

test('runCodexLogin returns structured payload with parsed auth url', async () => {
  const fake = await createFakeCodexCommand();
  try {
    const result = await runCodexLogin({
      assistant: {
        codex: {
          cliCommand: 'codex',
          authPolicy: 'chatgpt-strict',
        },
      },
    }, {
      invocation: fake.invocation,
    });

    assert.equal(result.ok, true);
    assert.equal(result.readiness?.cli?.installed, true);
    assert.equal(result.readiness?.login?.loggedIn, true);
    assert.equal(result.readiness?.login?.authType, 'chatgpt');
    assert.match(String(result.authUrl || ''), /https:\/\/auth\.openai\.com\/oauth\/authorize/);
    assert.match(String(result.stdout || ''), /Successfully logged in/);
  } finally {
    await fs.rm(fake.dir, { recursive: true, force: true });
  }
});
