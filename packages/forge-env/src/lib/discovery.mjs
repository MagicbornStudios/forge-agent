import fs from 'node:fs/promises';
import path from 'node:path';

import { resolveRepoPath } from './constants.mjs';
import { readJson } from './io.mjs';

const DEFAULT_WORKSPACE_GLOBS = ['apps/*', 'packages/*'];
const DEFAULT_IGNORE_PATTERNS = ['**/node_modules/**', '**/.next/**', '**/dist/**', '**/build/**'];
const DEFAULT_ENV_PATHS = {
  env: '.env',
  local: '.env.local',
  development: '.env.development.local',
  production: '.env.production.local',
  example: '.env.example',
};

function normalizeRelPath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.?\//, '');
}

function sanitizeTargetId(raw, fallback = 'target') {
  const normalized = String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/^@/, '')
    .replace(/\//g, '-')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return normalized || fallback;
}

function globToRegex(glob) {
  const escaped = String(glob || '')
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '::DOUBLE_STAR::')
    .replace(/\*/g, '[^/]*')
    .replace(/::DOUBLE_STAR::/g, '.*');
  return new RegExp(`^${escaped}$`);
}

function pathMatchesAny(relPath, patterns) {
  const normalized = normalizeRelPath(relPath);
  return (patterns || []).some((pattern) => globToRegex(pattern).test(normalized));
}

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readWorkspaceGlobsFromPnpm() {
  const workspacePath = resolveRepoPath('pnpm-workspace.yaml');
  const exists = await pathExists(workspacePath);
  if (!exists) return [...DEFAULT_WORKSPACE_GLOBS];

  const raw = await fs.readFile(workspacePath, 'utf8');
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

    const itemMatch = /^\s*-\s*["']?([^"']+)["']?\s*$/.exec(line);
    if (itemMatch) {
      globs.push(normalizeRelPath(itemMatch[1]));
      continue;
    }

    if (!/^\s/.test(line)) {
      break;
    }
  }

  return globs.length > 0 ? globs : [...DEFAULT_WORKSPACE_GLOBS];
}

async function expandWorkspaceGlob(glob) {
  const normalized = normalizeRelPath(glob);
  if (!normalized.endsWith('/*')) {
    const abs = resolveRepoPath(normalized);
    const stats = await fs.stat(abs).catch(() => null);
    if (stats?.isDirectory()) return [normalized];
    return [];
  }

  const base = normalized.slice(0, -2);
  const baseAbs = resolveRepoPath(base);
  const entries = await fs.readdir(baseAbs, { withFileTypes: true }).catch(() => []);

  return entries
    .filter((entry) => entry.isDirectory())
    .filter((entry) => !entry.name.startsWith('.'))
    .map((entry) => normalizeRelPath(path.join(base, entry.name)));
}

async function discoverFromWorkspace(profileConfig) {
  const discoveryConfig = profileConfig.discovery || {};
  if (discoveryConfig.enabled === false) {
    return {
      targets: [],
      workspaceGlobs: [],
      skippedByIgnore: [],
      ignored: [],
      manifestMissingDirs: [],
      discoveredWithoutManifest: [],
      collisions: [],
      source: 'disabled',
    };
  }

  const workspaceGlobs = Array.isArray(discoveryConfig.workspaceGlobs) && discoveryConfig.workspaceGlobs.length > 0
    ? discoveryConfig.workspaceGlobs.map((item) => normalizeRelPath(item))
    : await readWorkspaceGlobsFromPnpm();

  const ignorePatterns = Array.isArray(discoveryConfig.ignorePatterns) && discoveryConfig.ignorePatterns.length > 0
    ? discoveryConfig.ignorePatterns
    : DEFAULT_IGNORE_PATTERNS;

  const includePackages = discoveryConfig.includePackages !== false;
  const expanded = new Set();
  for (const glob of workspaceGlobs) {
    const items = await expandWorkspaceGlob(glob);
    for (const item of items) {
      expanded.add(item);
    }
  }

  const manifestTargets = Array.isArray(profileConfig.targets) ? profileConfig.targets : [];
  const manifestDirs = new Set(manifestTargets.map((target) => normalizeRelPath(target.dir || '.')));
  const manifestMissingDirs = [];
  for (const target of manifestTargets) {
    const relDir = normalizeRelPath(target.dir || '.');
    const absDir = resolveRepoPath(relDir);
    const stats = await fs.stat(absDir).catch(() => null);
    if (!stats?.isDirectory()) {
      manifestMissingDirs.push(relDir);
    }
  }

  const collisions = [];
  const skippedByIgnore = [];
  const discovered = [];
  const seenIds = new Set(manifestTargets.map((target) => String(target.id || '').trim()));

  for (const relDir of expanded) {
    if (!includePackages && relDir.startsWith('packages/')) {
      continue;
    }

    if (pathMatchesAny(relDir, ignorePatterns)) {
      skippedByIgnore.push(relDir);
      continue;
    }

    const absDir = resolveRepoPath(relDir);
    const packageJsonPath = path.join(absDir, 'package.json');
    const packageJson = await readJson(packageJsonPath, null);
    if (!packageJson || typeof packageJson !== 'object') {
      continue;
    }

    const envPaths = Object.values(DEFAULT_ENV_PATHS).map((relPath) => path.join(absDir, relPath));
    const hasEnvFiles = (await Promise.all(envPaths.map((filePath) => pathExists(filePath)))).some(Boolean);
    if (!hasEnvFiles) {
      continue;
    }

    const baseId = sanitizeTargetId(packageJson.name || relDir, sanitizeTargetId(path.basename(relDir)));
    let id = baseId;
    let suffix = 2;
    while (seenIds.has(id)) {
      id = `${baseId}-${suffix}`;
      suffix += 1;
    }

    if (id !== baseId) {
      collisions.push(`${baseId} -> ${id}`);
    }
    seenIds.add(id);

    const label = String(packageJson.name || relDir);
    discovered.push({
      id,
      label,
      dir: relDir,
      paths: { ...DEFAULT_ENV_PATHS },
      discovered: true,
      source: 'workspace-scan',
      packageName: String(packageJson.name || ''),
    });
  }

  const discoveredWithoutManifest = discovered
    .filter((target) => !manifestDirs.has(normalizeRelPath(target.dir || '.')))
    .map((target) => target.id);

  return {
    targets: discovered,
    workspaceGlobs,
    skippedByIgnore,
    ignored: ignorePatterns,
    manifestMissingDirs,
    discoveredWithoutManifest,
    collisions,
    source: 'workspace-scan',
  };
}

function mergeTargets(manifestTargets, discoveredTargets) {
  const byId = new Map();
  const byDir = new Map();
  const merged = [];
  const addedByDiscovery = [];

  for (const target of manifestTargets || []) {
    const normalized = {
      ...target,
      dir: normalizeRelPath(target.dir || '.'),
      paths: { ...DEFAULT_ENV_PATHS, ...(target.paths || {}) },
      discovered: false,
      source: target.source || 'manifest',
    };
    merged.push(normalized);
    byId.set(normalized.id, normalized);
    byDir.set(normalized.dir, normalized);
  }

  for (const target of discoveredTargets || []) {
    const normalized = {
      ...target,
      dir: normalizeRelPath(target.dir || '.'),
      paths: { ...DEFAULT_ENV_PATHS, ...(target.paths || {}) },
      discovered: true,
      source: target.source || 'workspace-scan',
    };

    if (byId.has(normalized.id) || byDir.has(normalized.dir)) {
      continue;
    }

    merged.push(normalized);
    byId.set(normalized.id, normalized);
    byDir.set(normalized.dir, normalized);
    addedByDiscovery.push(normalized.id);
  }

  return { merged, addedByDiscovery };
}

export function parseTargetFilter(profileConfig, rawFilter) {
  if (!rawFilter) return null;
  const tokens = String(rawFilter)
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  if (tokens.length === 0 || tokens.includes('all')) return null;

  const aliases = profileConfig.aliases || {};
  const set = new Set();
  for (const token of tokens) {
    const resolved = aliases[token] || token;
    set.add(resolved);
  }
  return set;
}

export function resolveTargetPath(target, relativePath) {
  if (!relativePath) return null;
  return resolveRepoPath(path.join(target.dir || '.', relativePath));
}

export function getTargetPaths(target) {
  return {
    env: resolveTargetPath(target, target.paths?.env || '.env'),
    local: resolveTargetPath(target, target.paths?.local || '.env.local'),
    development: resolveTargetPath(target, target.paths?.development || '.env.development.local'),
    production: resolveTargetPath(target, target.paths?.production || '.env.production.local'),
    example: resolveTargetPath(target, target.paths?.example || '.env.example'),
  };
}

export function rootTarget() {
  return {
    id: '__root__',
    label: 'Root fallback',
    dir: '.',
    paths: { ...DEFAULT_ENV_PATHS },
  };
}

export async function selectTargets(profileConfig, options = {}) {
  const manifestTargets = Array.isArray(profileConfig.targets) ? profileConfig.targets : [];
  const discovered = await discoverFromWorkspace(profileConfig);
  const merged = mergeTargets(manifestTargets, discovered.targets);

  const targetFilter = parseTargetFilter(profileConfig, options.app);
  const selected = merged.merged.filter((target) => !targetFilter || targetFilter.has(target.id));

  if (targetFilter && selected.length === 0) {
    throw new Error(`Unknown target filter "${options.app}". Available targets: ${merged.merged.map((target) => target.id).join(', ')}`);
  }

  const diagnostics = {
    source: discovered.source,
    workspaceGlobs: discovered.workspaceGlobs || [],
    ignoredPatterns: discovered.ignored || [],
    skippedByIgnore: discovered.skippedByIgnore || [],
    manifestMissingDirs: discovered.manifestMissingDirs || [],
    discoveredWithoutManifest: discovered.discoveredWithoutManifest || [],
    idCollisions: discovered.collisions || [],
    manifestCount: manifestTargets.length,
    discoveredCount: discovered.targets.length,
    mergedCount: merged.merged.length,
    selectedCount: selected.length,
    addedByDiscovery: merged.addedByDiscovery,
  };

  return {
    targets: selected,
    diagnostics,
  };
}
