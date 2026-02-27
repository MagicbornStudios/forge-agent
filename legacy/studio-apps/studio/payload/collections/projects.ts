import type { CollectionConfig } from 'payload';
import {
  organizationScopedAccess,
  requireAuthenticated,
} from '../access/authorization.ts';
import { recordOrganizationStorageDelta } from '../../lib/server/storage-metering.ts';

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

export const Projects: CollectionConfig = {
  slug: 'projects',
  access: {
    read: ({ req }) =>
      organizationScopedAccess(
        { req },
        { ownerField: 'owner', organizationField: 'organization' },
      ),
    create: requireAuthenticated,
    update: ({ req }) =>
      organizationScopedAccess(
        { req },
        { ownerField: 'owner', organizationField: 'organization' },
      ),
    delete: ({ req }) =>
      organizationScopedAccess(
        { req },
        { ownerField: 'owner', organizationField: 'organization' },
      ),
  },
  hooks: {
    beforeChange: [
      ({ data, req }) => {
        if (!data || !req?.user) return data;
        const requestUser = req.user as { id?: unknown; defaultOrganization?: unknown };
        const nextData = { ...data } as Record<string, unknown>;
        if (nextData.owner == null && typeof requestUser.id === 'number') {
          nextData.owner = requestUser.id;
        }
        if (nextData.organization == null && requestUser.defaultOrganization != null) {
          nextData.organization =
            typeof requestUser.defaultOrganization === 'object' &&
            requestUser.defaultOrganization != null &&
            'id' in requestUser.defaultOrganization
              ? (requestUser.defaultOrganization as { id: number }).id
              : requestUser.defaultOrganization;
        }
        return nextData;
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        const organizationId = asNumericId((doc as { organization?: unknown }).organization);
        const estimatedSizeBytes = Math.max(
          0,
          Math.round(
            typeof (doc as { estimatedSizeBytes?: unknown }).estimatedSizeBytes === 'number'
              ? ((doc as { estimatedSizeBytes?: number }).estimatedSizeBytes ?? 0)
              : Number((doc as { estimatedSizeBytes?: unknown }).estimatedSizeBytes ?? 0),
          ),
        );
        if (organizationId != null && estimatedSizeBytes > 0) {
          await recordOrganizationStorageDelta(req.payload, {
            organizationId,
            userId: asNumericId((doc as { owner?: unknown }).owner),
            projectId: asNumericId((doc as { id?: unknown }).id),
            source: 'delete',
            deltaBytes: -estimatedSizeBytes,
            metadata: {
              collection: 'projects',
              reason: 'project-delete',
            },
          });
        }
        return doc;
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'domain',
      type: 'select',
      required: true,
      defaultValue: 'forge',
      options: [
        { label: 'Forge', value: 'forge' },
        { label: 'Video', value: 'video' },
        { label: 'Character', value: 'character' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Archived', value: 'archived' },
      ],
    },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'organization',
      type: 'relationship',
      relationTo: 'organizations',
      admin: {
        description: 'Owning organization for creator dashboards (optional during migration).',
      },
    },
    {
      name: 'estimatedSizeBytes',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: {
        description: 'Estimated storage footprint for project-owned documents.',
      },
    },
    {
      name: 'forgeGraph',
      type: 'relationship',
      relationTo: 'forge-graphs',
    },
  ],
};

