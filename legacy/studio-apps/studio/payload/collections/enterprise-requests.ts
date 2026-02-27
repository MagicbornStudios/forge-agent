import type { CollectionConfig } from 'payload';
import { organizationScopedAccess } from '../access/authorization.ts';

export const EnterpriseRequests: CollectionConfig = {
  slug: 'enterprise-requests',
  access: {
    read: ({ req }) =>
      organizationScopedAccess({ req }, { organizationField: 'organization' }),
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  admin: {
    useAsTitle: 'id',
    description: 'Customer enterprise request tickets (source access/support/custom editors).',
  },
  fields: [
    {
      name: 'organization',
      type: 'relationship',
      relationTo: 'organizations',
      required: true,
    },
    {
      name: 'requestedByUser',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Source access', value: 'source_access' },
        { label: 'Premium support', value: 'premium_support' },
        { label: 'Custom editor', value: 'custom_editor' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'open',
      options: [
        { label: 'Open', value: 'open' },
        { label: 'In review', value: 'in_review' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Completed', value: 'completed' },
      ],
    },
    {
      name: 'notes',
      type: 'textarea',
    },
    {
      name: 'resolvedAt',
      type: 'date',
    },
    {
      name: 'resolvedBy',
      type: 'relationship',
      relationTo: 'users',
    },
  ],
};

