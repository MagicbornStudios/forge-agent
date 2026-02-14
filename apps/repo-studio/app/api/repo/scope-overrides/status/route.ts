import { NextResponse } from 'next/server';

import { getScopeOverrideStatus } from '@/lib/scope-overrides';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = String(url.searchParams.get('token') || '').trim() || undefined;
  const domain = String(url.searchParams.get('domain') || '').trim().toLowerCase() || undefined;
  const status = await getScopeOverrideStatus({ token, domain });
  return NextResponse.json(status);
}

