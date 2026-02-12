import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';
import {
  generateApiKeyMaterial,
  sanitizeRequestedScopes,
  getClientIpFromHeaders,
} from '@/lib/server/api-keys';
import {
  parseOrganizationIdFromRequestUrl,
  requireAuthenticatedUser,
  resolveOrganizationFromInput,
} from '@/lib/server/organizations';

const MAX_ACTIVE_KEYS_PER_ORG = 25;

type ApiKeyDoc = {
  id: number;
  name: string;
  keyPrefix: string;
  keyLast4: string;
  scopes?: string[] | string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  expiresAt?: string | null;
  revokedAt?: string | null;
  requestCount?: number | null;
  inputTokens?: number | null;
  outputTokens?: number | null;
  totalCostUsd?: number | null;
  lastUsedAt?: string | null;
};

function toFiniteNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

function normalizeScopes(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((entry): entry is string => typeof entry === 'string');
  }
  if (typeof value === 'string') return [value];
  return [];
}

function toApiKeySummary(doc: ApiKeyDoc) {
  const now = Date.now();
  const revokedAt =
    typeof doc.revokedAt === 'string' && doc.revokedAt.trim().length > 0
      ? doc.revokedAt
      : null;
  const expiresAt =
    typeof doc.expiresAt === 'string' && doc.expiresAt.trim().length > 0
      ? doc.expiresAt
      : null;
  const isExpired =
    expiresAt != null ? new Date(expiresAt).getTime() <= now : false;

  return {
    id: doc.id,
    name: doc.name,
    keyPrefix: doc.keyPrefix,
    keyLast4: doc.keyLast4,
    scopes: normalizeScopes(doc.scopes),
    createdAt: doc.createdAt ?? null,
    updatedAt: doc.updatedAt ?? null,
    expiresAt,
    revokedAt,
    isActive: revokedAt == null && !isExpired,
    requestCount: Math.max(0, Math.round(toFiniteNumber(doc.requestCount))),
    inputTokens: Math.max(0, Math.round(toFiniteNumber(doc.inputTokens))),
    outputTokens: Math.max(0, Math.round(toFiniteNumber(doc.outputTokens))),
    totalCostUsd: Math.max(0, toFiniteNumber(doc.totalCostUsd)),
    lastUsedAt: doc.lastUsedAt ?? null,
  };
}

function parseExpiresAt(raw: unknown): string | null {
  if (typeof raw !== 'string' || raw.trim().length === 0) return null;
  const parsed = new Date(raw);
  if (!Number.isFinite(parsed.getTime())) return null;
  return parsed.toISOString();
}

export async function GET(req: Request) {
  try {
    const payload = await getPayload({ config });
    const user = await requireAuthenticatedUser(payload, req.headers);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requestedOrgId = parseOrganizationIdFromRequestUrl(req);
    const context = await resolveOrganizationFromInput(
      payload,
      user,
      requestedOrgId,
      { strictRequestedMembership: requestedOrgId != null },
    );

    const result = await payload.find({
      collection: 'api-keys',
      where: {
        and: [
          {
            user: {
              equals: user.id,
            },
          },
          {
            organization: {
              equals: context.activeOrganizationId,
            },
          },
        ],
      },
      limit: 100,
      sort: '-createdAt',
      depth: 0,
      overrideAccess: true,
    });

    return NextResponse.json(
      {
        activeOrganizationId: context.activeOrganizationId,
        apiKeys: (result.docs as ApiKeyDoc[]).map(toApiKeySummary),
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load API keys.';
    const status = message.includes('Not a member') ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(req: Request) {
  try {
    const payload = await getPayload({ config });
    const user = await requireAuthenticatedUser(payload, req.headers);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await req.json().catch(() => ({}))) as {
      name?: unknown;
      scopes?: unknown;
      expiresAt?: unknown;
      organizationId?: unknown;
      orgId?: unknown;
    };

    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (name.length < 3 || name.length > 80) {
      return NextResponse.json(
        { error: 'Key name must be between 3 and 80 characters.' },
        { status: 400 },
      );
    }

    const requestedOrgRaw =
      typeof body.organizationId === 'number' || typeof body.organizationId === 'string'
        ? body.organizationId
        : body.orgId;
    const requestedOrgId =
      typeof requestedOrgRaw === 'number'
        ? requestedOrgRaw
        : typeof requestedOrgRaw === 'string' && requestedOrgRaw.trim().length > 0
          ? Number(requestedOrgRaw)
          : null;
    const context = await resolveOrganizationFromInput(
      payload,
      user,
      Number.isFinite(requestedOrgId ?? NaN) ? requestedOrgId : null,
      { strictRequestedMembership: true },
    );

    const expiresAt = parseExpiresAt(body.expiresAt);
    if (body.expiresAt != null && expiresAt == null) {
      return NextResponse.json({ error: 'Invalid expiration date.' }, { status: 400 });
    }
    if (expiresAt != null && new Date(expiresAt).getTime() <= Date.now()) {
      return NextResponse.json(
        { error: 'Expiration must be in the future.' },
        { status: 400 },
      );
    }

    const scopes = sanitizeRequestedScopes(body.scopes);

    const existing = await payload.find({
      collection: 'api-keys',
      where: {
        and: [
          { user: { equals: user.id } },
          { organization: { equals: context.activeOrganizationId } },
        ],
      },
      limit: 200,
      depth: 0,
      overrideAccess: true,
    });

    const now = Date.now();
    const activeCount = (existing.docs as ApiKeyDoc[]).filter((doc) => {
      const revokedAt =
        typeof doc.revokedAt === 'string' && doc.revokedAt.trim().length > 0
          ? new Date(doc.revokedAt).getTime()
          : null;
      const expiresAtMs =
        typeof doc.expiresAt === 'string' && doc.expiresAt.trim().length > 0
          ? new Date(doc.expiresAt).getTime()
          : null;
      const revoked = revokedAt != null && revokedAt <= now;
      const expired = expiresAtMs != null && expiresAtMs <= now;
      return !revoked && !expired;
    }).length;

    if (activeCount >= MAX_ACTIVE_KEYS_PER_ORG) {
      return NextResponse.json(
        {
          error: `Maximum active key limit reached (${MAX_ACTIVE_KEYS_PER_ORG}) for this organization.`,
        },
        { status: 429 },
      );
    }

    const material = generateApiKeyMaterial();
    const createdByIp = getClientIpFromHeaders(req.headers);
    const created = (await payload.create({
      collection: 'api-keys',
      data: {
        name,
        keyId: material.keyId,
        keyPrefix: material.keyPrefix,
        keyLast4: material.keyLast4,
        secretSalt: material.secretSalt,
        secretHash: material.secretHash,
        scopes,
        user: user.id,
        organization: context.activeOrganizationId,
        expiresAt: expiresAt ?? undefined,
        createdByIp: createdByIp ?? undefined,
      },
      overrideAccess: true,
    })) as ApiKeyDoc;

    return NextResponse.json(
      {
        activeOrganizationId: context.activeOrganizationId,
        apiKey: material.key,
        warning:
          'This key is shown once. Copy and store it securely; it cannot be retrieved later.',
        created: toApiKeySummary(created),
      },
      { status: 201, headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create API key.';
    const status = message.includes('Not a member') ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
