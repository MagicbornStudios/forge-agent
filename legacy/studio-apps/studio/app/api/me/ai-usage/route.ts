import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';
import {
  parseOrganizationIdFromRequestUrl,
  requireAuthenticatedUser,
  resolveOrganizationFromInput,
} from '@/lib/server/organizations';
import { findAllDocs } from '@/lib/server/payload-pagination';

type RangeKey = '7d' | '30d' | '90d';

const RANGE_TO_DAYS: Record<RangeKey, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
};

function parseRange(value: string | null): RangeKey {
  if (value === '7d' || value === '90d') return value;
  return '30d';
}

function rangeStartIso(range: RangeKey): string {
  const days = RANGE_TO_DAYS[range];
  const now = Date.now();
  const start = new Date(now - days * 24 * 60 * 60 * 1000);
  return start.toISOString();
}

type AiUsageDoc = {
  model?: string | null;
  routeKey?: string | null;
  inputTokens?: number | null;
  outputTokens?: number | null;
  totalTokens?: number | null;
  inputCostUsd?: number | null;
  outputCostUsd?: number | null;
  totalCostUsd?: number | null;
  status?: string | null;
  createdAt?: string | null;
};

export async function GET(req: Request) {
  try {
    const payload = await getPayload({ config });
    const user = await requireAuthenticatedUser(payload, req.headers);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const range = parseRange(url.searchParams.get('range'));
    const requestedOrgId = parseOrganizationIdFromRequestUrl(req);
    const context = await resolveOrganizationFromInput(
      payload,
      user,
      requestedOrgId ?? undefined,
      { strictRequestedMembership: true },
    );
    const startIso = rangeStartIso(range);
    const activeOrgId = context.activeOrganizationId;

    const docs = await findAllDocs<AiUsageDoc>(payload, {
      collection: 'ai-usage-events',
      where: {
        and: [
          { createdAt: { greater_than_equal: startIso } },
          {
            or: [
              { organization: { equals: activeOrgId } },
              {
                and: [
                  { organization: { exists: false } },
                  { user: { equals: user.id } },
                ],
              },
            ],
          },
        ],
      },
      sort: 'createdAt',
      overrideAccess: true,
      limit: 500,
      depth: 0,
    });
    const byDay = new Map<
      string,
      {
        date: string;
        inputTokens: number;
        outputTokens: number;
        totalTokens: number;
        inputCostUsd: number;
        outputCostUsd: number;
        totalCostUsd: number;
        count: number;
      }
    >();

    for (const doc of docs) {
      const day = doc.createdAt ? new Date(doc.createdAt).toISOString().slice(0, 10) : null;
      if (!day) continue;
      const entry = byDay.get(day) ?? {
        date: day,
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        inputCostUsd: 0,
        outputCostUsd: 0,
        totalCostUsd: 0,
        count: 0,
      };
      entry.inputTokens += typeof doc.inputTokens === 'number' ? doc.inputTokens : 0;
      entry.outputTokens += typeof doc.outputTokens === 'number' ? doc.outputTokens : 0;
      entry.totalTokens += typeof doc.totalTokens === 'number' ? doc.totalTokens : 0;
      entry.inputCostUsd += typeof doc.inputCostUsd === 'number' ? doc.inputCostUsd : 0;
      entry.outputCostUsd += typeof doc.outputCostUsd === 'number' ? doc.outputCostUsd : 0;
      entry.totalCostUsd += typeof doc.totalCostUsd === 'number' ? doc.totalCostUsd : 0;
      entry.count += 1;
      byDay.set(day, entry);
    }

    const rows = [...byDay.values()]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((entry) => ({
        ...entry,
        inputCostUsd: Number(entry.inputCostUsd.toFixed(6)),
        outputCostUsd: Number(entry.outputCostUsd.toFixed(6)),
        totalCostUsd: Number(entry.totalCostUsd.toFixed(6)),
      }));

    return NextResponse.json({
      range,
      activeOrganizationId: activeOrgId,
      series: rows,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to load AI usage.';
    const status = message.includes('Not a member') ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
