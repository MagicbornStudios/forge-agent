import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';
import { findAllDocs } from '@/lib/server/payload-pagination';
import {
  parseOrganizationIdFromRequestUrl,
  requireAuthenticatedUser,
  resolveOrganizationFromInput,
} from '@/lib/server/organizations';

export async function GET(req: Request) {
  try {
    const payload = await getPayload({ config });
    const user = await requireAuthenticatedUser(payload, req.headers);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const requestedOrgId = parseOrganizationIdFromRequestUrl(req);

    let docs: Array<Record<string, unknown>> = [];
    let activeOrganizationId: number | null = null;

    if (requestedOrgId != null) {
      const orgContext = await resolveOrganizationFromInput(
        payload,
        user,
        requestedOrgId,
        { strictRequestedMembership: true },
      );
      activeOrganizationId = orgContext.activeOrganizationId;

      const orgListings = await findAllDocs<Record<string, unknown>>(payload, {
        collection: 'listings',
        where: {
          organization: {
            equals: activeOrganizationId,
          },
        },
        depth: 0,
        overrideAccess: true,
        limit: 500,
      });
      const orgListingIds = orgListings
        .map((listing) => Number(listing.id))
        .filter((id) => Number.isFinite(id) && id > 0);

      docs = await findAllDocs<Record<string, unknown>>(payload, {
        collection: 'licenses',
        where: {
          or: [
            {
              sellerOrganization: {
                equals: activeOrganizationId,
              },
            },
            ...(orgListingIds.length > 0
              ? [
                  {
                    and: [
                      { sellerOrganization: { exists: false } },
                      { listing: { in: orgListingIds } },
                    ],
                  },
                ]
              : []),
          ],
        },
        depth: 1,
        overrideAccess: true,
        limit: 500,
        sort: '-grantedAt',
      });
    } else {
      docs = await findAllDocs<Record<string, unknown>>(payload, {
        collection: 'licenses',
        where: { user: { equals: user.id } },
        depth: 1,
        overrideAccess: true,
        limit: 500,
        sort: '-grantedAt',
      });
    }

    const licenses = docs.map((license) => {
      const listing =
        typeof license.listing === 'object' && license.listing != null
          ? license.listing
          : null;
      const listingTitle =
        listing != null && typeof listing === 'object' && 'title' in listing
          ? (listing.title as string) ?? null
          : null;
      const clonedProjectId =
        license.clonedProjectId != null
          ? typeof license.clonedProjectId === 'object'
            ? (license.clonedProjectId as { id: number }).id
            : Number(license.clonedProjectId)
          : null;
      return {
        id: license.id,
        listingTitle,
        grantedAt:
          typeof license.grantedAt === 'string' ? license.grantedAt : null,
        clonedProjectId,
      };
    });

    return NextResponse.json({ activeOrganizationId, licenses });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to list licenses';
    const status = message.includes('Not a member') ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
