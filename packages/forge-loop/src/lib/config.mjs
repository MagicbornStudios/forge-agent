import { readJson } from './fs-utils.mjs';
import { DEFAULT_CONFIG, LEGACY_SYNC_TARGETS, PLANNING_FILES } from './paths.mjs';

function mergeObjects(base, override) {
  const result = { ...base };
  if (!override || typeof override !== 'object') return result;

  for (const [key, value] of Object.entries(override)) {
    if (Array.isArray(value)) {
      result[key] = [...value];
      continue;
    }

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = mergeObjects(base?.[key] || {}, value);
      continue;
    }

    result[key] = value;
  }

  return result;
}

export function loadPlanningConfig() {
  const onDisk = readJson(PLANNING_FILES.config, null) || {};
  const merged = mergeObjects(DEFAULT_CONFIG, onDisk);
  return {
    ...merged,
    runtime: 'prompt-pack',
  };
}

export function getAutoCommitEnabled(config = null) {
  const resolved = config || loadPlanningConfig();
  return resolved?.git?.autoCommit !== false;
}

export function getCommitScope(config = null) {
  const resolved = config || loadPlanningConfig();
  const configured = resolved?.git?.commitScope;
  if (Array.isArray(configured) && configured.length > 0) return configured;
  return [...DEFAULT_CONFIG.git.commitScope];
}

export function getVerificationProfile(config = null) {
  const resolved = config || loadPlanningConfig();
  const profile = String(resolved?.verification?.profile || '').trim();
  return profile === 'generic' ? 'generic' : 'forge-agent';
}

export function isStrictVerificationEnabled(config = null, strictFlag = undefined) {
  if (typeof strictFlag === 'boolean') return strictFlag;
  const resolved = config || loadPlanningConfig();
  return resolved?.verification?.strictDefault !== false;
}

export function isLegacySyncEnabled(config = null) {
  const resolved = config || loadPlanningConfig();
  return resolved?.legacySync?.enabled !== false;
}

export function getLegacySyncTargets(config = null) {
  const resolved = config || loadPlanningConfig();
  const configured = resolved?.legacySync?.targets;
  if (Array.isArray(configured) && configured.length > 0) return configured;
  return [...LEGACY_SYNC_TARGETS];
}
