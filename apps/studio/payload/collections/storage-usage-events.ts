import type { CollectionConfig } from 'payload';
import { organizationScopedAccess } from '../access/authorization.ts';

export const StorageUsageEvents: CollectionConfig = {
  slug: 'storage-usage-events',
  access: {
    read: ({ req }) =>
      organizationScopedAccess({ req }, { organizationField: 'organization' }),
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  admin: {
    useAsTitle: 'id',
    description: 'Immutable ledger of storage deltas used for organization quota tracking.',
  },
  fields: [
    {
      name: 'organization',
      type: 'relationship',
      relationTo: 'organizations',
      required: true,
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'project',
      type: 'relationship',
      relationTo: 'projects',
    },
    {
      name: 'source',
      type: 'select',
      required: true,
      options: [
        { label: 'Media upload', value: 'media_upload' },
        { label: 'Project write', value: 'project_write' },
        { label: 'Clone', value: 'clone' },
        { label: 'Delete', value: 'delete' },
        { label: 'Recompute', value: 'recompute' },
      ],
    },
    {
      name: 'deltaBytes',
      type: 'number',
      required: true,
    },
    {
      name: 'totalAfterBytes',
      type: 'number',
      required: true,
    },
    {
      name: 'metadata',
      type: 'json',
    },
    {
      name: 'createdAt',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
    },
  ],
};

