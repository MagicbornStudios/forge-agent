import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';
import {
  parseOrganizationIdFromRequestUrl,
  requireAuthenticatedUser,
  resolveOrganizationFromInput,
} from '@/lib/server/organizations';
import { findAllDocs } from '@/lib/server/payload-pagination';

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

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

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

    const [projectDocs, listingDocs] = await Promise.all([
      findAllDocs<ProjectDoc>(payload, {
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
        overrideAccess: true,
        limit: 250,
        sort: '-updatedAt',
      }),
      findAllDocs<Record<string, unknown>>(payload, {
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
      }),
    ]);

    const projectById = new Map<number, ProjectDoc>();
    for (const project of projectDocs) {
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
    for (const listing of listingDocs) {
      const listingDoc = (listing && typeof listing === 'object'
        ? listing
        : {}) as Record<string, unknown>;
      if (!listingDoc.project) continue;

      let projectId: number | null = null;
      let projectSnapshot: ProjectDoc | null = null;

      if (typeof listingDoc.project === 'object' && listingDoc.project != null && 'id' in listingDoc.project) {
        const project = listingDoc.project as {
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
        const numericProjectId = Number(listingDoc.project);
        if (!Number.isNaN(numericProjectId) && numericProjectId > 0) {
          projectId = numericProjectId;
        }
      }

      if (projectId == null) continue;
      if (projectSnapshot != null && !projectById.has(projectId)) {
        projectById.set(projectId, projectSnapshot);
      }

      listingByProjectId.set(projectId, {
        id: asNumber(listingDoc.id),
        slug: asString(listingDoc.slug, 'listing'),
        title: asString(listingDoc.title, 'Untitled listing'),
        status: asString(listingDoc.status, 'draft'),
        price: asNumber(listingDoc.price),
        currency: asString(listingDoc.currency, 'USD'),
        cloneMode: asString(listingDoc.cloneMode, 'indefinite'),
        playUrl: typeof listingDoc.playUrl === 'string' ? listingDoc.playUrl : undefined,
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
