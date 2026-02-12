import type { CollectionConfig } from 'payload';
import { organizationScopedAccess } from '../access/authorization.ts';

export const OrganizationMemberships: CollectionConfig = {
  slug: 'organization-memberships',
  access: {
    read: ({ req }) =>
      organizationScopedAccess({ req }, { organizationField: 'organization' }),
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  admin: {
    useAsTitle: 'id',
    description: 'Membership records mapping users to organizations.',
  },
  indexes: [
    {
      fields: ['organization', 'user'],
      unique: true,
    },
  ],
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
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'member',
      options: [
        { label: 'Owner', value: 'owner' },
        { label: 'Member', value: 'member' },
      ],
    },
  ],
};

