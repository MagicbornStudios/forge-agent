import { NextResponse } from 'next/server';

import { importLocalRepoProject, resolveActiveProjectRoot } from '@/lib/project-root';

export async function POST(request: Request) {
  let body: { rootPath?: string; name?: string } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const rootPath = String(body.rootPath || '').trim();
  if (!rootPath) {
    return NextResponse.json({
      ok: false,
      project: null,
      activeRoot: resolveActiveProjectRoot(),
      message: 'rootPath is required.',
    }, { status: 400 });
  }

  try {
    const project = await importLocalRepoProject({
      rootPath,
      name: String(body.name || '').trim() || undefined,
    });
    return NextResponse.json({
      ok: true,
      project,
      activeRoot: resolveActiveProjectRoot(),
      message: `Imported ${project.name}.`,
    });
  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      project: null,
      activeRoot: resolveActiveProjectRoot(),
      message: String(error?.message || error),
    }, { status: 400 });
  }
}

