import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';
import {
  parseOrganizationIdFromRequestUrl,
  requireAuthenticatedUser,
  resolveOrganizationFromInput,
} from '@/lib/server/organizations';

type ProjectDoc = {
  id: number;
  title: string;
  slug: string;
  description?: string | null;
  status?: string | null;
  domain?: string | null;
  updatedAt?: string;
};

type ListingSummary = {
  id: number;
  slug: string;
  title: string;
  status: string;
  price: number;
  currency: string;
  cloneMode: string;
  playUrl?: string;
};

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

    const [projectsResult, listingsResult] = await Promise.all([
      payload.find({
        collection: 'projects',
        where: {
          or: [
            { organization: { equals: activeOrgId } },
            {
              and: [
                { owner: { equals: user.id } },
                { organization: { exists: false } },
              ],
            },
          ],
        },
        depth: 0,
        limit: 1000,
        sort: '-updatedAt',
      }),
      payload.find({
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
        limit: 1000,
        sort: '-updatedAt',
      }),
    ]);

    const projectById = new Map<number, ProjectDoc>();
    for (const project of projectsResult.docs) {
      projectById.set(project.id, {
        id: project.id,
        title: project.title,
        slug: project.slug,
        description: project.description ?? null,
        status: project.status ?? null,
        domain: project.domain ?? null,
        updatedAt: project.updatedAt,
      });
    }

    const listingByProjectId = new Map<number, ListingSummary>();
    for (const listing of listingsResult.docs) {
      if (!listing.project) continue;

      let projectId: number | null = null;
      let projectSnapshot: ProjectDoc | null = null;

      if (typeof listing.project === 'object' && listing.project != null && 'id' in listing.project) {
        const project = listing.project as {
          id: number;
          title: string;
          slug: string;
          description?: string | null;
          status?: string | null;
          domain?: string | null;
          updatedAt?: string;
        };
        projectId = project.id;
        projectSnapshot = {
          id: project.id,
          title: project.title,
          slug: project.slug,
          description: project.description ?? null,
          status: project.status ?? null,
          domain: project.domain ?? null,
          updatedAt: project.updatedAt,
        };
      } else {
        const numericProjectId = Number(listing.project);
        if (!Number.isNaN(numericProjectId) && numericProjectId > 0) {
          projectId = numericProjectId;
        }
      }

      if (projectId == null) continue;
      if (projectSnapshot != null && !projectById.has(projectId)) {
        projectById.set(projectId, projectSnapshot);
      }

      listingByProjectId.set(projectId, {
        id: listing.id,
        slug: listing.slug,
        title: listing.title,
        status: listing.status,
        price: listing.price,
        currency: listing.currency ?? 'USD',
        cloneMode: listing.cloneMode ?? 'indefinite',
        playUrl: listing.playUrl ?? undefined,
      });
    }

    const projects = [...projectById.values()]
      .map((project) => ({
        ...project,
        listing: listingByProjectId.get(project.id) ?? null,
      }))
      .sort((a, b) => {
        const dateA = a.updatedAt ? Date.parse(a.updatedAt) : 0;
        const dateB = b.updatedAt ? Date.parse(b.updatedAt) : 0;
        return dateB - dateA;
      });

    return NextResponse.json({
      activeOrganizationId: activeOrgId,
      projects,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load creator projects.';
    const status = message.includes('Not a member') ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
