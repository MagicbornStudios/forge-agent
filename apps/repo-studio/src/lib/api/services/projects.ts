import { getJson, postJson } from '@/lib/api/http';
import type { RepoProjectMutationResponse, RepoProjectsResponse } from '@/lib/api/types';

export async function fetchRepoProjects() {
  return getJson<RepoProjectsResponse>('/api/repo/projects', {
    fallbackMessage: 'Unable to load projects.',
  });
}

export async function fetchActiveRepoProject() {
  return getJson<RepoProjectMutationResponse>('/api/repo/projects/active', {
    fallbackMessage: 'Unable to load active project.',
  });
}

export async function setActiveRepoProject(projectId: string) {
  return postJson<RepoProjectMutationResponse>('/api/repo/projects/active', {
    projectId,
  }, {
    fallbackMessage: 'Unable to set active project.',
  });
}

export async function importLocalRepoProject(input: { rootPath: string; name?: string }) {
  return postJson<RepoProjectMutationResponse>('/api/repo/projects/import-local', input, {
    fallbackMessage: 'Unable to import local project.',
    timeoutMs: 20000,
  });
}

export async function cloneRepoProject(input: { remoteUrl: string; targetPath: string; name?: string }) {
  return postJson<RepoProjectMutationResponse>('/api/repo/projects/clone', input, {
    fallbackMessage: 'Unable to clone project.',
    timeoutMs: 180000,
  });
}

