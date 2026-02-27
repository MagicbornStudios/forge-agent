import { NextResponse } from 'next/server';

import { removeInstalledExtension } from '@/lib/extension-registry';
import { resolveActiveProjectRoot } from '@/lib/project-root';

export async function POST(request: Request) {
  let body: { extensionId?: string } = {};
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
      removed: false,
      message: 'extensionId is required.',
    }, { status: 400 });
  }

  try {
    const payload = await removeInstalledExtension({
      extensionId,
    });
    return NextResponse.json(payload);
  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      activeRoot: resolveActiveProjectRoot(),
      removed: false,
      message: String(error?.message || error || 'Unable to remove extension.'),
    }, { status: 400 });
  }
}
