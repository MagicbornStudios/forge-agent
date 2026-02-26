import { NextResponse } from 'next/server';

import {
  getActiveRepoProject,
  resolveActiveProjectRoot,
  setActiveRepoProject,
} from '@/lib/project-root';

export async function GET() {
  try {
    const project = await getActiveRepoProject();
    return NextResponse.json({
      ok: true,
      project,
      activeRoot: resolveActiveProjectRoot(),
    });
  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      project: null,
      activeRoot: resolveActiveProjectRoot(),
      message: String(error?.message || error),
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let body: { projectId?: string } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const projectId = String(body.projectId || '').trim();
  if (!projectId) {
    return NextResponse.json({
      ok: false,
      project: null,
      activeRoot: resolveActiveProjectRoot(),
      message: 'projectId is required.',
    }, { status: 400 });
  }

  try {
    const project = await setActiveRepoProject(projectId);
    return NextResponse.json({
      ok: true,
      project,
      activeRoot: resolveActiveProjectRoot(),
      message: `Active project set to ${project.name}.`,
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

