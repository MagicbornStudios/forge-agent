import type { CollectionConfig } from 'payload';

export const RepoPages: CollectionConfig = {
  slug: 'repo-pages',
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'loopId',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'sourcePath',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
    },
    {
      name: 'contentHash',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'metadata',
      type: 'json',
    },
  ],
};
