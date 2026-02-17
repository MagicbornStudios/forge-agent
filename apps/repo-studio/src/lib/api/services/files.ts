import { getJson, postJson } from '@/lib/api/http';
import type {
  FileReadResponse,
  FilesTreeResponse,
  FileWriteResponse,
  RepoScope,
} from '@/lib/api/types';

export async function fetchRepoFilesTree(input: {
  scope: RepoScope;
  loopId: string;
  domain?: string;
  scopeOverrideToken?: string;
}) {
  const params = new URLSearchParams({
    scope: input.scope,
    loopId: input.loopId,
  });
  if (input.domain) params.set('domain', input.domain);
  if (input.scopeOverrideToken) params.set('scopeOverrideToken', input.scopeOverrideToken);
  return getJson<FilesTreeResponse>(`/api/repo/files/tree?${params.toString()}`, {
    fallbackMessage: 'Unable to load repository file tree.',
  });
}

export async function fetchRepoFile(filePath: string) {
  return getJson<FileReadResponse>(`/api/repo/files/read?path=${encodeURIComponent(filePath)}`, {
    fallbackMessage: `Unable to read file ${filePath}.`,
  });
}

export async function writeRepoFile(input: {
  path: string;
  content: string;
  createIfMissing?: boolean;
}) {
  return postJson<FileWriteResponse>('/api/repo/files/write', {
    path: input.path,
    content: input.content,
    createIfMissing: input.createIfMissing === true,
    approved: true,
  }, {
    fallbackMessage: `Unable to save file ${input.path}.`,
  });
}

