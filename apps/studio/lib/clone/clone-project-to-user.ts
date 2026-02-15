import type { Payload } from 'payload';
import { findAllDocs } from '@/lib/server/payload-pagination';
import {
  assertOrganizationStorageGrowthAllowed,
  estimateCloneStorageDeltaBytes,
  recomputeProjectStorageUsage,
} from '@/lib/server/storage-metering';
import {
  ensureOrganizationContext,
  type AuthenticatedUser,
} from '@/lib/server/organizations';

export type CloneProjectToUserOptions = {
  slug?: string;
  organizationId?: number;
};

type ForgeGraphDoc = {
  id: number;
  kind: string;
  title: string;
  flow: unknown;
};

type CharacterDoc = {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  voiceId?: string;
  avatar?: unknown;
  meta?: unknown;
  archivedAt?: string;
};

type RelationshipDoc = {
  id: number;
  sourceCharacter: number;
  targetCharacter: number;
  label: string;
  description?: string;
};

type PageDoc = {
  id: number;
  parent?: number | null;
  properties?: Record<string, unknown>;
  cover?: unknown;
  icon?: unknown;
  archived?: boolean;
  in_trash?: boolean;
  url?: string;
  public_url?: string;
};

type BlockDoc = {
  id: number;
  page: number;
  parent_block: number | null;
  type: string;
  position: number;
  payload: unknown;
  archived?: boolean;
  in_trash?: boolean;
  has_children?: boolean;
};

/**
 * Clones a project and all related data (forge-graphs, characters, relationships, pages, blocks)
 * to a target user. Media is kept as references. Returns the new project id.
 */
export async function cloneProjectToUser(
  payload: Payload,
  projectId: number,
  targetUserId: number,
  options?: CloneProjectToUserOptions
 ): Promise<number> {
  const payloadUnsafe = payload as any;
  const sourceProject = await payload.findByID({
    collection: 'projects',
    id: projectId,
    depth: 0,
  });
  if (!sourceProject) {
    throw new Error('Project not found');
  }

  const slug =
    options?.slug?.trim() ?? `${sourceProject.slug}-copy-${Date.now()}`;

  const targetUser = (await payload.findByID({
    collection: 'users',
    id: targetUserId,
    depth: 0,
    overrideAccess: true,
  })) as AuthenticatedUser | null;
  if (!targetUser) {
    throw new Error('Target user not found');
  }

  const organizationContext = await ensureOrganizationContext(payload, targetUser);
  const organizationId = options?.organizationId ?? organizationContext.activeOrganizationId;
  if (!organizationId || !Number.isFinite(organizationId)) {
    throw new Error('Target user has no active organization');
  }

  const estimatedCloneBytes = await estimateCloneStorageDeltaBytes(payload, projectId);
  if (estimatedCloneBytes > 0) {
    const storageCheck = await assertOrganizationStorageGrowthAllowed(
      payload,
      organizationId,
      estimatedCloneBytes,
    );
    if (!storageCheck.allowed) {
      throw new Error('Organization storage limit exceeded for clone operation');
    }
  }

  const [sourceGraphs, sourceCharacters, sourceRelationships, sourcePages] =
    await Promise.all([
      findAllDocs<ForgeGraphDoc>(payload, {
        collection: 'forge-graphs',
        where: { project: { equals: projectId } },
        depth: 0,
        overrideAccess: true,
        limit: 500,
      }),
      findAllDocs<CharacterDoc>(payload, {
        collection: 'characters',
        where: { project: { equals: projectId } },
        depth: 0,
        overrideAccess: true,
        limit: 1000,
      }),
      findAllDocs<RelationshipDoc>(payload, {
        collection: 'relationships',
        where: { project: { equals: projectId } },
        depth: 0,
        overrideAccess: true,
        limit: 1000,
      }),
      findAllDocs<PageDoc>(payload, {
        collection: 'pages',
        where: { project: { equals: projectId } },
        depth: 0,
        overrideAccess: true,
        limit: 1000,
      }),
    ]);

  const graphList = sourceGraphs;
  const charList = sourceCharacters;
  const relList = sourceRelationships;
  const pageList = sourcePages;
  const pageIds = pageList.map((p) => p.id);

  const sourceBlocks =
    pageIds.length > 0
      ? await findAllDocs<BlockDoc>(payload, {
          collection: 'blocks',
          where: { page: { in: pageIds } },
          depth: 0,
          overrideAccess: true,
          limit: 2000,
        })
      : [];

  const blockList = sourceBlocks;

  const newProject = await payloadUnsafe.create({
    collection: 'projects',
    data: {
      title: `${sourceProject.title} (Copy)`,
      slug,
      description: sourceProject.description ?? undefined,
      domain: sourceProject.domain ?? 'forge',
      status: sourceProject.status ?? 'active',
      owner: targetUserId,
      organization: organizationId,
      forgeGraph: undefined,
    },
    overrideAccess: true,
  });
  const newProjectId = newProject.id as number;

  const graphIdMap = new Map<number, number>();
  for (const g of graphList) {
    const created = await payloadUnsafe.create({
      collection: 'forge-graphs',
      data: {
        project: newProjectId,
        kind: g.kind,
        title: g.title,
        flow: g.flow,
      },
      overrideAccess: true,
    });
    graphIdMap.set(g.id, created.id as number);
  }

  const sourceForgeGraphId =
    sourceProject.forgeGraph != null
      ? typeof sourceProject.forgeGraph === 'object'
        ? (sourceProject.forgeGraph as { id: number }).id
        : (sourceProject.forgeGraph as number)
      : null;
  if (sourceForgeGraphId != null && graphIdMap.has(sourceForgeGraphId)) {
    await payloadUnsafe.update({
      collection: 'projects',
      id: newProjectId,
      data: { forgeGraph: graphIdMap.get(sourceForgeGraphId)! },
      overrideAccess: true,
    });
  }

  const charIdMap = new Map<number, number>();
  for (const c of charList) {
    const created = await payloadUnsafe.create({
      collection: 'characters',
      data: {
        name: c.name,
        description: c.description ?? undefined,
        imageUrl: c.imageUrl ?? undefined,
        voiceId: c.voiceId ?? undefined,
        avatar: c.avatar ?? undefined,
        project: newProjectId,
        meta: c.meta ?? undefined,
        archivedAt: c.archivedAt ?? undefined,
      },
      overrideAccess: true,
    });
    charIdMap.set(c.id, created.id as number);
  }

  for (const r of relList) {
    const newSource = charIdMap.get(r.sourceCharacter as number);
    const newTarget = charIdMap.get(r.targetCharacter as number);
    if (newSource == null || newTarget == null) continue;
    await payloadUnsafe.create({
      collection: 'relationships',
      data: {
        project: newProjectId,
        sourceCharacter: newSource,
        targetCharacter: newTarget,
        label: r.label,
        description: r.description ?? undefined,
      },
      overrideAccess: true,
    });
  }

  const pageIdMap = new Map<number, number>();
  for (const p of pageList) {
    const created = await payloadUnsafe.create({
      collection: 'pages',
      data: {
        project: newProjectId,
        parent: p.parent,
        properties: p.properties ?? {},
        cover: p.cover ?? undefined,
        icon: p.icon ?? undefined,
        archived: p.archived ?? false,
        in_trash: p.in_trash ?? false,
        url: p.url ?? undefined,
        public_url: p.public_url ?? undefined,
      },
      overrideAccess: true,
    });
    pageIdMap.set(p.id, created.id as number);
  }

  const blockIdMap = new Map<number, number>();
  const blocksWithParent: { oldId: number; parentBlockId: number }[] = [];
  for (const b of blockList) {
    const newPageId = pageIdMap.get(b.page);
    if (newPageId == null) continue;
    const created = await payloadUnsafe.create({
      collection: 'blocks',
      data: {
        page: newPageId,
        parent_block: undefined,
        type: b.type,
        position: b.position,
        payload: (b.payload ?? {}) as { [k: string]: unknown },
        archived: b.archived ?? false,
        in_trash: b.in_trash ?? false,
        has_children: b.has_children ?? false,
      },
      overrideAccess: true,
    });
    const newBlockId = created.id as number;
    blockIdMap.set(b.id, newBlockId);
    if (b.parent_block != null) {
      blocksWithParent.push({ oldId: newBlockId, parentBlockId: b.parent_block });
    }
  }
  for (const { oldId: newBlockId, parentBlockId: oldParentId } of blocksWithParent) {
    const newParentId = blockIdMap.get(oldParentId);
    if (newParentId != null) {
      await payloadUnsafe.update({
        collection: 'blocks',
        id: newBlockId,
        data: { parent_block: newParentId },
        overrideAccess: true,
      });
    }
  }

  await recomputeProjectStorageUsage(payload, newProjectId, {
    source: 'clone',
    userId: targetUserId,
  });

  return newProjectId;
}
