import type { CollectionConfig } from 'payload';

export const Licenses: CollectionConfig = {
  slug: 'licenses',
  access: {
    read: ({ req }) => !!req.user,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  admin: {
    useAsTitle: 'id',
    description: 'License records for clone purchases; created by Stripe webhook.',
  },
  indexes: [
    {
      fields: ['stripeSessionId'],
      unique: true,
    },
  ],
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: { description: 'License holder (buyer)' },
    },
    {
      name: 'listing',
      type: 'relationship',
      relationTo: 'listings',
      required: true,
    },
    {
      name: 'sellerOrganization',
      type: 'relationship',
      relationTo: 'organizations',
      admin: { description: 'Organization receiving creator-side revenue for this license.' },
    },
    {
      name: 'stripeSessionId',
      type: 'text',
      required: true,
      unique: true,
      admin: { description: 'Stripe Checkout session id (cs_xxx)' },
    },
    {
      name: 'grantedAt',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
    },
    {
      name: 'versionSnapshotId',
      type: 'text',
      admin: { description: 'Optional snapshot/version for version-only clone mode' },
    },
    {
      name: 'clonedProjectId',
      type: 'relationship',
      relationTo: 'projects',
      admin: { description: 'Project created by first clone (set by webhook)' },
    },
    {
      name: 'amountCents',
      type: 'number',
      admin: { description: 'Total paid in cents (set by webhook)' },
    },
    {
      name: 'platformFeeCents',
      type: 'number',
      admin: { description: 'Platform take in cents (set by webhook)' },
    },
  ],
};

