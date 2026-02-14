import { NextResponse } from 'next/server';

import { readRepoFile } from '@/lib/repo-files';
import { enforceScopeGuard } from '@/lib/scope-guard';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const filePath = String(url.searchParams.get('path') || '').trim();
  const domain = String(url.searchParams.get('domain') || '').trim().toLowerCase() || undefined;
  const loopId = String(url.searchParams.get('loopId') || '').trim().toLowerCase() || undefined;
  const scopeOverrideToken = String(url.searchParams.get('scopeOverrideToken') || '').trim() || undefined;
  if (!filePath) {
    return NextResponse.json({ ok: false, message: 'path is required.' }, { status: 400 });
  }

  try {
    const scope = await enforceScopeGuard({
      operation: 'file-read',
      paths: [filePath],
      domain,
      loopId,
      overrideToken: scopeOverrideToken,
    });
    if (!scope.ok) {
      return NextResponse.json({
        ok: false,
        message: scope.message || 'Read blocked by scope policy.',
        outOfScope: scope.outOfScope,
        scope: scope.context,
      }, { status: 403 });
    }
    const result = await readRepoFile(filePath);
    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      message: String(error?.message || error),
    }, { status: 400 });
  }
}
