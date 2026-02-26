import { NextResponse } from 'next/server';

import { resolveActiveProjectRoot } from '@/lib/project-root';
import { writeRepoFile } from '@/lib/repo-files';
import { enforceScopeGuard } from '@/lib/scope-guard';

export async function POST(request: Request) {
  let body: {
    path?: string;
    content?: string;
    approved?: boolean;
    createIfMissing?: boolean;
    domain?: string;
    loopId?: string;
    scopeOverrideToken?: string;
  } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const filePath = String(body.path || '').trim();
  const content = String(body.content || '');
  const approved = body.approved === true;
  if (!filePath) {
    return NextResponse.json({ ok: false, message: 'path is required.' }, { status: 400 });
  }
  if (!approved) {
    return NextResponse.json({
      ok: false,
      message: 'Manual write requires explicit approval (approved=true).',
    }, { status: 403 });
  }

  try {
    const scope = await enforceScopeGuard({
      operation: 'file-write',
      paths: [filePath],
      domain: String(body.domain || '').trim().toLowerCase() || undefined,
      loopId: String(body.loopId || '').trim().toLowerCase() || undefined,
      overrideToken: String(body.scopeOverrideToken || '').trim() || undefined,
    });
    if (!scope.ok) {
      return NextResponse.json({
        ok: false,
        message: scope.message || 'Write blocked by scope policy.',
        outOfScope: scope.outOfScope,
        scope: scope.context,
      }, { status: 403 });
    }

    const result = await writeRepoFile({
      path: filePath,
      content,
      createIfMissing: body.createIfMissing === true,
      repoRoot: resolveActiveProjectRoot(),
    });
    return NextResponse.json({
      ok: true,
      ...result,
      message: `Wrote ${result.path}.`,
    });
  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      message: String(error?.message || error),
    }, { status: 400 });
  }
}
