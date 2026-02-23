import assert from 'node:assert/strict';
import test from 'node:test';

import { resolveCodexInvocation } from '../lib/codex.mjs';

test('resolveCodexInvocation prefers bundled codex for default command', () => {
  const invocation = resolveCodexInvocation(
    { cliCommand: 'codex' },
    {
      nodeCommand: '/usr/bin/node',
      resolveBundledScript: () => '/tmp/codex/bin/codex.js',
    },
  );

  assert.equal(invocation.source, 'bundled');
  assert.equal(invocation.command, '/usr/bin/node');
  assert.deepEqual(invocation.args, ['/tmp/codex/bin/codex.js']);
  assert.equal(invocation.bundleMissing, false);
});

test('resolveCodexInvocation honors configured command override', () => {
  const invocation = resolveCodexInvocation(
    { cliCommand: 'C:/tools/codex-custom.exe' },
    {
      resolveBundledScript: () => '/tmp/codex/bin/codex.js',
    },
  );

  assert.equal(invocation.source, 'configured');
  assert.equal(invocation.command, 'C:/tools/codex-custom.exe');
  assert.deepEqual(invocation.args, []);
  assert.equal(invocation.bundleMissing, false);
});

test('resolveCodexInvocation reports missing bundled codex when default command is used', () => {
  const invocation = resolveCodexInvocation(
    { cliCommand: 'codex' },
    {
      resolveBundledScript: () => null,
    },
  );

  assert.equal(invocation.source, 'configured');
  assert.equal(invocation.command, 'codex');
  assert.equal(invocation.bundleMissing, true);
});
