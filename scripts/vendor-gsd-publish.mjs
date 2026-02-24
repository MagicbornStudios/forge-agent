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

const tmpDir = path.join(os.tmpdir(), `forge-gsd-publish-${Date.now()}`);
fs.cpSync(vendorDir, tmpDir, { recursive: true });
const pkgPath = path.join(tmpDir, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.name = '@forge/gsd';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

try {
  const result = spawnSync('npm', ['publish', '--registry', registry], {
    cwd: tmpDir,
    stdio: 'inherit',
  });
  process.exit(result.status !== 0 ? (result.status ?? 1) : 0);
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
