import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { DEFAULT_REPO_STUDIO_CONFIG } from '../lib/config.mjs';
import { buildAllowedCommands } from '../lib/policy.mjs';

function mkTempRepo(prefix = 'repo-studio-test-') {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

test('buildAllowedCommands collects root/workspace/forge entries and marks blocked commands', async () => {
  const cwd = mkTempRepo();
  fs.writeFileSync(path.join(cwd, 'pnpm-workspace.yaml'), 'packages:\n  - "packages/*"\n', 'utf8');
  fs.writeFileSync(
    path.join(cwd, 'package.json'),
    JSON.stringify({
      name: 'root',
      private: true,
      scripts: {
        dev: 'echo dev',
        'forge-loop:test': 'echo forge-loop-test',
        risky: 'rm -rf ./tmp',
      },
    }, null, 2),
    'utf8',
  );

  const pkgDir = path.join(cwd, 'packages', 'alpha');
  fs.mkdirSync(pkgDir, { recursive: true });
  fs.writeFileSync(
    path.join(pkgDir, 'package.json'),
    JSON.stringify({
      name: '@test/alpha',
      scripts: {
        test: 'echo alpha',
      },
    }, null, 2),
    'utf8',
  );

  const commands = await buildAllowedCommands(DEFAULT_REPO_STUDIO_CONFIG, cwd);
  assert.ok(commands.some((item) => item.id === 'root:dev'));
  assert.ok(commands.some((item) => item.id === 'workspace:test--alpha:test'));
  assert.ok(commands.some((item) => item.id === 'forge:forge-loop:test'));
  assert.equal(commands.some((item) => item.id === 'root:forge-loop:test'), false);
  const risky = commands.find((item) => item.id === 'root:risky');
  assert.equal(risky?.blocked, true);
});

test('buildAllowedCommands honors disabledCommandIds', async () => {
  const cwd = mkTempRepo('repo-studio-disabled-');
  fs.writeFileSync(path.join(cwd, 'pnpm-workspace.yaml'), 'packages:\n  - "packages/*"\n', 'utf8');
  fs.writeFileSync(
    path.join(cwd, 'package.json'),
    JSON.stringify({
      name: 'root',
      private: true,
      scripts: {
        dev: 'echo dev',
      },
    }, null, 2),
    'utf8',
  );

  const config = {
    ...DEFAULT_REPO_STUDIO_CONFIG,
    commandPolicy: {
      ...DEFAULT_REPO_STUDIO_CONFIG.commandPolicy,
      disabledCommandIds: ['root:dev'],
    },
  };

  const commands = await buildAllowedCommands(config, cwd);
  const rootDev = commands.find((item) => item.id === 'root:dev');
  assert.equal(rootDev?.blocked, true);
  assert.equal(rootDev?.blockedBy, 'disabled-id');
});
