import {
  buildRepoSettingsSnapshot,
  listRepoSettingsOverrides,
  resetRepoSettings,
  upsertRepoSettingsOverride,
} from './payload-repository';
import { normalizeSettingsObject } from './merge';
import type { RepoSettingsScope } from './types';

export async function getRepoSettingsSnapshot(options: { workspaceId?: string; loopId?: string } = {}) {
  return buildRepoSettingsSnapshot(options);
}

export async function upsertRepoSettings(options: {
  scope: RepoSettingsScope;
  scopeId?: string | null;
  settings: Record<string, unknown>;
  workspaceId?: string;
  loopId?: string;
}) {
  await upsertRepoSettingsOverride(
    options.scope,
    options.scopeId || null,
    normalizeSettingsObject(options.settings),
  );
  return buildRepoSettingsSnapshot({
    workspaceId: options.workspaceId,
    loopId: options.loopId,
  });
}

export async function resetRepoSettingsScopes(options: {
  scope?: RepoSettingsScope;
  scopeId?: string | null;
  workspaceId?: string;
  loopId?: string;
}) {
  await resetRepoSettings(options.scope, options.scopeId || null);
  return buildRepoSettingsSnapshot({
    workspaceId: options.workspaceId,
    loopId: options.loopId,
  });
}

export async function exportRepoSettings(options: { workspaceId?: string; loopId?: string } = {}) {
  const snapshot = await buildRepoSettingsSnapshot(options);
  const records = await listRepoSettingsOverrides();
  return {
    ok: true,
    records,
    snapshot,
  };
}

