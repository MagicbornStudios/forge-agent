import { NextResponse } from 'next/server';
import { upsertRepoSettings } from '@/lib/settings/repository';
import type { RepoSettingsScope } from '@/lib/settings/types';

export const runtime = 'nodejs';

function isScope(value: string): value is RepoSettingsScope {
  return value === 'app' || value === 'workspace' || value === 'local';
}

export async function POST(request: Request) {
  let body: {
    scope?: string;
    scopeId?: string | null;
    settings?: Record<string, unknown>;
    workspaceId?: string;
    loopId?: string;
  } = {};

  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const scope = String(body.scope || '').trim().toLowerCase();
  if (!isScope(scope)) {
    return NextResponse.json({
      ok: false,
      message: 'scope must be app, workspace, or local.',
    }, { status: 400 });
  }

  if (!body.settings || typeof body.settings !== 'object' || Array.isArray(body.settings)) {
    return NextResponse.json({
      ok: false,
      message: 'settings must be an object.',
    }, { status: 400 });
  }

  try {
    const snapshot = await upsertRepoSettings({
      scope,
      scopeId: body.scopeId || null,
      settings: body.settings,
      workspaceId: body.workspaceId,
      loopId: body.loopId,
    });
    return NextResponse.json(snapshot);
  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      message: String(error?.message || error || 'Unable to upsert settings.'),
    }, { status: 500 });
  }
}
