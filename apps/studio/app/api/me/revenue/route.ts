import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';
import {
  parseOrganizationIdFromRequestUrl,
  requireAuthenticatedUser,
  resolveOrganizationFromInput,
} from '@/lib/server/organizations';

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

    const creatorListings = await payload.find({
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
      limit: 5000,
      depth: 0,
    });
    const listingIds = creatorListings.docs.map((l) => l.id);
    if (listingIds.length === 0) {
      return NextResponse.json({
        totalEarningsCents: 0,
        totalPlatformFeesCents: 0,
        byLicense: [],
      });
    }
    const licensesResult = await payload.find({
      collection: 'licenses',
      where: { listing: { in: listingIds } },
      depth: 1,
      limit: 5000,
    });
    let totalEarningsCents = 0;
    let totalPlatformFeesCents = 0;
    const byLicense = licensesResult.docs.map((lic) => {
      const amount = typeof lic.amountCents === 'number' ? lic.amountCents : 0;
      const fee = typeof lic.platformFeeCents === 'number' ? lic.platformFeeCents : 0;
      totalEarningsCents += amount - fee;
      totalPlatformFeesCents += fee;
      const listing =
        typeof lic.listing === 'object' && lic.listing != null && typeof (lic.listing as { title?: string }).title === 'string'
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
