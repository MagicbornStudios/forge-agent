import { NextResponse } from 'next/server';

import { resolveScopeGuardContext } from '@/lib/scope-guard';
import { startScopeOverride } from '@/lib/scope-overrides';

export async function POST(request: Request) {
  let body: {
    domain?: string;
    reason?: string;
    ttlMinutes?: number;
    roots?: string[];
    loopId?: string;
  } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const domain = String(body.domain || 'story').trim().toLowerCase() || 'story';
  const context = await resolveScopeGuardContext({
    domain,
    loopId: String(body.loopId || '').trim().toLowerCase() || undefined,
  });

  const result = await startScopeOverride({
    domain,
    roots: Array.isArray(body.roots) && body.roots.length > 0 ? body.roots : context.allowedRoots,
    reason: body.reason,
    ttlMinutes: body.ttlMinutes,
  });

  return NextResponse.json({
    ...result,
    scope: context,
  }, { status: result.ok ? 200 : 400 });
}

