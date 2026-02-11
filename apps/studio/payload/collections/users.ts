import type { CollectionConfig } from 'payload';

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'user',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'User', value: 'user' },
      ],
    },
    {
      name: 'plan',
      type: 'select',
      required: true,
      defaultValue: 'free',
      options: [
        { label: 'Free', value: 'free' },
        { label: 'Pro', value: 'pro' },
      ],
    },
    {
      name: 'stripeConnectAccountId',
      type: 'text',
      admin: { description: 'Stripe Connect Express account id (acct_xxx)' },
    },
    {
      name: 'defaultOrganization',
      type: 'relationship',
      relationTo: 'organizations',
      admin: {
        description: 'Active organization for platform dashboards and billing context.',
      },
    },
  ],
};
