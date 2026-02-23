import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

function mkTempDir(prefix = 'repo-studio-runtime-') {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

async function loadRuntimeManager() {
  return import(`../lib/runtime-manager.mjs?cacheBust=${Date.now()}-${Math.random().toString(16).slice(2)}`);
}

test('writeRuntimeState/readRuntimeState preserve desktop metadata', async () => {
  const cwd = mkTempDir();
  const prev = process.cwd();
  process.chdir(cwd);
  try {
    const { readRuntimeState, writeRuntimeState, runtimeUrlFor } = await loadRuntimeManager();
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

test('stopRuntime does not terminate foreign untracked port owners', async () => {
  const cwd = mkTempDir();
  const prev = process.cwd();
  process.chdir(cwd);
  try {
    const { stopRuntime } = await loadRuntimeManager();
    let stopCalls = 0;
    const result = await stopRuntime({
      mode: 'app',
      port: 3010,
      detectRuntimeByPort: async () => ({
        pid: 4242,
        port: 3010,
        mode: 'app',
        startedAt: new Date().toISOString(),
        workspaceRoot: 'C:/other-repo',
        view: 'planning',
        profile: 'forge-loop',
      }),
      ownershipResolver: async () => ({
        repoOwned: false,
        commandLine: 'node C:\\other-repo\\apps\\repo\\server.js',
      }),
      stopProcessTree: async () => {
        stopCalls += 1;
        return { ok: true, stdout: '', stderr: '' };
      },
    });

    assert.equal(result.ok, false);
    assert.equal(result.stopped, false);
    assert.equal(stopCalls, 0);
    assert.match(String(result.message || ''), /outside this workspace/i);
  } finally {
    process.chdir(prev);
  }
});
