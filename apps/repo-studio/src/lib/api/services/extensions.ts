import { getJson } from '@/lib/api/http';
import { postJson } from '@/lib/api/http';
import type {
  RepoWorkspaceExtensionsResponse,
  RepoWorkspaceInstallResponse,
  RepoWorkspaceRegistryResponse,
  RepoWorkspaceRemoveResponse,
} from '@/lib/api/types';

export async function fetchRepoWorkspaceExtensions() {
  return getJson<RepoWorkspaceExtensionsResponse>('/api/repo/extensions', {
    fallbackMessage: 'Unable to load workspace extensions.',
    timeoutMs: 15000,
    cache: 'no-store',
  });
}

export async function fetchRepoWorkspaceExtensionRegistry() {
  return getJson<RepoWorkspaceRegistryResponse>('/api/repo/extensions/registry', {
    fallbackMessage: 'Unable to load extension registry.',
    timeoutMs: 20000,
    cache: 'no-store',
  });
}

export async function installRepoWorkspaceExtension(input: {
  extensionId: string;
  replace?: boolean;
}) {
  return postJson<RepoWorkspaceInstallResponse>('/api/repo/extensions/install', input, {
    fallbackMessage: 'Unable to install extension.',
    timeoutMs: 30000,
  });
}

export async function removeRepoWorkspaceExtension(input: {
  extensionId: string;
}) {
  return postJson<RepoWorkspaceRemoveResponse>('/api/repo/extensions/remove', input, {
    fallbackMessage: 'Unable to remove extension.',
    timeoutMs: 20000,
  });
}
