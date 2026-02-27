import { NextResponse } from 'next/server';

import { installExtensionFromRegistry } from '@/lib/extension-registry';
import { resolveActiveProjectRoot } from '@/lib/project-root';

export async function POST(request: Request) {
  let body: { extensionId?: string; replace?: boolean } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const extensionId = String(body.extensionId || '').trim();
  if (!extensionId) {
    return NextResponse.json({
      ok: false,
      activeRoot: resolveActiveProjectRoot(),
      extension: null,
      message: 'extensionId is required.',
    }, { status: 400 });
  }

  try {
    const payload = await installExtensionFromRegistry({
      extensionId,
      replace: body.replace === true,
    });
    return NextResponse.json(payload);
  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      activeRoot: resolveActiveProjectRoot(),
      extension: null,
      message: String(error?.message || error || 'Unable to install extension.'),
    }, { status: 400 });
  }
}
