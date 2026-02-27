import { NextResponse } from 'next/server';

import { browseProjectDirectories } from '@/lib/project-root';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedPath = String(searchParams.get('path') || '').trim();

  try {
    const result = await browseProjectDirectories({ path: requestedPath });
    return NextResponse.json({
      ok: true,
      cwd: result.cwd,
      parent: result.parent,
      roots: result.roots,
      entries: result.entries,
    });
  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      cwd: '',
      parent: null,
      roots: [],
      entries: [],
      message: String(error?.message || error),
    }, { status: 400 });
  }
}
