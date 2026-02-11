import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';
import { cloneProjectToUser } from '@/lib/clone/clone-project-to-user';

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> },
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
    const listingId = Number(id);
    if (Number.isNaN(listingId) || listingId <= 0) {
      return NextResponse.json({ error: 'Invalid listing id' }, { status: 400 });
    }

    const listing = await payload.findByID({
      collection: 'listings',
      id: listingId,
      depth: 1,
    });

    if (!listing || listing.status !== 'published') {
      return NextResponse.json({ error: 'Listing not available' }, { status: 404 });
    }

    if (typeof listing.price === 'number' && listing.price > 0) {
      return NextResponse.json(
        { error: 'Paid listings require checkout' },
        { status: 400 },
      );
    }

    const sourceProjectId =
      listing.project != null
        ? typeof listing.project === 'object' && listing.project != null
          ? (listing.project as { id: number }).id
          : Number(listing.project)
        : null;

    if (sourceProjectId == null || Number.isNaN(sourceProjectId) || sourceProjectId <= 0) {
      return NextResponse.json(
        { error: 'Listing has no source project' },
        { status: 400 },
      );
    }

    const clonedProjectId = await cloneProjectToUser(payload, sourceProjectId, user.id);

    const existingLicense = await payload.find({
      collection: 'licenses',
      where: {
        and: [
          { user: { equals: user.id } },
          { listing: { equals: listingId } },
        ],
      },
      depth: 0,
      limit: 1,
    });

    let licenseId: number | null =
      existingLicense.docs.length > 0 ? existingLicense.docs[0].id : null;
    const sellerOrganizationId =
      listing.organization != null
        ? typeof listing.organization === 'object' && listing.organization != null
          ? Number((listing.organization as { id: number }).id)
          : Number(listing.organization)
        : null;

    if (licenseId == null) {
      const created = await payload.create({
        collection: 'licenses',
        data: {
          user: user.id,
          listing: listingId,
          stripeSessionId: `free-${listingId}-${user.id}-${Date.now()}`,
          grantedAt: new Date().toISOString(),
          clonedProjectId,
          amountCents: 0,
          platformFeeCents: 0,
          sellerOrganization:
            sellerOrganizationId != null && Number.isFinite(sellerOrganizationId)
              ? sellerOrganizationId
              : undefined,
          ...(listing.cloneMode === 'version-only'
            ? { versionSnapshotId: String(sourceProjectId) }
            : {}),
        },
        overrideAccess: true,
      });
      licenseId = created.id as number;
    }

    return NextResponse.json({
      projectId: clonedProjectId,
      licenseId,
      listingId,
      listingTitle: listing.title,
      mode: 'free',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to clone listing.';
    const status =
      message.includes('unique') || message.includes('duplicate') ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
