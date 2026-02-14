import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { buildToolCommandAttempts, runCommandAttempts } from '../lib/command-resolver.mjs';

function mkTempDir(prefix = 'repo-studio-resolver-') {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

test('buildToolCommandAttempts prefers local cli script when available', () => {
  const cwd = mkTempDir();
  const localCli = path.join(cwd, 'packages', 'forge-env', 'src');
  fs.mkdirSync(localCli, { recursive: true });
  fs.writeFileSync(path.join(localCli, 'cli.mjs'), 'console.log("ok")\n', 'utf8');

  const attempts = buildToolCommandAttempts('forge-env', ['doctor', '--json'], { cwd });
  assert.equal(attempts.length >= 3, true);
  assert.equal(attempts[0].command, process.execPath);
  assert.equal(attempts[0].args[0].endsWith(path.join('packages', 'forge-env', 'src', 'cli.mjs')), true);
});

test('runCommandAttempts falls through on spawn failures and succeeds on next runnable attempt', () => {
  const result = runCommandAttempts([
    { command: '__definitely_missing_binary__', args: [] },
    { command: process.execPath, args: ['-e', 'console.log("resolver-ok")'] },
  ]);

  assert.equal(result.ok, true);
  assert.equal(result.stdout.includes('resolver-ok'), true);
  assert.equal(Array.isArray(result.attempts), true);
  assert.equal(result.attempts.length, 2);
});

test('runCommandAttempts stops on non-zero exit from runnable command', () => {
  const result = runCommandAttempts([
    { command: process.execPath, args: ['-e', 'console.error("expected-failure"); process.exit(2)'] },
    { command: process.execPath, args: ['-e', 'console.log("should-not-run")'] },
  ]);

  assert.equal(result.ok, false);
  assert.equal(result.code, 2);
  assert.equal(result.resolvedAttempt.includes(process.execPath), true);
  assert.equal(result.attempts.length, 1);
});
