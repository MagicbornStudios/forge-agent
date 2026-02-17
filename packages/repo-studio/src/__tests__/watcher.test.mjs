import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { createDesktopWatcher } from '../desktop/watcher.mjs';

function mkTempDir(prefix = 'repo-studio-watcher-') {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

test('createDesktopWatcher returns disabled mode when explicitly disabled', async () => {
  const events = [];
  const watcher = await createDesktopWatcher({
    workspaceRoot: mkTempDir(),
    settings: {
      enabled: false,
    },
    emitEvent: (event) => events.push(event),
  });

  assert.equal(watcher.mode, 'disabled');
  assert.equal(events.some((event) => event.type === 'watcherHealth'), true);
  await watcher.close();
});

test('createDesktopWatcher handles missing roots by disabling watcher', async () => {
  const events = [];
  const watcher = await createDesktopWatcher({
    workspaceRoot: mkTempDir(),
    settings: {
      enabled: true,
      watchedRoots: ['does-not-exist'],
    },
    emitEvent: (event) => events.push(event),
  });

  assert.equal(watcher.mode, 'disabled');
  assert.equal(events.some((event) => event.reason === 'no-watchable-roots'), true);
  await watcher.close();
});

