import { NextResponse } from 'next/server';

import { loadRepoWorkspaceExtensions } from '@/lib/workspace-extensions';

export async function GET() {
  try {
    const result = await loadRepoWorkspaceExtensions();
    return NextResponse.json({
      ok: true,
      activeRoot: result.activeRoot,
      extensions: result.extensions,
      warnings: result.warnings,
    }, {
      headers: {
        'cache-control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      activeRoot: '',
      extensions: [],
      warnings: [],
      message: String(error?.message || error || 'Unable to load workspace extensions.'),
    }, {
      status: 500,
      headers: {
        'cache-control': 'no-store, no-cache, must-revalidate',
      },
    });
  }
}
