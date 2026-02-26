import { NextResponse } from 'next/server';

import { resolveActiveProjectRoot } from '@/lib/project-root';
import { listRepoFiles } from '@/lib/repo-files';
import { resolveScopeGuardContext } from '@/lib/scope-guard';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const scope = String(url.searchParams.get('scope') || 'workspace').trim().toLowerCase();
  const loopId = String(url.searchParams.get('loopId') || '').trim().toLowerCase() || undefined;
  const domain = String(url.searchParams.get('domain') || '').trim().toLowerCase() || undefined;
  const scopeOverrideToken = String(url.searchParams.get('scopeOverrideToken') || '').trim() || undefined;
  const maxItemsRaw = Number(url.searchParams.get('maxItems') || '1500');

  if (scope !== 'workspace' && scope !== 'loop') {
    return NextResponse.json({ ok: false, message: 'scope must be "workspace" or "loop".' }, { status: 400 });
  }

  try {
    const guard = await resolveScopeGuardContext({
      domain,
      loopId,
      overrideToken: scopeOverrideToken,
    });
    const tree = await listRepoFiles({
      scope,
      loopId,
      allowedRoots: guard.allowedRoots,
      maxItems: Number.isFinite(maxItemsRaw) ? maxItemsRaw : undefined,
      repoRoot: resolveActiveProjectRoot(),
    });
    return NextResponse.json({
      ok: true,
      domain: guard.domain || null,
      roots: guard.allowedRoots,
      ...tree,
    });
  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      message: String(error?.message || error),
    }, { status: 500 });
  }
}
