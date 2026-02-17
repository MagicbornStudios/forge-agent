import { NextResponse } from 'next/server';

import { searchRepository } from '@/lib/repo-search';
import { parseRepoSearchInput } from '@/lib/search-input';

export async function GET(request: Request) {
  const url = new URL(request.url);
  try {
    const input = parseRepoSearchInput(url);
    const payload = await searchRepository(input);
    return NextResponse.json({
      ok: true,
      ...payload,
    });
  } catch (error: any) {
    const message = String(error?.message || error);
    const status = /required|invalid|must|exceeds|supports at most|q is required/i.test(message)
      ? 400
      : 500;
    return NextResponse.json({
      ok: false,
      message,
      query: String(url.searchParams.get('q') || ''),
      regex: String(url.searchParams.get('regex') || '') === '1',
      scope: String(url.searchParams.get('scope') || 'workspace'),
      loopId: String(url.searchParams.get('loopId') || '') || null,
      roots: [],
      include: [],
      exclude: [],
      matches: [],
    }, { status });
  }
}
