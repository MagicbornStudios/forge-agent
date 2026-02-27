import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';
import {
  parseOrganizationIdFromRequestUrl,
  requireAuthenticatedUser,
  resolveOrganizationFromInput,
} from '@/lib/server/organizations';
import { findAllDocs } from '@/lib/server/payload-pagination';

export async function GET(req: Request) {
  try {
    const payload = await getPayload({ config });
    const user = await requireAuthenticatedUser(payload, req.headers);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const requestedOrgId = parseOrganizationIdFromRequestUrl(req);
    const context = await resolveOrganizationFromInput(
      payload,
      user,
      requestedOrgId ?? undefined,
      { strictRequestedMembership: true },
    );
    const activeOrgId = context.activeOrganizationId;

    const docs = await findAllDocs<Record<string, unknown>>(payload, {
      collection: 'listings',
      where: {
        or: [
          { organization: { equals: activeOrgId } },
          {
            and: [
              { creator: { equals: user.id } },
              { organization: { exists: false } },
            ],
          },
        ],
      },
      depth: 1,
      overrideAccess: true,
      limit: 250,
      sort: '-updatedAt',
    });

    const listings = docs.map((doc) => {
      const project =
        typeof doc.project === 'object' && doc.project != null ? doc.project : null;
      const thumbnail =
        typeof doc.thumbnail === 'object' && doc.thumbnail != null ? doc.thumbnail : null;

      return {
        id: doc.id,
        title: doc.title,
        slug: doc.slug,
        listingType: doc.listingType,
        status: doc.status,
        cloneMode: doc.cloneMode ?? 'indefinite',
        price: doc.price,
        currency: doc.currency ?? 'USD',
        category: doc.category ?? undefined,
        playUrl: doc.playUrl ?? undefined,
        updatedAt: doc.updatedAt,
        organizationId:
          doc.organization != null &&
          typeof doc.organization === 'object' &&
          'id' in doc.organization
            ? Number((doc.organization as { id: number }).id)
            : doc.organization != null
              ? Number(doc.organization)
              : null,
        thumbnailUrl:
          thumbnail != null && 'url' in thumbnail
            ? ((thumbnail as { url?: string }).url ?? undefined)
            : undefined,
        projectId:
          project != null && 'id' in project
            ? (project as { id: number }).id
            : doc.project != null
              ? Number(doc.project)
              : null,
        projectTitle:
          project != null && 'title' in project
            ? ((project as { title?: string }).title ?? null)
            : null,
      };
    });

    return NextResponse.json({
      activeOrganizationId: activeOrgId,
      listings,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load creator listings.';
    const status = message.includes('Not a member') ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
