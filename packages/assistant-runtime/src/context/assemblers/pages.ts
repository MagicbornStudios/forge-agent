export interface PageSnippet {
  id: number;
  title: string;
  snippet: string;
  blockCount: number;
}

export interface PagesContextSnapshot {
  pageCount: number;
  pages: PageSnippet[];
  budgets: {
    maxPages: number;
    maxBlocksPerPage: number;
    maxCharsPerSnippet: number;
  };
}

interface PayloadClient {
  find(args: Record<string, unknown>): Promise<{ docs: Array<Record<string, unknown>> }>;
}

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  if (typeof value === 'object' && value != null && 'id' in value) {
    return asNumber((value as { id?: unknown }).id);
  }
  return null;
}

function extractStrings(value: unknown, results: string[] = []): string[] {
  if (results.length >= 24) return results;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.length > 0) results.push(trimmed);
    return results;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      extractStrings(item, results);
      if (results.length >= 24) break;
    }
    return results;
  }

  if (value && typeof value === 'object') {
    for (const child of Object.values(value as Record<string, unknown>)) {
      extractStrings(child, results);
      if (results.length >= 24) break;
    }
  }

  return results;
}

function pageTitle(page: Record<string, unknown>): string {
  const direct = typeof page.title === 'string' ? page.title.trim() : '';
  if (direct) return direct;

  const properties = page.properties as Record<string, unknown> | undefined;
  const fromProperties = extractStrings(properties).find((value) => value.length > 0);
  if (fromProperties) return fromProperties;

  return `Page ${String(page.id ?? '')}`.trim();
}

export async function assemblePagesContext(input: {
  payload: PayloadClient;
  projectId: number;
  maxPages?: number;
  maxBlocksPerPage?: number;
  maxCharsPerSnippet?: number;
}): Promise<PagesContextSnapshot> {
  const maxPages = input.maxPages ?? 5;
  const maxBlocksPerPage = input.maxBlocksPerPage ?? 3;
  const maxCharsPerSnippet = input.maxCharsPerSnippet ?? 500;

  const pagesResult = await input.payload.find({
    collection: 'pages',
    where: {
      and: [
        { project: { equals: input.projectId } },
        { archived: { not_equals: true } },
        { in_trash: { not_equals: true } },
      ],
    },
    sort: '-updatedAt',
    limit: maxPages,
    depth: 0,
    overrideAccess: true,
  });

  const pages: PageSnippet[] = [];

  for (const page of pagesResult.docs) {
    const pageId = asNumber(page.id);
    if (pageId == null) continue;

    const blockResult = await input.payload.find({
      collection: 'blocks',
      where: {
        and: [
          { page: { equals: pageId } },
          { archived: { not_equals: true } },
          { in_trash: { not_equals: true } },
        ],
      },
      sort: 'position',
      limit: maxBlocksPerPage,
      depth: 0,
      overrideAccess: true,
    });

    const blockText = blockResult.docs
      .flatMap((block) => extractStrings(block.payload))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, maxCharsPerSnippet);

    pages.push({
      id: pageId,
      title: pageTitle(page),
      snippet: blockText,
      blockCount: blockResult.docs.length,
    });
  }

  return {
    pageCount: pages.length,
    pages,
    budgets: {
      maxPages,
      maxBlocksPerPage,
      maxCharsPerSnippet,
    },
  };
}

export function formatPagesContext(context: PagesContextSnapshot): string {
  if (context.pageCount === 0) {
    return 'Writer context: no pages found for this project.';
  }

  const lines = context.pages.map((page) => {
    const snippet = page.snippet ? ` ${page.snippet}` : '';
    return `- ${page.title} (${page.blockCount} blocks):${snippet}`;
  });

  return ['Writer pages context (read-only snippets):', ...lines].join('\n');
}
