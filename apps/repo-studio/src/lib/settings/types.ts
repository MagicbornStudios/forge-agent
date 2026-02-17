import { REPO_SETTINGS_GENERATED_DEFAULTS } from '@/lib/settings/generated/defaults';

export type RepoSettingsScope = 'app' | 'workspace' | 'local';

export type RepoSettingsObject = Record<string, unknown>;

export type RepoSettingsSnapshot = {
  ok: true;
  app: RepoSettingsObject;
  workspace: RepoSettingsObject;
  local: RepoSettingsObject;
  merged: RepoSettingsObject;
  meta: {
    workspaceId: string;
    loopId: string;
  };
};

export type RepoSettingsOverrideRecord = {
  id: string;
  scope: RepoSettingsScope;
  scopeId: string | null;
  settings: RepoSettingsObject;
  createdAt?: string;
  updatedAt?: string;
};

export const REPO_SETTINGS_DEFAULTS: RepoSettingsObject = {
  ...REPO_SETTINGS_GENERATED_DEFAULTS,
};

export const REPO_LOCAL_SCOPE_ID = 'default';
