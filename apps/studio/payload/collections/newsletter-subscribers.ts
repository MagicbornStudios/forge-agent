import type { CollectionConfig } from 'payload';

export const NewsletterSubscribers: CollectionConfig = {
  slug: 'newsletter-subscribers',
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
      name: 'optedIn',
      type: 'checkbox',
      required: true,
      defaultValue: true,
    },
    {
      name: 'source',
      type: 'text',
    },
  ],
};

