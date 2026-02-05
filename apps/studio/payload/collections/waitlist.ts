import type { CollectionConfig } from 'payload';

export const Waitlist: CollectionConfig = {
  slug: 'waitlist',
  admin: {
    useAsTitle: 'email',
  },
  access: {
    read: ({ req: { user } }) => Boolean(user?.role === 'admin'),
    create: () => true,
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'source',
      type: 'text',
    },
  ],
};
