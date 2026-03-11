#!/usr/bin/env node
/**
 * Commit all vendor (and docs) submodule changes, then update parent repo.
 * Usage: pnpm vendor:commit [--message "msg"] [--dry-run]
 *
 * For each submodule with changes: git add -A && git commit -m "<message>"
 * Then in parent: git add <submodule paths> && git commit -m "chore: update submodules"
 *
 * Run from repo root.
 */

import { execSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const GITMODULES = path.join(root, '.gitmodules');

function getSubmodulePaths() {
  if (!fs.existsSync(GITMODULES)) return [];
  const text = fs.readFileSync(GITMODULES, 'utf8');
  const paths = [];
  for (const line of text.split('\n')) {
    const m = line.match(/^\s*path\s*=\s*(.+)$/);
    if (m) paths.push(path.join(root, m[1].trim()));
  }
  return paths;
}

function hasChanges(dir) {
  const r = spawnSync('git', ['status', '--short'], { cwd: dir, encoding: 'utf8' });
  if (r.status !== 0) return false;
  return r.stdout.trim().length > 0;
}

function isGitRepo(dir) {
  return fs.existsSync(path.join(dir, '.git'));
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const msgArg = args.indexOf('--message');
  const message = msgArg >= 0 && args[msgArg + 1]
    ? args[msgArg + 1]
    : 'chore: sync from forge-agent';

  const submodulePaths = getSubmodulePaths();
  if (submodulePaths.length === 0) {
    console.error('No submodules found in .gitmodules');
    process.exit(1);
  }

  const committed = [];
  for (const dir of submodulePaths) {
    if (!fs.existsSync(dir) || !isGitRepo(dir)) continue;
    if (!hasChanges(dir)) continue;

    const name = path.relative(root, dir);
    if (dryRun) {
      console.log(`[dry-run] would commit in ${name}`);
      committed.push(dir);
      continue;
    }
    try {
      execSync('git add -A', { cwd: dir, stdio: 'inherit' });
      execSync(`git commit -m ${JSON.stringify(message)}`, { cwd: dir, stdio: 'inherit' });
      committed.push(dir);
    } catch (e) {
      console.error(`Failed to commit in ${name}:`, e.message);
      process.exit(1);
    }
  }

  if (committed.length === 0) {
    console.log('No submodule changes to commit.');
    return;
  }

  if (dryRun) {
    console.log(`[dry-run] would update parent with ${committed.length} submodule(s)`);
    return;
  }

  const relativePaths = committed.map((d) => path.relative(root, d));
  try {
    for (const p of relativePaths) {
      execSync(`git add ${p}`, { cwd: root, stdio: 'inherit' });
    }
    execSync('git commit -m "chore: update submodules"', { cwd: root, stdio: 'inherit' });
    console.log('Parent repo updated with new submodule pointers.');
  } catch (e) {
    console.error('Failed to commit parent:', e.message);
    process.exit(1);
  }
}

main();
