import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';

/**
 * @swagger
 * /api/settings:
 *   get:
 *     summary: Get all settings overrides for hydration
 *     tags: [settings]
 *     responses:
 *       200:
 *         description: List of settings-overrides documents
 *       500:
 *         description: Server error
 *   post:
 *     summary: Upsert settings for a scope
 *     tags: [settings]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               scope: { type: string, enum: [app, editor, viewport] }
 *               scopeId: { type: string, nullable: true }
 *               settings: { type: object }
 *     responses:
 *       200:
 *         description: Created or updated settings document
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
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

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config });
    const body = await request.json();
    const { scope, scopeId, settings } = body;
    const resolvedScope =
      scope === 'workspace'
        ? 'editor'
        : scope === 'editor' && typeof scopeId === 'string' && scopeId.includes(':')
          ? 'viewport'
          : scope;

    if (!resolvedScope) {
      return NextResponse.json({ error: 'scope is required' }, { status: 400 });
    }
    if (!['app', 'editor', 'viewport'].includes(resolvedScope)) {
      return NextResponse.json({ error: 'scope must be app, editor, or viewport' }, { status: 400 });
    }
    if (
      resolvedScope !== 'app' &&
      (scopeId === undefined || scopeId === null || scopeId === '')
    ) {
      return NextResponse.json(
        { error: 'scope "editor" or "viewport" requires scopeId' },
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
          { scope: { equals: resolvedScope } },
          resolvedScope === 'app'
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
          scope: resolvedScope,
          scopeId: resolvedScope === 'app' ? null : scopeId ?? null,
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
