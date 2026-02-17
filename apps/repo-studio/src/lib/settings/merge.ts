import type { RepoSettingsObject } from './types';

function isObject(value: unknown): value is RepoSettingsObject {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function deepMergeSettings(base: RepoSettingsObject, patch: RepoSettingsObject): RepoSettingsObject {
  const next: RepoSettingsObject = { ...(base || {}) };
  for (const [key, value] of Object.entries(patch || {})) {
    if (Array.isArray(value)) {
      next[key] = [...value];
      continue;
    }
    if (isObject(value)) {
      const existing = isObject(next[key]) ? (next[key] as RepoSettingsObject) : {};
      next[key] = deepMergeSettings(existing, value);
      continue;
    }
    next[key] = value;
  }
  return next;
}

export function normalizeSettingsObject(value: unknown): RepoSettingsObject {
  if (!isObject(value)) return {};
  return value;
}

