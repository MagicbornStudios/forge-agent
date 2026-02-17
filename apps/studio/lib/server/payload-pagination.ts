import type { Payload } from 'payload';

export type FindAllDocsOptions = {
  collection: string;
  where?: Record<string, unknown>;
  depth?: number;
  sort?: string;
  overrideAccess?: boolean;
  limit?: number;
};

/**
 * Reads all pages from a Payload collection query using pagination.
 */
export async function findAllDocs<TDoc = Record<string, unknown>>(
  payload: Payload,
  options: FindAllDocsOptions,
): Promise<TDoc[]> {
  const docs: TDoc[] = [];
  const pageSize = Math.max(1, Math.min(1000, options.limit ?? 500));
  let page = 1;

  while (true) {
    const rawResult = await payload.find({
      ...options,
      limit: pageSize,
      page,
    } as any);
    const result = rawResult as unknown as {
      docs: unknown[];
      hasNextPage?: boolean;
      nextPage?: number | null;
    };

    docs.push(...(result.docs as TDoc[]));

    if (!result.hasNextPage) {
      break;
    }

    page = result.nextPage ?? page + 1;
    if (page > 10_000) {
      break;
    }
  }

  return docs;
}
