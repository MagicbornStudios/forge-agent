import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { getDependencyHealth } from '../lib/dependency-health.mjs';

async function writeFile(filePath, content = '') {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, 'utf8');
}

test('dependency health reports missing required CSS packages', async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-studio-deps-'));
  try {
    await writeFile(path.join(tempRoot, 'pnpm-workspace.yaml'), 'packages:\n  - "apps/*"\n  - "packages/*"\n');
    await writeFile(path.join(tempRoot, 'apps', 'repo-studio', 'package.json'), '{}\n');

    await writeFile(path.join(tempRoot, 'apps', 'repo-studio', 'node_modules', 'dockview', 'package.json'), '{}\n');
    await writeFile(path.join(tempRoot, 'apps', 'repo-studio', 'node_modules', 'dockview', 'dist', 'styles', 'dockview.css'), '/* css */\n');

    await writeFile(path.join(tempRoot, 'packages', 'shared', 'src', 'shared', 'styles', 'editor-surface.css'));
    await writeFile(path.join(tempRoot, 'packages', 'shared', 'src', 'shared', 'styles', 'dockview-overrides.css'));
    await writeFile(path.join(tempRoot, 'packages', 'shared', 'src', 'shared', 'styles', 'themes.css'));
    await writeFile(path.join(tempRoot, 'packages', 'shared', 'src', 'shared', 'styles', 'contexts.css'));

    const health = getDependencyHealth(tempRoot);
    assert.equal(health.cssPackagesResolved, false);

    const statusByPackage = new Map(
      health.cssPackageStatus.map((entry) => [entry.packageName, entry]),
    );
    assert.equal(statusByPackage.get('tw-animate-css')?.resolved, false);
    assert.equal(statusByPackage.get('tailwindcss-animate')?.resolved, false);
    assert.ok(
      health.messages.some((message) => message.includes('Missing RepoStudio CSS packages')),
    );
  } finally {
    await fs.rm(tempRoot, { recursive: true, force: true });
  }
});
