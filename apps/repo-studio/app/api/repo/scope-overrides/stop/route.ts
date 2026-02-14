import { NextResponse } from 'next/server';

import { stopScopeOverride } from '@/lib/scope-overrides';

export async function POST(request: Request) {
  let body: {
    token?: string;
    domain?: string;
  } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const result = await stopScopeOverride({
    token: String(body.token || '').trim() || undefined,
    domain: String(body.domain || '').trim().toLowerCase() || undefined,
  });
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}

