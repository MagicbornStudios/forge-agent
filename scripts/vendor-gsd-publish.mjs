#!/usr/bin/env node
/** Publish vendored get-shit-done as @forge/gsd to the local registry. */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';
import os from 'os';

const root = path.resolve(fileURLToPath(import.meta.url), '..', '..');
const vendorDir = path.join(root, 'vendor', 'get-shit-done');
const registry = 'http://localhost:4873';

// Ensure hooks/dist exists in vendor so the copy is publishable (skip prepublishOnly in temp dir)
const buildHooks = spawnSync('npm', ['run', 'build:hooks'], {
  cwd: vendorDir,
  stdio: 'inherit',
  shell: true,
});
if (buildHooks.status !== 0) process.exit(buildHooks.status ?? 1);

const tmpDir = path.join(os.tmpdir(), `forge-gsd-publish-${Date.now()}`);
// Exclude .git so submodule metadata doesn't break copy on some systems
fs.cpSync(vendorDir, tmpDir, {
  recursive: true,
  filter: (source) => path.basename(source) !== '.git',
});
const pkgPath = path.join(tmpDir, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.name = '@forge/gsd';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

let exitCode = 0;
try {
  const result = spawnSync('npm', ['publish', '--registry', registry, '--access', 'public', '--ignore-scripts'], {
    cwd: tmpDir,
    stdio: 'inherit',
    shell: true,
  });
  exitCode = result.status !== 0 ? (result.status ?? 1) : 0;
} catch (err) {
  console.error(err);
  exitCode = 1;
} finally {
  try {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  } catch (_) {}
  process.exit(exitCode);
}
