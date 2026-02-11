import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';
import {
  parseOrganizationIdFromRequestUrl,
  requireAuthenticatedUser,
  resolveOrganizationFromInput,
} from '@/lib/server/organizations';

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
  inputTokens?: number | null;
  outputTokens?: number | null;
  totalTokens?: number | null;
  totalCostUsd?: number | null;
  status?: string | null;
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

    const result = await payload.find({
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
      sort: '-createdAt',
      limit: 5000,
      depth: 0,
    });

    const docs = result.docs as AiUsageDoc[];
    let inputTokens = 0;
    let outputTokens = 0;
    let totalTokens = 0;
    let totalCostUsd = 0;
    let successfulRequests = 0;
    let failedRequests = 0;
    const byModel = new Map<string, { model: string; totalTokens: number; totalCostUsd: number }>();

    for (const doc of docs) {
      inputTokens += typeof doc.inputTokens === 'number' ? doc.inputTokens : 0;
      outputTokens += typeof doc.outputTokens === 'number' ? doc.outputTokens : 0;
      totalTokens += typeof doc.totalTokens === 'number' ? doc.totalTokens : 0;
      totalCostUsd += typeof doc.totalCostUsd === 'number' ? doc.totalCostUsd : 0;

      if (doc.status === 'error') {
        failedRequests += 1;
      } else {
        successfulRequests += 1;
      }

      const model = typeof doc.model === 'string' && doc.model.length > 0 ? doc.model : 'unknown';
      const current = byModel.get(model) ?? { model, totalTokens: 0, totalCostUsd: 0 };
      current.totalTokens += typeof doc.totalTokens === 'number' ? doc.totalTokens : 0;
      current.totalCostUsd += typeof doc.totalCostUsd === 'number' ? doc.totalCostUsd : 0;
      byModel.set(model, current);
    }

    const topModels = [...byModel.values()]
      .sort((a, b) => b.totalCostUsd - a.totalCostUsd)
      .slice(0, 5)
      .map((entry) => ({
        model: entry.model,
        totalTokens: entry.totalTokens,
        totalCostUsd: Number(entry.totalCostUsd.toFixed(6)),
      }));

    return NextResponse.json({
      range,
      activeOrganizationId: activeOrgId,
      summary: {
        requestCount: docs.length,
        successfulRequests,
        failedRequests,
        inputTokens,
        outputTokens,
        totalTokens,
        totalCostUsd: Number(totalCostUsd.toFixed(6)),
      },
      topModels,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to load AI usage summary.';
    const status = message.includes('Not a member') ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
