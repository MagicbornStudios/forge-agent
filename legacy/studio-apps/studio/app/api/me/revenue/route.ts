import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';
import {
  parseOrganizationIdFromRequestUrl,
  requireAuthenticatedUser,
  resolveOrganizationFromInput,
} from '@/lib/server/organizations';
import { findAllDocs } from '@/lib/server/payload-pagination';

/**
 * GET /api/me/revenue — Creator revenue summary (licenses where listing.creator = current user).
 * Returns totalEarningsCents (sum of amountCents - platformFeeCents), totalPlatformFeesCents, and byLicense list.
 */
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

    const creatorListings = await findAllDocs<Record<string, unknown>>(payload, {
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
      depth: 0,
      overrideAccess: true,
      limit: 500,
    });
    const listingIds = creatorListings
      .map((listing) => Number(listing.id))
      .filter((id) => Number.isFinite(id) && id > 0);
    if (listingIds.length === 0) {
      return NextResponse.json({
        activeOrganizationId: activeOrgId,
        totalEarningsCents: 0,
        totalPlatformFeesCents: 0,
        byLicense: [],
      });
    }

    const licenseDocs = await findAllDocs<Record<string, unknown>>(payload, {
      collection: 'licenses',
      where: {
        or: [
          {
            sellerOrganization: {
              equals: activeOrgId,
            },
          },
          {
            and: [
              { sellerOrganization: { exists: false } },
              { listing: { in: listingIds } },
            ],
          },
        ],
      },
      depth: 1,
      overrideAccess: true,
      limit: 500,
    });

    let totalEarningsCents = 0;
    let totalPlatformFeesCents = 0;
    const byLicense = licenseDocs.map((lic) => {
      const amount = typeof lic.amountCents === 'number' ? lic.amountCents : 0;
      const fee = typeof lic.platformFeeCents === 'number' ? lic.platformFeeCents : 0;
      totalEarningsCents += amount - fee;
      totalPlatformFeesCents += fee;
      const listing =
        typeof lic.listing === 'object' &&
        lic.listing != null &&
        typeof (lic.listing as { title?: string }).title === 'string'
          ? (lic.listing as { title: string }).title
          : 'Listing';
      return {
        licenseId: lic.id,
        listingTitle: listing,
        amountCents: amount,
        platformFeeCents: fee,
        grantedAt: lic.grantedAt,
      };
    });
    return NextResponse.json({
      activeOrganizationId: activeOrgId,
      totalEarningsCents,
      totalPlatformFeesCents,
      byLicense,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load revenue.';
    const status = message.includes('Not a member') ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
