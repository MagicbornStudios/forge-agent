import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const storePath = path.join(process.cwd(), 'apps', 'repo-studio', 'src', 'lib', 'app-shell', 'store.ts');

test('store uses clean persist key and no legacy migration hook', () => {
  const source = fs.readFileSync(storePath, 'utf8');
  assert.match(source, /name:\s*'forge:repo-studio-shell:v4'/);
  assert.doesNotMatch(source, /migrateRepoStudioShellPersistedState/);
  assert.doesNotMatch(source, /LEGACY_REPO_STUDIO_LAYOUT_ID/);
});
