import fs from 'node:fs/promises';
import path from 'node:path';

import { readJson, readText } from './io.mjs';

function normalizeRelPath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.?\//, '');
}

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readWorkspaceGlobs(cwd) {
  const workspacePath = path.join(cwd, 'pnpm-workspace.yaml');
  const raw = await readText(workspacePath, '');
  if (!raw.trim()) return ['apps/*', 'packages/*'];

  const lines = raw.replace(/\r\n/g, '\n').split('\n');
  const globs = [];
  let inPackages = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (!inPackages && /^packages\s*:/.test(trimmed)) {
      inPackages = true;
      continue;
    }
    if (!inPackages) continue;

    const item = /^\s*-\s*["']?([^"']+)["']?\s*$/.exec(line);
    if (item) {
      globs.push(normalizeRelPath(item[1]));
      continue;
    }

    if (!/^\s/.test(line)) break;
  }

  return globs.length > 0 ? globs : ['apps/*', 'packages/*'];
}

async function expandSingleLevelGlob(cwd, glob) {
  const normalized = normalizeRelPath(glob);
  if (!normalized.endsWith('/*')) {
    const abs = path.join(cwd, normalized);
    const stats = await fs.stat(abs).catch(() => null);
    if (stats?.isDirectory()) return [normalized];
    return [];
  }

  const base = normalized.slice(0, -2);
  const baseAbs = path.join(cwd, base);
  const entries = await fs.readdir(baseAbs, { withFileTypes: true }).catch(() => []);
  return entries
    .filter((entry) => entry.isDirectory())
    .filter((entry) => !entry.name.startsWith('.'))
    .map((entry) => normalizeRelPath(path.join(base, entry.name)));
}

function collectScriptEntries({ namespace, packageName, scripts }) {
  const entries = [];
  for (const scriptName of Object.keys(scripts || {}).sort()) {
    const scriptValue = String(scripts[scriptName] || '');
    const workspaceSegment = String(packageName || '')
      .replace(/^@/, '')
      .replace(/\//g, '--')
      .toLowerCase();
    const id = namespace === 'root'
      ? `${namespace}:${scriptName}`
      : `${namespace}:${workspaceSegment}:${scriptName}`;
    const command = namespace === 'root'
      ? `pnpm run ${scriptName}`
      : `pnpm --filter ${packageName} run ${scriptName}`;
    entries.push({
      id,
      source: namespace === 'root' ? 'root-scripts' : 'workspace-scripts',
      packageName: namespace === 'root' ? 'root' : packageName,
      scriptName,
      script: scriptValue,
      command,
    });
  }
  return entries;
}

function forgeBuiltins(rootScripts) {
  return Object.keys(rootScripts || {})
    .filter((name) => name.startsWith('forge-loop') || name.startsWith('forge-env') || name.startsWith('forge-repo-studio'))
    .sort()
    .map((scriptName) => ({
      id: `forge:${scriptName}`,
      source: 'forge-builtins',
      packageName: 'root',
      scriptName,
      command: `pnpm run ${scriptName}`,
    }));
}

export async function collectWorkspaceScripts(cwd = process.cwd()) {
  const rootPackage = await readJson(path.join(cwd, 'package.json'), {});
  const rootScripts = rootPackage?.scripts || {};
  const rootEntries = collectScriptEntries({
    namespace: 'root',
    packageName: 'root',
    scripts: rootScripts,
  });

  const workspaceEntries = [];
  const globs = await readWorkspaceGlobs(cwd);
  const dirs = new Set();
  for (const glob of globs) {
    for (const item of await expandSingleLevelGlob(cwd, glob)) {
      dirs.add(item);
    }
  }

  for (const relDir of [...dirs].sort()) {
    const packageJsonPath = path.join(cwd, relDir, 'package.json');
    if (!(await pathExists(packageJsonPath))) continue;
    const pkg = await readJson(packageJsonPath, null);
    if (!pkg || typeof pkg !== 'object') continue;
    if (!pkg.scripts || typeof pkg.scripts !== 'object') continue;
    const packageName = String(pkg.name || relDir);
    workspaceEntries.push(...collectScriptEntries({
      namespace: 'workspace',
      packageName,
      scripts: pkg.scripts,
    }));
  }

  return {
    rootEntries,
    workspaceEntries,
    forgeEntries: forgeBuiltins(rootScripts),
  };
}
