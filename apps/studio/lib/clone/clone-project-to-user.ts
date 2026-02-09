import type { Payload } from 'payload';

export type CloneProjectToUserOptions = {
  slug?: string;
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

  const [sourceGraphs, sourceCharacters, sourceRelationships, sourcePages] =
    await Promise.all([
      payload.find({
        collection: 'forge-graphs',
        where: { project: { equals: projectId } },
        depth: 0,
        limit: 100,
      }),
      payload.find({
        collection: 'characters',
        where: { project: { equals: projectId } },
        depth: 0,
        limit: 500,
      }),
      payload.find({
        collection: 'relationships',
        where: { project: { equals: projectId } },
        depth: 0,
        limit: 500,
      }),
      payload.find({
        collection: 'pages',
        where: { project: { equals: projectId } },
        depth: 0,
        limit: 500,
      }),
    ]);

  const graphList = sourceGraphs.docs;
  const charList = sourceCharacters.docs;
  const relList = sourceRelationships.docs;
  const pageList = sourcePages.docs;
  const pageIds = pageList.map((p) => p.id);

  const sourceBlocks =
    pageIds.length > 0
      ? await payload.find({
          collection: 'blocks',
          where: { page: { in: pageIds } },
          depth: 0,
          limit: 2000,
        })
      : { docs: [] as { id: number; page: number; parent_block: number | null }[] };

  const blockList = sourceBlocks.docs as {
    id: number;
    page: number;
    parent_block: number | null;
    type: string;
    position: number;
    payload: unknown;
    archived?: boolean;
    in_trash?: boolean;
    has_children?: boolean;
  }[];

  const newProject = await payload.create({
    collection: 'projects',
    data: {
      title: `${sourceProject.title} (Copy)`,
      slug,
      description: sourceProject.description ?? undefined,
      domain: sourceProject.domain ?? 'forge',
      status: sourceProject.status ?? 'active',
      owner: targetUserId,
      forgeGraph: undefined,
    },
    overrideAccess: true,
  });
  const newProjectId = newProject.id as number;

  const graphIdMap = new Map<number, number>();
  for (const g of graphList) {
    const created = await payload.create({
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
    await payload.update({
      collection: 'projects',
      id: newProjectId,
      data: { forgeGraph: graphIdMap.get(sourceForgeGraphId)! },
      overrideAccess: true,
    });
  }

  const charIdMap = new Map<number, number>();
  for (const c of charList) {
    const created = await payload.create({
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
    await payload.create({
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
    const created = await payload.create({
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
    const created = await payload.create({
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
      await payload.update({
        collection: 'blocks',
        id: newBlockId,
        data: { parent_block: newParentId },
        overrideAccess: true,
      });
    }
  }

  return newProjectId;
}
