import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  resolveRepoStudioDesktopDatabasePath,
  resolveRepoStudioSqlite,
  resolveRepoStudioWebDatabasePath,
  validateSqlitePathWritable,
} from '../core/runtime/sqlite-paths.mjs';

function mkTempDir(prefix = 'repo-studio-sqlite-') {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

test('resolveRepoStudioWebDatabasePath points to apps/repo-studio/data when app exists', () => {
  const cwd = mkTempDir();
  const appDir = path.join(cwd, 'apps', 'repo-studio');
  fs.mkdirSync(appDir, { recursive: true });
  fs.writeFileSync(path.join(appDir, 'package.json'), '{"name":"@forge/repo-studio-app"}', 'utf8');
  const resolved = resolveRepoStudioWebDatabasePath({ workspaceRoot: cwd });
  assert.equal(resolved.endsWith(path.join('apps', 'repo-studio', 'data', 'repo-studio.db')), true);
});

test('resolveRepoStudioDesktopDatabasePath uses provided userDataPath', () => {
  const cwd = mkTempDir();
  const userData = path.join(cwd, 'userData');
  const resolved = resolveRepoStudioDesktopDatabasePath({
    workspaceRoot: cwd,
    userDataPath: userData,
  });
  assert.equal(resolved, path.join(userData, 'repo-studio', 'repo-studio.db'));
});

test('resolveRepoStudioSqlite honors explicitDatabaseUri', () => {
  const resolved = resolveRepoStudioSqlite({
    runtime: 'desktop',
    workspaceRoot: mkTempDir(),
    explicitDatabaseUri: 'file:///tmp/custom.db',
  });
  assert.equal(resolved.databasePath, null);
  assert.equal(resolved.databaseUri, 'file:///tmp/custom.db');
  assert.equal(resolved.source, 'explicit-env');
});

test('validateSqlitePathWritable succeeds for writable parent directory', () => {
  const cwd = mkTempDir();
  const filePath = path.join(cwd, 'sqlite', 'repo.db');
  const check = validateSqlitePathWritable(filePath);
  assert.equal(check.ok, true);
  assert.equal(fs.existsSync(path.dirname(filePath)), true);
});

