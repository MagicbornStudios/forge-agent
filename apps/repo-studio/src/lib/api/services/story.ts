import { getJson, postJson } from '@/lib/api/http';
import type {
  StoryMutationPayload,
  StoryPublishApplyResponse,
  StoryPublishPreviewPayload,
  StoryPublishQueueResponse,
  StoryPagePayload,
  StoryReaderPayload,
  StoryTreePayload,
} from '@/lib/api/types';

export async function fetchStoryTree(input: {
  loopId: string;
  domain: string;
  scopeOverrideToken?: string;
}) {
  const params = new URLSearchParams({
    loopId: input.loopId,
    domain: input.domain,
  });
  if (input.scopeOverrideToken) params.set('scopeOverrideToken', input.scopeOverrideToken);
  return getJson<StoryTreePayload>(`/api/repo/story/tree?${params.toString()}`, {
    fallbackMessage: 'Unable to load story tree.',
  });
}

export async function fetchStoryPage(input: {
  path: string;
  loopId: string;
  domain: string;
  scopeOverrideToken?: string;
}) {
  const params = new URLSearchParams({
    path: input.path,
    loopId: input.loopId,
    domain: input.domain,
  });
  if (input.scopeOverrideToken) params.set('scopeOverrideToken', input.scopeOverrideToken);
  return getJson<StoryPagePayload>(`/api/repo/story/page?${params.toString()}`, {
    fallbackMessage: `Unable to load story page ${input.path}.`,
  });
}

export async function fetchStoryReader(input: {
  path?: string;
  loopId: string;
  domain: string;
  scopeOverrideToken?: string;
}) {
  const params = new URLSearchParams({
    loopId: input.loopId,
    domain: input.domain,
  });
  if (input.path) params.set('path', input.path);
  if (input.scopeOverrideToken) params.set('scopeOverrideToken', input.scopeOverrideToken);
  return getJson<StoryReaderPayload>(`/api/repo/story/reader?${params.toString()}`, {
    fallbackMessage: 'Unable to load story reader.',
  });
}

export async function saveStoryPage(input: {
  path: string;
  content: string;
  loopId: string;
  domain: string;
  scopeOverrideToken?: string;
}) {
  return postJson<StoryMutationPayload>('/api/repo/story/page/save', {
    path: input.path,
    content: input.content,
    approved: true,
    domain: input.domain,
    loopId: input.loopId,
    scopeOverrideToken: input.scopeOverrideToken || undefined,
  }, {
    fallbackMessage: `Unable to save story page ${input.path}.`,
  });
}

export async function createStoryPage(input: {
  actIndex: number;
  chapterIndex: number;
  pageIndex: number;
  content: string;
  loopId: string;
  domain: string;
  scopeOverrideToken?: string;
}) {
  return postJson<StoryMutationPayload>('/api/repo/story/create', {
    ...input,
    scopeOverrideToken: input.scopeOverrideToken || undefined,
  }, {
    fallbackMessage: 'Unable to create story page.',
  });
}

export async function previewStoryPublish(input: {
  path: string;
  loopId: string;
  domain: string;
  scopeOverrideToken?: string;
}) {
  return postJson<StoryPublishPreviewPayload>('/api/repo/story/publish/preview', {
    ...input,
    scopeOverrideToken: input.scopeOverrideToken || undefined,
  }, {
    fallbackMessage: `Unable to preview story publish for ${input.path}.`,
  });
}

export async function queueStoryPublish(input: {
  previewToken?: string;
  path?: string;
  loopId?: string;
  domain?: string;
  scopeOverrideToken?: string;
  editorTarget?: string;
}) {
  return postJson<StoryPublishQueueResponse>('/api/repo/story/publish/queue', {
    ...input,
    scopeOverrideToken: input.scopeOverrideToken || undefined,
  }, {
    fallbackMessage: 'Unable to queue story publish proposal.',
  });
}

export async function applyStoryPublish(input: {
  proposalId?: string;
  previewToken?: string;
  approved: boolean;
  force?: boolean;
}) {
  return postJson<StoryPublishApplyResponse>('/api/repo/story/publish/apply', input, {
    fallbackMessage: 'Unable to apply story publish proposal.',
  });
}
