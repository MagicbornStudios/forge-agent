import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';
import { cloneProjectToUser } from '@/lib/clone/clone-project-to-user';

export async function POST(req: Request) {
  try {
    const payload = await getPayload({ config });
    const { user } = await payload.auth({
      headers: req.headers,
      canSetHeaders: false,
    });
    if (!user || typeof user.id !== 'number') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json().catch(() => ({}));
    const projectId =
      typeof body?.projectId === 'number'
        ? body.projectId
        : typeof body?.projectId === 'string'
          ? parseInt(body.projectId, 10)
          : undefined;
    if (projectId == null || Number.isNaN(projectId)) {
      return NextResponse.json(
        { error: 'projectId is required' },
        { status: 400 }
      );
    }
    const requestedSlug =
      typeof body?.slug === 'string' && body.slug.trim()
        ? body.slug.trim()
        : undefined;

    const newProjectId = await cloneProjectToUser(
      payload,
      projectId,
      user.id,
      requestedSlug ? { slug: requestedSlug } : undefined
    );

    return NextResponse.json({ projectId: newProjectId });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Clone failed';
    const status =
      message.toLowerCase().includes('storage limit')
        ? 409
        : message.includes('unique') || message.includes('duplicate')
          ? 409
          : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
