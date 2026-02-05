import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';

/**
 * GET /api/settings
 * Returns all settings-overrides records for client hydration.
 */
export async function GET() {
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: 'settings-overrides',
      limit: 500,
    });
    return NextResponse.json(result.docs);
  } catch (error) {
    console.error('Failed to fetch settings overrides:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/settings
 * Body: { scope: 'app' | 'workspace' | 'editor', scopeId?: string | null, settings: Record<string, unknown> }
 * Upserts one settings-overrides record for the given scope + scopeId.
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config });
    const body = await request.json();
    const { scope, scopeId, settings } = body;

    if (!scope) {
      return NextResponse.json({ error: 'scope is required' }, { status: 400 });
    }
    if (scope !== 'app' && (scopeId === undefined || scopeId === null || scopeId === '')) {
      return NextResponse.json(
        { error: 'scope "workspace" or "editor" requires scopeId' },
        { status: 400 }
      );
    }
    if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
      return NextResponse.json(
        { error: 'settings must be a JSON object' },
        { status: 400 }
      );
    }

    const existing = await payload.find({
      collection: 'settings-overrides',
      where: {
        and: [
          { scope: { equals: scope } },
          scope === 'app'
            ? { scopeId: { equals: null } }
            : { scopeId: { equals: scopeId ?? null } },
        ],
      },
      limit: 1,
    });

    if (existing.docs.length > 0) {
      const doc = await payload.update({
        collection: 'settings-overrides',
        id: existing.docs[0].id,
        data: { settings },
      });
      return NextResponse.json(doc);
    }

    const doc = await payload.create({
      collection: 'settings-overrides',
      data: {
        scope,
        scopeId: scope === 'app' ? null : scopeId ?? null,
        settings,
      },
    });
    return NextResponse.json(doc);
  } catch (error) {
    console.error('Failed to save settings overrides:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}
