import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';
import {
  parseOrganizationIdFromRequestUrl,
  requireAuthenticatedUser,
} from '@/lib/server/organizations';
import { resolveBillingOrganizationContext } from '@/lib/server/billing/context';
import { findAllDocs } from '@/lib/server/payload-pagination';

type EnterpriseRequestType = 'source_access' | 'premium_support' | 'custom_editor';

function parseBodyOrganizationId(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return null;
}

function parseRequestType(value: unknown): EnterpriseRequestType | null {
  if (value === 'source_access' || value === 'premium_support' || value === 'custom_editor') {
    return value;
  }
  return null;
}

export async function GET(req: Request) {
  try {
    const payload = await getPayload({ config });
    const user = await requireAuthenticatedUser(payload, req.headers);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requestedOrgId = parseOrganizationIdFromRequestUrl(req);
    const billingContext = await resolveBillingOrganizationContext(
      payload,
      user,
      requestedOrgId,
    );

    const docs = await findAllDocs<Record<string, unknown>>(payload, {
      collection: 'enterprise-requests',
      where: {
        organization: {
          equals: billingContext.activeOrganizationId,
        },
      },
      sort: '-createdAt',
      depth: 1,
      overrideAccess: true,
      limit: 200,
    });

    const requests = docs.map((doc) => ({
      id: typeof doc.id === 'number' ? doc.id : Number(doc.id),
      type: typeof doc.type === 'string' ? doc.type : 'custom_editor',
      status: typeof doc.status === 'string' ? doc.status : 'open',
      notes: typeof doc.notes === 'string' ? doc.notes : null,
      createdAt: typeof doc.createdAt === 'string' ? doc.createdAt : null,
      updatedAt: typeof doc.updatedAt === 'string' ? doc.updatedAt : null,
      resolvedAt: typeof doc.resolvedAt === 'string' ? doc.resolvedAt : null,
    }));

    return NextResponse.json({
      activeOrganizationId: billingContext.activeOrganizationId,
      requests,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to load enterprise requests.';
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
      type?: unknown;
      notes?: unknown;
      orgId?: unknown;
      organizationId?: unknown;
    };
    const type = parseRequestType(body.type);
    if (!type) {
      return NextResponse.json(
        {
          error:
            'Request type is required (source_access | premium_support | custom_editor).',
        },
        { status: 400 },
      );
    }
    const notes = typeof body.notes === 'string' ? body.notes.trim() : '';
    if (notes.length > 1000) {
      return NextResponse.json(
        { error: 'Notes must be 1000 characters or less.' },
        { status: 400 },
      );
    }

    const requestedFromBody =
      parseBodyOrganizationId(body.organizationId) ?? parseBodyOrganizationId(body.orgId);
    const requestedFromUrl = parseOrganizationIdFromRequestUrl(req);
    const requestedOrgId = requestedFromBody ?? requestedFromUrl;

    const billingContext = await resolveBillingOrganizationContext(
      payload,
      user,
      requestedOrgId,
    );

    const created = await payload.create({
      collection: 'enterprise-requests',
      data: {
        organization: billingContext.activeOrganizationId,
        requestedByUser: user.id,
        type,
        status: 'open',
        notes: notes.length > 0 ? notes : undefined,
      },
      overrideAccess: true,
    });

    return NextResponse.json(
      {
        activeOrganizationId: billingContext.activeOrganizationId,
        request: {
          id: created.id,
          type: created.type,
          status: created.status,
          notes: created.notes ?? null,
          createdAt: created.createdAt ?? null,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to submit enterprise request.';
    const status = message.includes('Not a member') ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
