import path from 'node:path';

import { selectTargets, getTargetPaths, rootTarget } from './discovery.mjs';
import { collectProjectState, evaluateReadiness } from './engine.mjs';
import { buildEnvContent, backupFileIfExists, isValueSet, readEnvFile, writeTextFile } from './io.mjs';
import { resolveProfile } from './profiles.mjs';
import { collectUnionKeys, readPathMap } from './sources.mjs';

const MODE_TO_PATH_KEY = {
  local: 'local',
  preview: 'development',
  production: 'production',
  headless: 'local',
};

function normalizeMode(mode) {
  const normalized = String(mode || 'local').trim().toLowerCase();
  if (normalized === 'preview' || normalized === 'production' || normalized === 'headless') {
    return normalized;
  }
  return 'local';
}

function classifyTargetScope(targetDir) {
  const normalized = String(targetDir || '.').replace(/\\/g, '/').replace(/^\.?\//, '');
  if (!normalized || normalized === '.') return 'root';
  if (normalized.startsWith('apps/')) return 'app';
  if (normalized.startsWith('vendor/')) return 'vendor';
  return 'package';
}

function sourceOrderForMode(mode) {
  if (mode === 'preview') {
    return [
      'target.development',
      'target.local',
      'target.env',
      'root.development',
      'root.local',
      'root.env',
      'target.production',
      'root.production',
      'target.example',
      'root.example',
    ];
  }
  if (mode === 'production') {
    return [
      'target.production',
      'target.local',
      'target.env',
      'root.production',
      'root.local',
      'root.env',
      'target.development',
      'root.development',
      'target.example',
      'root.example',
    ];
  }
  return [
    'target.local',
    'target.env',
    'root.local',
    'root.env',
    'target.development',
    'root.development',
    'target.production',
    'root.production',
    'target.example',
    'root.example',
  ];
}

function buildSourceMap(targetFiles, rootFiles) {
  return {
    'target.local': targetFiles.local?.values || {},
    'target.env': targetFiles.env?.values || {},
    'target.development': targetFiles.development?.values || {},
    'target.production': targetFiles.production?.values || {},
    'target.example': targetFiles.example?.values || {},
    'root.local': rootFiles.local?.values || {},
    'root.env': rootFiles.env?.values || {},
    'root.development': rootFiles.development?.values || {},
    'root.production': rootFiles.production?.values || {},
    'root.example': rootFiles.example?.values || {},
  };
}

function entryMap(entries) {
  const byKey = new Map();
  for (const item of entries || []) {
    byKey.set(item.key, item);
  }
  return byKey;
}

function firstSetValue(key, orderedSourceIds, sources) {
  for (const sourceId of orderedSourceIds) {
    const value = sources[sourceId]?.[key];
    if (isValueSet(value)) {
      return {
        value,
        provenance: sourceId,
      };
    }
  }
  return null;
}

function conflictsForKey(key, sources) {
  const found = [];
  for (const [sourceId, values] of Object.entries(sources)) {
    const value = values?.[key];
    if (isValueSet(value)) {
      found.push({
        source: sourceId,
        value,
      });
    }
  }
  const unique = [...new Set(found.map((item) => item.value))];
  if (unique.length <= 1) return null;
  return {
    key,
    values: found,
  };
}

function commentsFromEntries(entries) {
  const map = {};
  for (const entry of entries || []) {
    if (entry.description) {
      map[entry.key] = entry.description;
    }
  }
  return map;
}

function normalizeInputValues(values) {
  const out = {};
  for (const [key, value] of Object.entries(values || {})) {
    const normalizedKey = String(key || '').trim();
    if (!normalizedKey) continue;
    out[normalizedKey] = String(value ?? '');
  }
  return out;
}

function splitTargetIssues(readiness, targetId) {
  const prefix = `${targetId}:`;
  const missing = [];
  const conflicts = [];
  const warnings = [];

  for (const item of readiness.missing || []) {
    if (item.startsWith(prefix)) {
      missing.push(item.slice(prefix.length));
    } else if (!item.includes(':')) {
      missing.push(item);
    }
  }

  for (const item of readiness.conflicts || []) {
    if (item.startsWith(prefix)) {
      conflicts.push(item.slice(prefix.length));
    }
  }

  for (const item of readiness.warnings || []) {
    if (item.startsWith(prefix)) {
      warnings.push(item.slice(prefix.length));
      continue;
    }
    if (!item.includes(':') || item.startsWith('manifest ') || item.startsWith('discovered ')) {
      warnings.push(item);
    }
  }

  return { missing, conflicts, warnings };
}

function modeWritePath(targetPaths, mode) {
  const key = MODE_TO_PATH_KEY[mode] || 'local';
  return targetPaths[key];
}

export async function getEnvTargetSnapshot(options = {}) {
  const mode = normalizeMode(options.mode);
  const resolved = await resolveProfile({ profile: options.profile });
  const profileConfig = resolved.config;
  const targetId = String(options.targetId || options.app || '').trim();
  if (!targetId) {
    throw new Error('targetId is required.');
  }

  const selection = await selectTargets(profileConfig, { app: targetId });
  const target = selection.targets.find((item) => item.id === targetId);
  if (!target) {
    throw new Error(`Unknown target "${targetId}".`);
  }

  const targetPaths = getTargetPaths(target);
  const rootPaths = getTargetPaths(rootTarget());
  const [targetFiles, rootFiles, readinessState] = await Promise.all([
    readPathMap(targetPaths),
    readPathMap(rootPaths),
    collectProjectState(profileConfig, { app: target.id }),
  ]);

  const targetEntries = (profileConfig.entries || []).filter((entry) => entry.target === target.id);
  const entriesByKey = entryMap(targetEntries);
  const unionKeys = collectUnionKeys(targetEntries, targetFiles, rootFiles);
  const sources = buildSourceMap(targetFiles, rootFiles);
  const orderedSourceIds = sourceOrderForMode(mode);

  const rows = [];
  const conflicts = [];

  for (const key of unionKeys) {
    const entry = entriesByKey.get(key);
    const resolvedValue = firstSetValue(key, orderedSourceIds, sources);
    const fallback = isValueSet(entry?.exampleDefault) ? entry.exampleDefault : '';
    const value = resolvedValue ? resolvedValue.value : fallback;
    const provenance = resolvedValue ? resolvedValue.provenance : (isValueSet(fallback) ? 'entry.default' : 'empty');
    const conflict = conflictsForKey(key, sources);
    if (conflict) conflicts.push(conflict);
    rows.push({
      key,
      value,
      provenance,
      section: entry?.section || 'custom',
      description: entry?.description || 'Discovered from env files.',
      requiredIn: Array.isArray(entry?.requiredIn) ? entry.requiredIn : [],
      secret: entry?.secret === true,
    });
  }

  const readiness = evaluateReadiness(readinessState, mode, {
    profileFallback: options.profileFallback || profileConfig.profileFallback || 'accept-satisfied',
    runner: options.runner,
  });
  const targetIssues = splitTargetIssues(readiness, target.id);

  return {
    ok: true,
    target,
    targetPaths,
    profile: resolved.profile,
    aliasWarning: resolved.alias ? 'Profile alias "generic" is deprecated; using "forge-loop".' : null,
    mode,
    scope: classifyTargetScope(target.dir),
    entries: rows,
    conflicts,
    readiness: {
      ok: targetIssues.missing.length === 0,
      missing: targetIssues.missing,
      conflicts: targetIssues.conflicts,
      warnings: targetIssues.warnings,
    },
    discovery: readinessState.discovery,
    writePolicy: profileConfig.writePolicy || {},
  };
}

export async function writeEnvTargetValues(options = {}) {
  const mode = normalizeMode(options.mode);
  if (mode === 'headless') {
    throw new Error('headless mode is read-only. Use local/preview/production for writes.');
  }

  const snapshot = await getEnvTargetSnapshot(options);
  const targetPaths = snapshot.targetPaths;
  const writePath = modeWritePath(targetPaths, mode);
  if (!writePath) {
    throw new Error(`No writable env path configured for mode "${mode}".`);
  }

  const inputValues = normalizeInputValues(options.values || {});
  const existing = await readEnvFile(writePath);
  const nextValues = {
    ...existing.values,
    ...inputValues,
  };
  const orderedKeys = [...new Set([
    ...snapshot.entries.map((item) => item.key),
    ...Object.keys(existing.values || {}),
    ...Object.keys(nextValues),
  ])].sort((a, b) => a.localeCompare(b));
  const content = buildEnvContent(
    [
      '# Managed by RepoStudio Env workspace.',
      '# Generated via forge-env target-write (safe merge: preserve unknown keys).',
    ],
    orderedKeys,
    nextValues,
    commentsFromEntries(snapshot.entries),
  );

  const changed = [];
  const backups = [];
  if (existing.raw !== content) {
    if (snapshot.writePolicy?.backupOnWrite) {
      const backupPath = await backupFileIfExists(writePath);
      if (backupPath) backups.push(backupPath);
    }
    await writeTextFile(writePath, content);
    changed.push(path.relative(process.cwd(), writePath).replace(/\\/g, '/'));
  }

  const refreshed = await getEnvTargetSnapshot(options);
  return {
    ok: refreshed.readiness.ok,
    targetId: refreshed.target.id,
    mode,
    changed,
    backups,
    readiness: refreshed.readiness,
    message: refreshed.readiness.ok
      ? 'Saved and validated.'
      : `Saved, but readiness has gaps: ${refreshed.readiness.missing.join(', ')}`,
  };
}

