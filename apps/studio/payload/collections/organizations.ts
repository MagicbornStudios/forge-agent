import type { CollectionConfig } from 'payload';

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const Organizations: CollectionConfig = {
  slug: 'organizations',
  access: {
    read: ({ req }) => !!req.user,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) return data;
        if (typeof data.slug !== 'string' || data.slug.trim().length === 0) {
          const name = typeof data.name === 'string' ? data.name : '';
          if (name.trim().length > 0) {
            return {
              ...data,
              slug: slugify(name),
            };
          }
        }
        return data;
      },
    ],
  },
  fields: [
    {
      name: 'name',
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
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'stripeConnectAccountId',
      type: 'text',
      admin: { description: 'Stripe Connect Express account id (acct_xxx)' },
    },
    {
      name: 'stripeConnectOnboardingComplete',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
};
