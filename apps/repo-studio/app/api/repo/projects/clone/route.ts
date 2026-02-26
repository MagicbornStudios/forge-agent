import { NextResponse } from 'next/server';

import { cloneRepoProject, resolveActiveProjectRoot } from '@/lib/project-root';

export async function POST(request: Request) {
  let body: { remoteUrl?: string; targetPath?: string; name?: string } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const remoteUrl = String(body.remoteUrl || '').trim();
  const targetPath = String(body.targetPath || '').trim();
  if (!remoteUrl || !targetPath) {
    return NextResponse.json({
      ok: false,
      project: null,
      activeRoot: resolveActiveProjectRoot(),
      message: 'remoteUrl and targetPath are required.',
    }, { status: 400 });
  }

  try {
    const project = await cloneRepoProject({
      remoteUrl,
      targetPath,
      name: String(body.name || '').trim() || undefined,
    });
    return NextResponse.json({
      ok: true,
      project,
      activeRoot: resolveActiveProjectRoot(),
      message: `Cloned ${project.name}.`,
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

