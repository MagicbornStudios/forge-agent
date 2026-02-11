import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';
import { requireAuthenticatedUser } from '@/lib/server/organizations';

type ApiKeyDoc = {
  id: number;
  user: number | { id?: number } | null;
  revokedAt?: string | null;
};

function asNumericId(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  if (typeof value === 'object' && value != null && 'id' in value) {
    return asNumericId((value as { id?: unknown }).id);
  }
  return null;
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const payload = await getPayload({ config });
    const user = await requireAuthenticatedUser(payload, req.headers);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const apiKeyId = Number(id);
    if (!Number.isFinite(apiKeyId) || apiKeyId <= 0) {
      return NextResponse.json({ error: 'Invalid API key id.' }, { status: 400 });
    }

    const doc = (await payload.findByID({
      collection: 'api-keys',
      id: apiKeyId,
      depth: 0,
      overrideAccess: true,
    })) as ApiKeyDoc | null;

    if (!doc) {
      return NextResponse.json({ error: 'API key not found.' }, { status: 404 });
    }

    if (asNumericId(doc.user) !== user.id) {
      return NextResponse.json({ error: 'API key not found.' }, { status: 404 });
    }

    if (doc.revokedAt) {
      return NextResponse.json({ ok: true, alreadyRevoked: true });
    }

    const body = (await req.json().catch(() => ({}))) as { reason?: unknown };
    const reason =
      typeof body.reason === 'string' && body.reason.trim().length > 0
        ? body.reason.trim().slice(0, 200)
        : undefined;

    await payload.update({
      collection: 'api-keys',
      id: apiKeyId,
      data: {
        revokedAt: new Date().toISOString(),
        revokedReason: reason,
      },
      overrideAccess: true,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to revoke API key.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

