import { getRepoStudioPayload } from '@/lib/payload-client';

export type RepoPageRecord = {
  id: string;
  loopId: string;
  sourcePath: string;
  title: string;
  slug: string;
  contentHash: string;
  metadata: Record<string, unknown>;
};

export type RepoBlockRecord = {
  id: string;
  page: string;
  type: string;
  position: number;
  payload: Record<string, unknown>;
  sourceHash: string;
};

export type RepoBlockDraft = {
  type: string;
  position: number;
  payload: Record<string, unknown>;
  sourceHash: string;
};

function normalizePage(record: any): RepoPageRecord | null {
  const id = String(record?.id || '').trim();
  if (!id) return null;
  const metadata = record?.metadata && typeof record.metadata === 'object' && !Array.isArray(record.metadata)
    ? record.metadata as Record<string, unknown>
    : {};
  return {
    id,
    loopId: String(record?.loopId || ''),
    sourcePath: String(record?.sourcePath || ''),
    title: String(record?.title || ''),
    slug: String(record?.slug || ''),
    contentHash: String(record?.contentHash || ''),
    metadata,
  };
}

function normalizeBlock(record: any): RepoBlockRecord | null {
  const id = String(record?.id || '').trim();
  if (!id) return null;
  const pageValue = typeof record?.page === 'object'
    ? String(record.page?.id || '')
    : String(record?.page || '');
  const payload = record?.payload && typeof record.payload === 'object' && !Array.isArray(record.payload)
    ? record.payload as Record<string, unknown>
    : {};
  return {
    id,
    page: pageValue,
    type: String(record?.type || ''),
    position: Number(record?.position || 0),
    payload,
    sourceHash: String(record?.sourceHash || ''),
  };
}

export async function findRepoPageBySource(loopId: string, sourcePath: string) {
  const payload = await getRepoStudioPayload();
  const result = await payload.find({
    collection: 'repo-pages',
    where: {
      and: [
        { loopId: { equals: loopId } },
        { sourcePath: { equals: sourcePath } },
      ],
    },
    limit: 1,
  });
  return normalizePage(result?.docs?.[0]) || null;
}

export async function upsertRepoPage(input: {
  loopId: string;
  sourcePath: string;
  title: string;
  slug: string;
  contentHash: string;
  metadata: Record<string, unknown>;
}) {
  const payload = await getRepoStudioPayload();
  const existing = await findRepoPageBySource(input.loopId, input.sourcePath);

  if (existing?.id) {
    const updated = await payload.update({
      collection: 'repo-pages',
      id: existing.id,
      data: {
        loopId: input.loopId,
        sourcePath: input.sourcePath,
        title: input.title,
        slug: input.slug,
        contentHash: input.contentHash,
        metadata: input.metadata,
      },
    });
    return normalizePage(updated);
  }

  const created = await payload.create({
    collection: 'repo-pages',
    data: {
      loopId: input.loopId,
      sourcePath: input.sourcePath,
      title: input.title,
      slug: input.slug,
      contentHash: input.contentHash,
      metadata: input.metadata,
    },
  });
  return normalizePage(created);
}

export async function listRepoBlocksForPage(pageId: string) {
  const payload = await getRepoStudioPayload();
  const result = await payload.find({
    collection: 'repo-blocks',
    where: {
      page: {
        equals: pageId,
      },
    },
    limit: 5000,
    sort: 'position',
  });
  return (result?.docs || []).map(normalizeBlock).filter(Boolean) as RepoBlockRecord[];
}

export async function replaceRepoBlocksForPage(pageId: string, drafts: RepoBlockDraft[]) {
  const payload = await getRepoStudioPayload();
  const existing = await listRepoBlocksForPage(pageId);
  for (const block of existing) {
    // eslint-disable-next-line no-await-in-loop
    await payload.delete({
      collection: 'repo-blocks',
      id: block.id,
    });
  }

  const created: RepoBlockRecord[] = [];
  for (const draft of drafts) {
    // eslint-disable-next-line no-await-in-loop
    const block = await payload.create({
      collection: 'repo-blocks',
      data: {
        page: pageId,
        type: draft.type,
        position: draft.position,
        payload: draft.payload,
        sourceHash: draft.sourceHash,
      },
    });
    const normalized = normalizeBlock(block);
    if (normalized) created.push(normalized);
  }

  return created;
}
