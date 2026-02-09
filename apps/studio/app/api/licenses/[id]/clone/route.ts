import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';
import { cloneProjectToUser } from '@/lib/clone/clone-project-to-user';

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getPayload({ config });
    const { user } = await payload.auth({
      headers: req.headers,
      canSetHeaders: false,
    });
    if (!user || typeof user.id !== 'number') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await context.params;
    const licenseId =
      typeof id === 'string' ? parseInt(id, 10) : undefined;
    if (licenseId == null || Number.isNaN(licenseId)) {
      return NextResponse.json(
        { error: 'Invalid license id' },
        { status: 400 }
      );
    }
    const license = await payload.findByID({
      collection: 'licenses',
      id: licenseId,
      depth: 1,
    });
    if (!license) {
      return NextResponse.json({ error: 'License not found' }, { status: 404 });
    }
    const licenseUserId =
      typeof license.user === 'object' && license.user != null
        ? (license.user as { id: number }).id
        : Number(license.user);
    if (licenseUserId !== user.id) {
      return NextResponse.json({ error: 'License not found' }, { status: 404 });
    }
    const listing =
      typeof license.listing === 'object' && license.listing != null
        ? license.listing
        : await payload.findByID({
            collection: 'listings',
            id: license.listing as number,
            depth: 1,
          });
    const listingProjectId =
      listing?.project != null
        ? typeof listing.project === 'object' && listing.project != null
          ? (listing.project as { id: number }).id
          : Number(listing.project)
        : null;
    const snapshotId =
      typeof license.versionSnapshotId === 'string' && license.versionSnapshotId.trim() !== ''
        ? parseInt(license.versionSnapshotId, 10)
        : null;
    const projectId = !Number.isNaN(snapshotId) ? snapshotId : listingProjectId;
    if (projectId == null || projectId === 0) {
      return NextResponse.json(
        { error: 'Listing has no project' },
        { status: 400 }
      );
    }
    const body = await req.json().catch(() => ({}));
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
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
