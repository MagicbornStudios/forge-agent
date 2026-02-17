import type { Payload } from 'payload';
import {
  DEFAULT_STORAGE_QUOTA_BYTES,
  DEFAULT_STORAGE_WARNING_THRESHOLD_PERCENT,
} from './billing/context.ts';
import { findAllDocs } from './payload-pagination.ts';

export type StorageEventSource =
  | 'media_upload'
  | 'project_write'
  | 'clone'
  | 'delete'
  | 'recompute';

export type StorageSummary = {
  organizationId: number;
  storageQuotaBytes: number;
  storageUsedBytes: number;
  storageRemainingBytes: number;
  storageUsagePercent: number;
  storageWarningThresholdPercent: number;
  warning: boolean;
  overLimit: boolean;
};

export type StorageBreakdownRow = {
  entityType: 'org' | 'user' | 'project';
  entityId: number | null;
  label: string;
  mediaBytes: number;
  projectBytes: number;
  totalBytes: number;
};

type RecordStorageDeltaInput = {
  organizationId: number;
  userId?: number | null;
  projectId?: number | null;
  source: StorageEventSource;
  deltaBytes: number;
  metadata?: Record<string, unknown>;
};

type RecomputeProjectStorageOptions = {
  source?: StorageEventSource;
  userId?: number | null;
};

function asNumericId(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  if (typeof value === 'object' && value != null && 'id' in value) {
    return asNumericId((value as { id?: unknown }).id);
  }
  return null;
}

function toFiniteNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function byteLength(value: unknown): number {
  if (value == null) return 0;
  try {
    return Buffer.byteLength(JSON.stringify(value), 'utf8');
  } catch {
    return 0;
  }
}

async function getOrganizationStorageFields(payload: Payload, organizationId: number) {
  const organizationRaw = await payload.findByID({
    collection: 'organizations',
    id: organizationId,
    depth: 0,
    overrideAccess: true,
  });

  if (!organizationRaw || typeof organizationRaw !== 'object') {
    throw new Error('Organization not found');
  }
  const organization = organizationRaw as unknown as Record<string, unknown>;

  const storageQuotaBytes = Math.max(
    0,
    Math.round(toFiniteNumber(organization.storageQuotaBytes, DEFAULT_STORAGE_QUOTA_BYTES)),
  );
  const storageUsedBytes = Math.max(
    0,
    Math.round(toFiniteNumber(organization.storageUsedBytes, 0)),
  );
  const storageWarningThresholdPercent = Math.min(
    100,
    Math.max(
      1,
      Math.round(
        toFiniteNumber(
          organization.storageWarningThresholdPercent,
          DEFAULT_STORAGE_WARNING_THRESHOLD_PERCENT,
        ),
      ),
    ),
  );

  return {
    organization,
    storageQuotaBytes,
    storageUsedBytes,
    storageWarningThresholdPercent,
  };
}

function toStorageSummary(input: {
  organizationId: number;
  storageQuotaBytes: number;
  storageUsedBytes: number;
  storageWarningThresholdPercent: number;
}): StorageSummary {
  const storageQuotaBytes = Math.max(0, Math.round(input.storageQuotaBytes));
  const storageUsedBytes = Math.max(0, Math.round(input.storageUsedBytes));
  const storageRemainingBytes = Math.max(0, storageQuotaBytes - storageUsedBytes);
  const storageUsagePercent =
    storageQuotaBytes > 0 ? (storageUsedBytes / storageQuotaBytes) * 100 : 0;
  const warning = storageUsagePercent >= input.storageWarningThresholdPercent;
  const overLimit = storageQuotaBytes > 0 && storageUsedBytes > storageQuotaBytes;

  return {
    organizationId: input.organizationId,
    storageQuotaBytes,
    storageUsedBytes,
    storageRemainingBytes,
    storageUsagePercent,
    storageWarningThresholdPercent: input.storageWarningThresholdPercent,
    warning,
    overLimit,
  };
}

export async function recordOrganizationStorageDelta(
  payload: Payload,
  input: RecordStorageDeltaInput,
): Promise<StorageSummary> {
  const current = await getOrganizationStorageFields(payload, input.organizationId);
  const nextUsedBytes = Math.max(
    0,
    Math.round(current.storageUsedBytes + Math.round(input.deltaBytes)),
  );

  if (nextUsedBytes !== current.storageUsedBytes) {
    await payload.update({
      collection: 'organizations',
      id: input.organizationId,
      data: {
        storageUsedBytes: nextUsedBytes,
      },
      overrideAccess: true,
    });
  }

  await payload.create({
    collection: 'storage-usage-events',
    data: {
      organization: input.organizationId,
      user: input.userId ?? undefined,
      project: input.projectId ?? undefined,
      source: input.source,
      deltaBytes: Math.round(input.deltaBytes),
      totalAfterBytes: nextUsedBytes,
      metadata: input.metadata ?? {},
      createdAt: new Date().toISOString(),
    },
    overrideAccess: true,
  });

  return toStorageSummary({
    organizationId: input.organizationId,
    storageQuotaBytes: current.storageQuotaBytes,
    storageUsedBytes: nextUsedBytes,
    storageWarningThresholdPercent: current.storageWarningThresholdPercent,
  });
}

export async function assertOrganizationStorageGrowthAllowed(
  payload: Payload,
  organizationId: number,
  additionalBytes: number,
): Promise<StorageSummary & { nextUsedBytes: number; allowed: boolean }> {
  const current = await getOrganizationStorageFields(payload, organizationId);
  const nextUsedBytes = Math.max(
    0,
    Math.round(current.storageUsedBytes + Math.max(0, additionalBytes)),
  );

  const summary = toStorageSummary({
    organizationId,
    storageQuotaBytes: current.storageQuotaBytes,
    storageUsedBytes: nextUsedBytes,
    storageWarningThresholdPercent: current.storageWarningThresholdPercent,
  });

  return {
    ...summary,
    nextUsedBytes,
    allowed: !summary.overLimit,
  };
}

export async function calculateProjectEstimatedSizeBytes(
  payload: Payload,
  projectId: number,
): Promise<number> {
  const projectRaw = await payload.findByID({
    collection: 'projects',
    id: projectId,
    depth: 0,
    overrideAccess: true,
  });

  if (!projectRaw || typeof projectRaw !== 'object') return 0;
  const project = projectRaw as unknown as Record<string, unknown>;

  const [graphs, characters, relationships, pages] = await Promise.all([
    findAllDocs<Record<string, unknown>>(payload, {
      collection: 'forge-graphs',
      where: { project: { equals: projectId } },
      depth: 0,
      overrideAccess: true,
      limit: 1000,
    }),
    findAllDocs<Record<string, unknown>>(payload, {
      collection: 'characters',
      where: { project: { equals: projectId } },
      depth: 0,
      overrideAccess: true,
      limit: 1000,
    }),
    findAllDocs<Record<string, unknown>>(payload, {
      collection: 'relationships',
      where: { project: { equals: projectId } },
      depth: 0,
      overrideAccess: true,
      limit: 1000,
    }),
    findAllDocs<Record<string, unknown>>(payload, {
      collection: 'pages',
      where: { project: { equals: projectId } },
      depth: 0,
      overrideAccess: true,
      limit: 2000,
    }),
  ]);

  const pageIds = pages
    .map((page) => asNumericId(page.id))
    .filter((id): id is number => id != null);

  const blocks =
    pageIds.length > 0
      ? await findAllDocs<Record<string, unknown>>(payload, {
          collection: 'blocks',
          where: { page: { in: pageIds } },
          depth: 0,
          overrideAccess: true,
          limit: 5000,
        })
      : [];

  let total = 0;

  total += byteLength({
    title: project.title,
    slug: project.slug,
    description: project.description,
    domain: project.domain,
    status: project.status,
  });

  for (const graph of graphs) {
    total += byteLength({
      title: graph.title,
      kind: graph.kind,
      flow: graph.flow,
    });
  }

  for (const character of characters) {
    total += byteLength({
      name: character.name,
      description: character.description,
      imageUrl: character.imageUrl,
      voiceId: character.voiceId,
      meta: character.meta,
    });
  }

  for (const relationship of relationships) {
    total += byteLength({
      sourceCharacter: relationship.sourceCharacter,
      targetCharacter: relationship.targetCharacter,
      label: relationship.label,
      description: relationship.description,
    });
  }

  for (const page of pages) {
    total += byteLength({
      parent: page.parent,
      properties: page.properties,
      cover: page.cover,
      icon: page.icon,
      archived: page.archived,
      in_trash: page.in_trash,
      url: page.url,
      public_url: page.public_url,
    });
  }

  for (const block of blocks) {
    total += byteLength({
      page: block.page,
      parent_block: block.parent_block,
      type: block.type,
      position: block.position,
      payload: block.payload,
      archived: block.archived,
      in_trash: block.in_trash,
      has_children: block.has_children,
    });
  }

  return Math.max(0, Math.round(total));
}

export async function recomputeProjectStorageUsage(
  payload: Payload,
  projectId: number,
  options?: RecomputeProjectStorageOptions,
): Promise<{
  previousEstimatedSizeBytes: number;
  nextEstimatedSizeBytes: number;
  deltaBytes: number;
  organizationId: number | null;
}> {
  const projectRaw = await payload.findByID({
    collection: 'projects',
    id: projectId,
    depth: 0,
    overrideAccess: true,
  });

  if (!projectRaw || typeof projectRaw !== 'object') {
    return {
      previousEstimatedSizeBytes: 0,
      nextEstimatedSizeBytes: 0,
      deltaBytes: 0,
      organizationId: null,
    };
  }
  const project = projectRaw as unknown as Record<string, unknown>;

  const organizationId = asNumericId(project.organization);
  const previousEstimatedSizeBytes = Math.max(
    0,
    Math.round(toFiniteNumber(project.estimatedSizeBytes, 0)),
  );
  const nextEstimatedSizeBytes = await calculateProjectEstimatedSizeBytes(payload, projectId);
  const deltaBytes = nextEstimatedSizeBytes - previousEstimatedSizeBytes;

  if (nextEstimatedSizeBytes !== previousEstimatedSizeBytes) {
    await payload.update({
      collection: 'projects',
      id: projectId,
      data: {
        estimatedSizeBytes: nextEstimatedSizeBytes,
      },
      context: {
        skipStorageRecompute: true,
      },
      overrideAccess: true,
    });
  }

  if (organizationId != null && deltaBytes !== 0) {
    await recordOrganizationStorageDelta(payload, {
      organizationId,
      userId: options?.userId ?? null,
      projectId,
      source: options?.source ?? 'project_write',
      deltaBytes,
      metadata: {
        projectId,
      },
    });
  }

  return {
    previousEstimatedSizeBytes,
    nextEstimatedSizeBytes,
    deltaBytes,
    organizationId,
  };
}

export async function recomputeOrganizationStorageUsage(
  payload: Payload,
  organizationId: number,
): Promise<StorageSummary & { mediaBytes: number; projectBytes: number }> {
  const current = await getOrganizationStorageFields(payload, organizationId);

  const [mediaDocs, projects] = await Promise.all([
    findAllDocs<Record<string, unknown>>(payload, {
      collection: 'media',
      where: {
        organization: {
          equals: organizationId,
        },
      },
      depth: 0,
      overrideAccess: true,
      limit: 2000,
    }),
    findAllDocs<Record<string, unknown>>(payload, {
      collection: 'projects',
      where: {
        organization: {
          equals: organizationId,
        },
      },
      depth: 0,
      overrideAccess: true,
      limit: 2000,
    }),
  ]);

  const mediaBytes = mediaDocs.reduce(
    (sum, doc) => sum + Math.max(0, Math.round(toFiniteNumber(doc.filesize, 0))),
    0,
  );
  const projectBytes = projects.reduce(
    (sum, doc) => sum + Math.max(0, Math.round(toFiniteNumber(doc.estimatedSizeBytes, 0))),
    0,
  );

  const nextUsedBytes = mediaBytes + projectBytes;
  const deltaBytes = nextUsedBytes - current.storageUsedBytes;

  if (deltaBytes !== 0) {
    await recordOrganizationStorageDelta(payload, {
      organizationId,
      source: 'recompute',
      deltaBytes,
      metadata: {
        mediaBytes,
        projectBytes,
      },
    });
  }

  const summary = toStorageSummary({
    organizationId,
    storageQuotaBytes: current.storageQuotaBytes,
    storageUsedBytes: nextUsedBytes,
    storageWarningThresholdPercent: current.storageWarningThresholdPercent,
  });

  return {
    ...summary,
    mediaBytes,
    projectBytes,
  };
}

export async function estimateCloneStorageDeltaBytes(
  payload: Payload,
  sourceProjectId: number,
): Promise<number> {
  const projectRaw = await payload.findByID({
    collection: 'projects',
    id: sourceProjectId,
    depth: 0,
    overrideAccess: true,
  });

  if (!projectRaw || typeof projectRaw !== 'object') return 0;
  const project = projectRaw as unknown as Record<string, unknown>;

  const estimated = Math.max(0, Math.round(toFiniteNumber(project.estimatedSizeBytes, 0)));
  if (estimated > 0) return estimated;

  return calculateProjectEstimatedSizeBytes(payload, sourceProjectId);
}

async function getProjectLabels(payload: Payload, projectIds: number[]) {
  if (projectIds.length === 0) return new Map<number, string>();
  const docs = await payload.find({
    collection: 'projects',
    where: {
      id: {
        in: projectIds,
      },
    },
    depth: 0,
    limit: 2000,
    overrideAccess: true,
  });
  const map = new Map<number, string>();
  for (const rawDoc of docs.docs as unknown[]) {
    if (!rawDoc || typeof rawDoc !== 'object') continue;
    const doc = rawDoc as Record<string, unknown>;
    const id = asNumericId(doc.id);
    if (id == null) continue;
    const title = typeof doc.title === 'string' && doc.title.trim().length > 0
      ? doc.title
      : `Project ${id}`;
    map.set(id, title);
  }
  return map;
}

async function getUserLabels(payload: Payload, userIds: number[]) {
  if (userIds.length === 0) return new Map<number, string>();
  const docs = await payload.find({
    collection: 'users',
    where: {
      id: {
        in: userIds,
      },
    },
    depth: 0,
    limit: 2000,
    overrideAccess: true,
  });
  const map = new Map<number, string>();
  for (const rawDoc of docs.docs as unknown[]) {
    if (!rawDoc || typeof rawDoc !== 'object') continue;
    const doc = rawDoc as Record<string, unknown>;
    const id = asNumericId(doc.id);
    if (id == null) continue;
    const name =
      typeof doc.name === 'string' && doc.name.trim().length > 0
        ? doc.name
        : typeof doc.email === 'string' && doc.email.trim().length > 0
          ? doc.email
          : `User ${id}`;
    map.set(id, name);
  }
  return map;
}

export async function getOrganizationStorageBreakdown(
  payload: Payload,
  organizationId: number,
  groupBy: 'org' | 'user' | 'project',
): Promise<StorageBreakdownRow[]> {
  const [mediaDocs, projects] = await Promise.all([
    findAllDocs<Record<string, unknown>>(payload, {
      collection: 'media',
      where: {
        organization: {
          equals: organizationId,
        },
      },
      depth: 0,
      overrideAccess: true,
      limit: 5000,
    }),
    findAllDocs<Record<string, unknown>>(payload, {
      collection: 'projects',
      where: {
        organization: {
          equals: organizationId,
        },
      },
      depth: 0,
      overrideAccess: true,
      limit: 5000,
    }),
  ]);

  const totalMediaBytes = mediaDocs.reduce(
    (sum, doc) => sum + Math.max(0, Math.round(toFiniteNumber(doc.filesize, 0))),
    0,
  );
  const totalProjectBytes = projects.reduce(
    (sum, doc) => sum + Math.max(0, Math.round(toFiniteNumber(doc.estimatedSizeBytes, 0))),
    0,
  );

  if (groupBy === 'org') {
    return [
      {
        entityType: 'org',
        entityId: organizationId,
        label: 'Organization total',
        mediaBytes: totalMediaBytes,
        projectBytes: totalProjectBytes,
        totalBytes: totalMediaBytes + totalProjectBytes,
      },
    ];
  }

  if (groupBy === 'user') {
    const userRows = new Map<number, StorageBreakdownRow>();

    for (const project of projects) {
      const userId = asNumericId(project.owner);
      if (userId == null) continue;
      const row = userRows.get(userId) ?? {
        entityType: 'user',
        entityId: userId,
        label: `User ${userId}`,
        mediaBytes: 0,
        projectBytes: 0,
        totalBytes: 0,
      };
      row.projectBytes += Math.max(0, Math.round(toFiniteNumber(project.estimatedSizeBytes, 0)));
      userRows.set(userId, row);
    }

    for (const mediaDoc of mediaDocs) {
      const userId = asNumericId(mediaDoc.uploadedByUser);
      if (userId == null) continue;
      const row = userRows.get(userId) ?? {
        entityType: 'user',
        entityId: userId,
        label: `User ${userId}`,
        mediaBytes: 0,
        projectBytes: 0,
        totalBytes: 0,
      };
      row.mediaBytes += Math.max(0, Math.round(toFiniteNumber(mediaDoc.filesize, 0)));
      userRows.set(userId, row);
    }

    const userIds = [...userRows.keys()];
    const labels = await getUserLabels(payload, userIds);

    return [...userRows.values()]
      .map((row) => ({
        ...row,
        label: row.entityId != null ? labels.get(row.entityId) ?? row.label : row.label,
        totalBytes: row.mediaBytes + row.projectBytes,
      }))
      .sort((a, b) => b.totalBytes - a.totalBytes);
  }

  const projectRows = new Map<number | null, StorageBreakdownRow>();
  for (const project of projects) {
    const projectId = asNumericId(project.id);
    if (projectId == null) continue;
    const title =
      typeof project.title === 'string' && project.title.trim().length > 0
        ? project.title
        : `Project ${projectId}`;
    projectRows.set(projectId, {
      entityType: 'project',
      entityId: projectId,
      label: title,
      mediaBytes: 0,
      projectBytes: Math.max(0, Math.round(toFiniteNumber(project.estimatedSizeBytes, 0))),
      totalBytes: 0,
    });
  }

  for (const mediaDoc of mediaDocs) {
    const projectId = asNumericId(mediaDoc.project);
    const rowKey = projectId ?? null;
    const row =
      projectRows.get(rowKey) ?? {
        entityType: 'project',
        entityId: rowKey,
        label: rowKey == null ? 'Unassigned media' : `Project ${rowKey}`,
        mediaBytes: 0,
        projectBytes: 0,
        totalBytes: 0,
      };
    row.mediaBytes += Math.max(0, Math.round(toFiniteNumber(mediaDoc.filesize, 0)));
    projectRows.set(rowKey, row);
  }

  const labeledProjectIds = [...projectRows.keys()].filter(
    (value): value is number => value != null,
  );
  const projectLabels = await getProjectLabels(payload, labeledProjectIds);

  return [...projectRows.values()]
    .map((row) => ({
      ...row,
      label:
        row.entityId != null
          ? projectLabels.get(row.entityId) ?? row.label
          : row.label,
      totalBytes: row.mediaBytes + row.projectBytes,
    }))
    .sort((a, b) => b.totalBytes - a.totalBytes);
}
