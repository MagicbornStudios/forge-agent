import type { CollectionConfig } from 'payload';
import { requireAuthenticated, organizationScopedAccess } from '../access/authorization.ts';
import {
  assertOrganizationStorageGrowthAllowed,
  recordOrganizationStorageDelta,
} from '../../lib/server/storage-metering.ts';

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

function readFileSize(doc: unknown): number {
  if (!doc || typeof doc !== 'object') return 0;
  const value = (doc as { filesize?: unknown }).filesize;
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(0, Math.round(value));
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return Math.max(0, Math.round(parsed));
  }
  return 0;
}

function readRequestUploadSize(req: unknown): number {
  if (!req || typeof req !== 'object' || !('file' in req)) return 0;
  const file = (req as { file?: { size?: unknown } }).file;
  if (!file) return 0;
  const raw = file.size;
  if (typeof raw === 'number' && Number.isFinite(raw)) return Math.max(0, Math.round(raw));
  if (typeof raw === 'string') {
    const parsed = Number(raw);
    if (Number.isFinite(parsed)) return Math.max(0, Math.round(parsed));
  }
  return 0;
}

function readUserId(reqUser: unknown): number | null {
  if (!reqUser || typeof reqUser !== 'object') return null;
  return asNumericId((reqUser as { id?: unknown }).id);
}

function readDefaultOrganizationId(reqUser: unknown): number | null {
  if (!reqUser || typeof reqUser !== 'object') return null;
  return asNumericId((reqUser as { defaultOrganization?: unknown }).defaultOrganization);
}

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    staticDir: 'media',
    imageSizes: [
      {
        name: 'thumbnail',
        width: 128,
        height: 128,
        position: 'centre',
      },
      {
        name: 'medium',
        width: 512,
        height: 512,
        position: 'centre',
      },
    ],
    mimeTypes: ['image/*'],
  },
  access: {
    read: ({ req }) =>
      organizationScopedAccess({ req }, { organizationField: 'organization' }),
    create: requireAuthenticated,
    update: ({ req }) =>
      organizationScopedAccess({ req }, { organizationField: 'organization' }),
    delete: ({ req }) =>
      organizationScopedAccess({ req }, { organizationField: 'organization' }),
  },
  hooks: {
    beforeChange: [
      async ({ data, req, operation, originalDoc }) => {
        const reqUser = req.user as { id?: unknown; defaultOrganization?: unknown } | undefined;
        const nextData = { ...(data ?? {}) } as Record<string, unknown>;

        if (nextData.uploadedByUser == null) {
          const userId = readUserId(reqUser);
          if (userId != null) nextData.uploadedByUser = userId;
        }

        if (nextData.organization == null) {
          const defaultOrganizationId = readDefaultOrganizationId(reqUser);
          if (defaultOrganizationId != null) {
            nextData.organization = defaultOrganizationId;
          }
        }

        const organizationId =
          asNumericId(nextData.organization) ??
          asNumericId((originalDoc as { organization?: unknown } | undefined)?.organization);
        if (organizationId == null) {
          throw new Error('Media uploads require an active organization.');
        }

        const previousSize = readFileSize(originalDoc);
        const nextSize = Math.max(readFileSize(nextData), readRequestUploadSize(req));
        const additionalBytes = Math.max(0, nextSize - previousSize);
        if (additionalBytes > 0 && (operation === 'create' || operation === 'update')) {
          const allowed = await assertOrganizationStorageGrowthAllowed(
            req.payload,
            organizationId,
            additionalBytes,
          );
          if (!allowed.allowed) {
            throw new Error(
              `Organization storage limit exceeded (${allowed.storageUsedBytes}/${allowed.storageQuotaBytes} bytes).`,
            );
          }
        }

        return nextData;
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, req }) => {
        const organizationId =
          asNumericId((doc as { organization?: unknown }).organization) ??
          asNumericId((previousDoc as { organization?: unknown } | undefined)?.organization);
        if (organizationId == null) return doc;

        const previousSize = readFileSize(previousDoc);
        const nextSize = readFileSize(doc);
        const deltaBytes = nextSize - previousSize;
        if (deltaBytes === 0) return doc;

        await recordOrganizationStorageDelta(req.payload, {
          organizationId,
          userId:
            asNumericId((doc as { uploadedByUser?: unknown }).uploadedByUser) ??
            readUserId(req.user),
          projectId: asNumericId((doc as { project?: unknown }).project),
          source: deltaBytes > 0 ? 'media_upload' : 'delete',
          deltaBytes,
          metadata: {
            collection: 'media',
            mediaId: asNumericId((doc as { id?: unknown }).id),
          },
        });
        return doc;
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        const organizationId = asNumericId((doc as { organization?: unknown }).organization);
        if (organizationId == null) return doc;
        const size = readFileSize(doc);
        if (size <= 0) return doc;

        await recordOrganizationStorageDelta(req.payload, {
          organizationId,
          userId: asNumericId((doc as { uploadedByUser?: unknown }).uploadedByUser),
          projectId: asNumericId((doc as { project?: unknown }).project),
          source: 'delete',
          deltaBytes: -size,
          metadata: {
            collection: 'media',
            mediaId: asNumericId((doc as { id?: unknown }).id),
          },
        });
        return doc;
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
    },
    {
      name: 'organization',
      type: 'relationship',
      relationTo: 'organizations',
      required: true,
      admin: {
        description: 'Organization that owns this media asset.',
      },
    },
    {
      name: 'uploadedByUser',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'User who uploaded this media.',
      },
    },
    {
      name: 'project',
      type: 'relationship',
      relationTo: 'projects',
      admin: {
        description: 'Optional project attribution for storage breakdowns.',
      },
    },
  ],
};

