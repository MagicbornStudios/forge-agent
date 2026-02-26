import { NextResponse } from 'next/server';

import {
  getActiveRepoProject,
  listRepoProjects,
  resolveActiveProjectRoot,
} from '@/lib/project-root';

export async function GET() {
  try {
    const [projects, activeProject] = await Promise.all([
      listRepoProjects(),
      getActiveRepoProject(),
    ]);
    return NextResponse.json({
      ok: true,
      projects,
      activeProject,
      activeRoot: resolveActiveProjectRoot(),
    });
  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      projects: [],
      activeProject: null,
      activeRoot: resolveActiveProjectRoot(),
      message: String(error?.message || error),
    }, { status: 500 });
  }
}

