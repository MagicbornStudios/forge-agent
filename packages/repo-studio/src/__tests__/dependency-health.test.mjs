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

async function writePackageInstall(root, packageName) {
  await writeFile(
    path.join(root, 'apps', 'repo-studio', 'node_modules', packageName, 'package.json'),
    '{}\n',
  );
}

async function seedDependencyHealthFixture(root) {
  await writeFile(path.join(root, 'pnpm-workspace.yaml'), 'packages:\n  - "apps/*"\n  - "packages/*"\n');
  await writeFile(path.join(root, 'apps', 'repo-studio', 'package.json'), '{}\n');

  await writeFile(path.join(root, 'apps', 'repo-studio', 'node_modules', 'dockview', 'package.json'), '{}\n');
  await writeFile(path.join(root, 'apps', 'repo-studio', 'node_modules', 'dockview', 'dist', 'styles', 'dockview.css'), '/* css */\n');

  await writeFile(path.join(root, 'packages', 'shared', 'src', 'shared', 'styles', 'editor-surface.css'));
  await writeFile(path.join(root, 'packages', 'shared', 'src', 'shared', 'styles', 'dockview-overrides.css'));
  await writeFile(path.join(root, 'packages', 'shared', 'src', 'shared', 'styles', 'themes.css'));
  await writeFile(path.join(root, 'packages', 'shared', 'src', 'shared', 'styles', 'contexts.css'));
}

test('dependency health reports missing required CSS/runtime packages', async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-studio-deps-'));
  try {
    await seedDependencyHealthFixture(tempRoot);

    const health = getDependencyHealth(tempRoot);
    assert.equal(health.cssPackagesResolved, false);
    assert.equal(health.runtimePackagesResolved, false);

    const statusByPackage = new Map(
      health.cssPackageStatus.map((entry) => [entry.packageName, entry]),
    );
    assert.equal(statusByPackage.get('tailwindcss-animate')?.resolved, false);
    assert.ok(
      health.messages.some((message) => message.includes('Missing RepoStudio CSS packages')),
    );
    assert.ok(
      health.messages.some((message) => message.includes('Missing RepoStudio runtime packages')),
    );
  } finally {
    await fs.rm(tempRoot, { recursive: true, force: true });
  }
});

test('dependency health marks pipeline unresolved when postcss config is missing', async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-studio-deps-postcss-'));
  try {
    await seedDependencyHealthFixture(tempRoot);
    await writePackageInstall(tempRoot, 'tailwindcss-animate');
    await writePackageInstall(tempRoot, '@openai/codex');
    await writePackageInstall(tempRoot, '@tailwindcss/postcss');

    const health = getDependencyHealth(tempRoot);
    assert.equal(health.postcssConfigResolved, false);
    assert.equal(health.tailwindPostcssResolved, true);
    assert.equal(health.tailwindPipelineResolved, false);
    assert.ok(
      health.messages.some((message) => message.includes('Missing RepoStudio PostCSS config')),
    );
  } finally {
    await fs.rm(tempRoot, { recursive: true, force: true });
  }
});

test('dependency health marks pipeline unresolved when @tailwindcss/postcss is missing', async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-studio-deps-tailwind-postcss-'));
  try {
    await seedDependencyHealthFixture(tempRoot);
    await writePackageInstall(tempRoot, 'tailwindcss-animate');
    await writePackageInstall(tempRoot, '@openai/codex');
    await writeFile(
      path.join(tempRoot, 'apps', 'repo-studio', 'postcss.config.mjs'),
      'export default { plugins: { "@tailwindcss/postcss": {} } };\n',
    );

    const health = getDependencyHealth(tempRoot);
    assert.equal(health.postcssConfigResolved, true);
    assert.equal(health.tailwindPostcssResolved, false);
    assert.equal(health.tailwindPipelineResolved, false);
    assert.ok(
      health.messages.some((message) => message.includes('Missing @tailwindcss/postcss')),
    );
  } finally {
    await fs.rm(tempRoot, { recursive: true, force: true });
  }
});
