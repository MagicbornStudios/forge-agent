import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

function mkTempDir(prefix = 'repo-studio-runtime-') {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

test('writeRuntimeState/readRuntimeState preserve desktop metadata', async () => {
  const cwd = mkTempDir();
  const prev = process.cwd();
  process.chdir(cwd);
  try {
    const { readRuntimeState, writeRuntimeState, runtimeUrlFor } = await import('../lib/runtime-manager.mjs');
    const written = await writeRuntimeState({
      pid: 1111,
      port: 3021,
      mode: 'desktop',
      profile: 'forge-agent',
      view: 'planning',
      desktop: {
        appPort: 3021,
        serverPid: 2222,
        electronPid: 3333,
        serverMode: 'prod',
      },
    });

    const loaded = await readRuntimeState();
    assert.equal(written.mode, 'desktop');
    assert.equal(loaded.mode, 'desktop');
    assert.equal(loaded.desktop.serverPid, 2222);
    assert.equal(runtimeUrlFor(loaded), 'http://127.0.0.1:3021');
  } finally {
    process.chdir(prev);
  }
});
