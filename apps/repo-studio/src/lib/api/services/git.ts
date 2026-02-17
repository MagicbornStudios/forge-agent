import { getJson, postJson } from '@/lib/api/http';
import type {
  GitBranchesResponse,
  GitLogResponse,
  GitMutationResponse,
  GitStatusResponse,
} from '@/lib/api/types';

export async function fetchGitStatus() {
  return getJson<GitStatusResponse>('/api/repo/git/status', {
    fallbackMessage: 'Unable to load git status.',
  });
}

export async function fetchGitBranches() {
  return getJson<GitBranchesResponse>('/api/repo/git/branches', {
    fallbackMessage: 'Unable to load git branches.',
  });
}

export async function fetchGitLog(limit = 30) {
  return getJson<GitLogResponse>(`/api/repo/git/log?limit=${encodeURIComponent(String(limit))}`, {
    fallbackMessage: 'Unable to load git history.',
  });
}

export async function createGitBranch(name: string) {
  return postJson<GitMutationResponse>('/api/repo/git/branch/create', { name }, {
    fallbackMessage: `Unable to create branch ${name}.`,
  });
}

export async function switchGitBranch(name: string) {
  return postJson<GitMutationResponse>('/api/repo/git/branch/switch', { name }, {
    fallbackMessage: `Unable to switch branch ${name}.`,
  });
}

export async function restoreGitPaths(paths: string[]) {
  return postJson<GitMutationResponse>('/api/repo/git/restore', { paths }, {
    fallbackMessage: 'Unable to restore selected paths.',
  });
}

export async function stageGitPaths(paths: string[]) {
  return postJson<GitMutationResponse>('/api/repo/git/stage', { paths }, {
    fallbackMessage: 'Unable to stage selected paths.',
  });
}

export async function commitGitChanges(message: string) {
  return postJson<GitMutationResponse>('/api/repo/git/commit', { message }, {
    fallbackMessage: 'Unable to create git commit.',
  });
}

