import { getRepoStudioPayload } from '@/lib/payload-client';
import { deepMergeSettings, normalizeSettingsObject } from './merge';
import {
  REPO_LOCAL_SCOPE_ID,
  REPO_SETTINGS_DEFAULTS,
  type RepoSettingsObject,
  type RepoSettingsOverrideRecord,
  type RepoSettingsScope,
  type RepoSettingsSnapshot,
} from './types';

const SETTINGS_COLLECTION = 'repo-settings-overrides';

type PayloadShape = {
  id?: string;
  scope?: RepoSettingsScope;
  scopeId?: string | null;
  settings?: RepoSettingsObject;
  createdAt?: string;
  updatedAt?: string;
};

async function getRepoPayload() {
  return getRepoStudioPayload();
}

function normalizeScopeId(scope: RepoSettingsScope, scopeId?: string | null) {
  if (scope === 'app') return null;
  const value = String(scopeId || '').trim();
  if (!value) {
    return scope === 'local' ? REPO_LOCAL_SCOPE_ID : null;
  }
  return value;
}

function toRecord(doc: PayloadShape): RepoSettingsOverrideRecord | null {
  const id = String(doc?.id || '').trim();
  const scope = String(doc?.scope || '').trim() as RepoSettingsScope;
  if (!id || !scope || !['app', 'workspace', 'local'].includes(scope)) return null;
  return {
    id,
    scope,
    scopeId: doc?.scopeId == null ? null : String(doc.scopeId),
    settings: normalizeSettingsObject(doc?.settings),
    createdAt: doc?.createdAt ? String(doc.createdAt) : undefined,
    updatedAt: doc?.updatedAt ? String(doc.updatedAt) : undefined,
  };
}

async function findScopeDoc(scope: RepoSettingsScope, scopeId?: string | null) {
  const payload = await getRepoPayload();
  const normalizedScopeId = normalizeScopeId(scope, scopeId);
  const where = {
    and: [
      { scope: { equals: scope } },
      normalizedScopeId == null
        ? { scopeId: { exists: false } }
        : { scopeId: { equals: normalizedScopeId } },
    ],
  };

  const result = await payload.find({
    collection: SETTINGS_COLLECTION,
    where,
    limit: 1,
  });
  return result?.docs?.[0] || null;
}

export async function listRepoSettingsOverrides() {
  const payload = await getRepoPayload();
  const result = await payload.find({
    collection: SETTINGS_COLLECTION,
    limit: 2000,
    sort: '-updatedAt',
  });

  const docs: RepoSettingsOverrideRecord[] = [];
  for (const item of result?.docs || []) {
    const normalized = toRecord(item as PayloadShape);
    if (normalized) docs.push(normalized);
  }
  return docs;
}

export async function upsertRepoSettingsOverride(scope: RepoSettingsScope, scopeId: string | null, settings: RepoSettingsObject) {
  const payload = await getRepoPayload();
  const normalizedScopeId = normalizeScopeId(scope, scopeId);
  const existing = await findScopeDoc(scope, normalizedScopeId);

  if (existing?.id) {
    const merged = deepMergeSettings(
      normalizeSettingsObject(existing.settings),
      normalizeSettingsObject(settings),
    );
    const updated = await payload.update({
      collection: SETTINGS_COLLECTION,
      id: existing.id,
      data: {
        scope,
        scopeId: normalizedScopeId,
        settings: merged,
      },
    });
    return toRecord(updated as PayloadShape);
  }

  const created = await payload.create({
    collection: SETTINGS_COLLECTION,
    data: {
      scope,
      scopeId: normalizedScopeId,
      settings: normalizeSettingsObject(settings),
    },
  });
  return toRecord(created as PayloadShape);
}

export async function resetRepoSettings(scope?: RepoSettingsScope, scopeId?: string | null) {
  const payload = await getRepoPayload();
  const docs = await listRepoSettingsOverrides();
  const targetScopeId = scope ? normalizeScopeId(scope, scopeId) : null;

  for (const item of docs) {
    if (scope && item.scope !== scope) continue;
    if (scope && targetScopeId != null && item.scopeId !== targetScopeId) continue;
    if (scope && targetScopeId == null && item.scopeId != null) continue;
    // eslint-disable-next-line no-await-in-loop
    await payload.delete({
      collection: SETTINGS_COLLECTION,
      id: item.id,
    });
  }
}

function pickScopeSettings(
  docs: RepoSettingsOverrideRecord[],
  scope: RepoSettingsScope,
  scopeId: string | null,
) {
  for (const item of docs) {
    if (item.scope !== scope) continue;
    if ((item.scopeId || null) !== (scopeId || null)) continue;
    return normalizeSettingsObject(item.settings);
  }
  return {};
}

export async function buildRepoSettingsSnapshot(options: { workspaceId?: string; loopId?: string } = {}): Promise<RepoSettingsSnapshot> {
  const workspaceId = String(options.workspaceId || 'planning').trim() || 'planning';
  const loopId = String(options.loopId || 'default').trim().toLowerCase() || 'default';
  const docs = await listRepoSettingsOverrides();

  const app = pickScopeSettings(docs, 'app', null);
  const workspace = pickScopeSettings(docs, 'workspace', workspaceId);
  const local = pickScopeSettings(docs, 'local', REPO_LOCAL_SCOPE_ID);

  const merged = deepMergeSettings(
    deepMergeSettings(
      deepMergeSettings(REPO_SETTINGS_DEFAULTS, app),
      workspace,
    ),
    local,
  );

  return {
    ok: true,
    app,
    workspace,
    local,
    merged,
    meta: {
      workspaceId,
      loopId,
    },
  };
}
