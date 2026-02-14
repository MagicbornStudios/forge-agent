import path from 'node:path';

import { ensureDir, fileExists, readJson, writeJson } from './fs-utils.mjs';

export const ROOT_PLANNING_DIR = '.planning';
export const LOOPS_INDEX_RELATIVE_PATH = path.join(ROOT_PLANNING_DIR, 'LOOPS.json').replace(/\\/g, '/');
export const DEFAULT_LOOP_ID = 'default';

function normalizeScope(scope) {
  if (!Array.isArray(scope) || scope.length === 0) return ['.'];
  return [...new Set(scope.map((item) => String(item || '').trim()).filter(Boolean))];
}

function normalizeProfile(profile) {
  const value = String(profile || '').trim().toLowerCase();
  if (value === 'custom') return 'custom';
  if (value === 'forge-loop' || value === 'generic') return 'forge-loop';
  return 'forge-agent';
}

function normalizeRunner(runner) {
  const value = String(runner || '').trim().toLowerCase();
  if (value === 'openrouter' || value === 'custom') return value;
  return 'codex';
}

export function defaultLoopEntry() {
  return {
    id: DEFAULT_LOOP_ID,
    name: 'Default Repo Loop',
    planningRoot: ROOT_PLANNING_DIR,
    scope: ['.'],
    profile: 'forge-agent',
    runner: 'codex',
  };
}

function normalizeLoopId(loopId) {
  return String(loopId || '').trim().toLowerCase();
}

export function isValidLoopId(loopId) {
  return /^[a-z0-9][a-z0-9_-]*$/.test(normalizeLoopId(loopId));
}

export function planningRootForLoop(loopId) {
  if (normalizeLoopId(loopId) === DEFAULT_LOOP_ID) return ROOT_PLANNING_DIR;
  return path.join(ROOT_PLANNING_DIR, 'loops', normalizeLoopId(loopId)).replace(/\\/g, '/');
}

function normalizeLoopEntry(entry = {}) {
  const id = normalizeLoopId(entry.id);
  if (!id || !isValidLoopId(id)) return null;
  return {
    id,
    name: String(entry.name || id),
    planningRoot: String(entry.planningRoot || planningRootForLoop(id)).replace(/\\/g, '/'),
    scope: normalizeScope(entry.scope),
    profile: normalizeProfile(entry.profile),
    runner: normalizeRunner(entry.runner),
  };
}

function defaultLoopIndex() {
  return {
    version: 1,
    activeLoopId: DEFAULT_LOOP_ID,
    loops: [defaultLoopEntry()],
  };
}

export function getLoopsIndexPath(cwd = process.cwd()) {
  return path.join(cwd, ROOT_PLANNING_DIR, 'LOOPS.json');
}

export function loadLoopIndex(cwd = process.cwd()) {
  const indexPath = getLoopsIndexPath(cwd);
  const fallback = defaultLoopIndex();
  const onDisk = readJson(indexPath, null);

  if (!onDisk || typeof onDisk !== 'object') {
    return fallback;
  }

  const loops = Array.isArray(onDisk.loops)
    ? onDisk.loops.map(normalizeLoopEntry).filter(Boolean)
    : [];

  const map = new Map();
  for (const loop of loops) {
    if (!map.has(loop.id)) {
      map.set(loop.id, loop);
    }
  }

  if (!map.has(DEFAULT_LOOP_ID)) {
    map.set(DEFAULT_LOOP_ID, defaultLoopEntry());
  }

  const normalizedLoops = [...map.values()].sort((a, b) => a.id.localeCompare(b.id));
  const activeLoopId = normalizeLoopId(onDisk.activeLoopId);
  const resolvedActive = normalizedLoops.some((item) => item.id === activeLoopId)
    ? activeLoopId
    : DEFAULT_LOOP_ID;

  return {
    version: 1,
    activeLoopId: resolvedActive,
    loops: normalizedLoops,
  };
}

export function ensureLoopIndex(cwd = process.cwd()) {
  const indexPath = getLoopsIndexPath(cwd);
  if (fileExists(indexPath)) return false;
  ensureDir(path.dirname(indexPath));
  writeJson(indexPath, defaultLoopIndex());
  return true;
}

export function writeLoopIndex(index, cwd = process.cwd()) {
  const normalized = loadLoopIndexFromValue(index);
  const indexPath = getLoopsIndexPath(cwd);
  ensureDir(path.dirname(indexPath));
  writeJson(indexPath, normalized);
  return normalized;
}

function loadLoopIndexFromValue(value) {
  const base = defaultLoopIndex();
  if (!value || typeof value !== 'object') return base;

  const loops = Array.isArray(value.loops)
    ? value.loops.map(normalizeLoopEntry).filter(Boolean)
    : [];
  const deduped = new Map();
  for (const loop of loops) {
    if (!deduped.has(loop.id)) deduped.set(loop.id, loop);
  }
  if (!deduped.has(DEFAULT_LOOP_ID)) {
    deduped.set(DEFAULT_LOOP_ID, defaultLoopEntry());
  }

  const normalizedLoops = [...deduped.values()].sort((a, b) => a.id.localeCompare(b.id));
  const activeLoopId = normalizeLoopId(value.activeLoopId);
  const resolvedActive = normalizedLoops.some((item) => item.id === activeLoopId)
    ? activeLoopId
    : DEFAULT_LOOP_ID;

  return {
    version: 1,
    activeLoopId: resolvedActive,
    loops: normalizedLoops,
  };
}

export function resolveLoopSelection(requestedLoopId = null, cwd = process.cwd()) {
  const index = loadLoopIndex(cwd);
  const requested = normalizeLoopId(requestedLoopId);
  const loopId = requested || index.activeLoopId || DEFAULT_LOOP_ID;
  const loop = index.loops.find((item) => item.id === loopId);
  if (!loop) {
    throw new Error(
      `Loop "${loopId}" is not defined in ${LOOPS_INDEX_RELATIVE_PATH}. Run "forge-loop loop:new ${loopId}" first.`,
    );
  }

  return {
    index,
    loopId: loop.id,
    loop,
    planningRoot: String(loop.planningRoot || planningRootForLoop(loop.id)).replace(/\\/g, '/'),
  };
}

export function upsertLoop(index, loopEntry) {
  const normalizedIndex = loadLoopIndexFromValue(index);
  const normalizedLoop = normalizeLoopEntry(loopEntry);
  if (!normalizedLoop) {
    throw new Error('Invalid loop entry provided.');
  }

  const nextLoops = normalizedIndex.loops.filter((item) => item.id !== normalizedLoop.id);
  nextLoops.push(normalizedLoop);
  nextLoops.sort((a, b) => a.id.localeCompare(b.id));

  return {
    ...normalizedIndex,
    loops: nextLoops,
  };
}

