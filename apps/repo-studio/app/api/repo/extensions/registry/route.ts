import { NextResponse } from 'next/server';

import { listExtensionRegistry } from '@/lib/extension-registry';

export async function GET() {
  try {
    const payload = await listExtensionRegistry();
    return NextResponse.json(payload, {
      headers: {
        'cache-control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      activeRoot: '',
      registryRoot: '',
      submoduleReady: false,
      entries: [],
      examples: [],
      warnings: [],
      message: String(error?.message || error || 'Unable to load extension registry.'),
    }, {
      status: 500,
      headers: {
        'cache-control': 'no-store, no-cache, must-revalidate',
      },
    });
  }
}
