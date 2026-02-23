#!/usr/bin/env node
/**
 * Bump patch version (0.1.0 -> 0.1.1) in package.json for the given packages.
 * Used before publishing to Verdaccio so we don't hit "cannot publish over previously published versions".
 * Usage: node scripts/bump-forge-packages.mjs [path1 path2 ...]
 * If no paths given, bumps all forge packages (ui, shared, agent-engine, assistant-runtime, dev-kit, forge-loop, forge-env, repo-studio).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const DEFAULT_PACKAGES = [
  'packages/ui',
  'packages/shared',
  'packages/agent-engine',
  'packages/assistant-runtime',
  'packages/dev-kit',
  'packages/forge-loop',
  'packages/forge-env',
  'packages/repo-studio',
];

function bumpVersion(version) {
  if (!version || typeof version !== 'string') return '0.1.1';
  const parts = version.trim().split('.');
  const major = parseInt(parts[0], 10) || 0;
  const minor = parseInt(parts[1], 10) ?? 1;
  const patch = (parseInt(parts[2], 10) || 0) + 1;
  return `${major}.${minor}.${patch}`;
}

const relPaths = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_PACKAGES;

for (const rel of relPaths) {
  const pkgPath = path.join(root, rel, 'package.json');
  try {
    const raw = fs.readFileSync(pkgPath, 'utf8');
    const pkg = JSON.parse(raw);
    const oldVer = pkg.version || '0.1.0';
    pkg.version = bumpVersion(oldVer);
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
    console.log(`${rel}: ${oldVer} -> ${pkg.version}`);
  } catch (err) {
    console.error(`${rel}: ${err.message}`);
    process.exit(1);
  }
}
