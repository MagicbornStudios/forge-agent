import { NextResponse } from 'next/server';
import { resetRepoSettingsScopes } from '@/lib/settings/repository';
import type { RepoSettingsScope } from '@/lib/settings/types';

export const runtime = 'nodejs';

function parseScope(value: unknown): RepoSettingsScope | undefined {
  const scope = String(value || '').trim().toLowerCase();
  if (scope === 'app' || scope === 'workspace' || scope === 'local') {
    return scope;
  }
  return undefined;
}

export async function POST(request: Request) {
  let body: {
    scope?: string;
    scopeId?: string | null;
    workspaceId?: string;
    loopId?: string;
  } = {};

  try {
    body = await request.json();
  } catch {
    body = {};
  }

  try {
    const snapshot = await resetRepoSettingsScopes({
      scope: parseScope(body.scope),
      scopeId: body.scopeId || null,
      workspaceId: body.workspaceId,
      loopId: body.loopId,
    });
    return NextResponse.json(snapshot);
  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      message: String(error?.message || error || 'Unable to reset settings.'),
    }, { status: 500 });
  }
}
