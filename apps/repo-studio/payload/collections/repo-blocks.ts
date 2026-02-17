import type { CollectionConfig } from 'payload';

export const RepoBlocks: CollectionConfig = {
  slug: 'repo-blocks',
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'page',
      type: 'relationship',
      relationTo: 'repo-pages',
      required: true,
      index: true,
    },
    {
      name: 'type',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'position',
      type: 'number',
      required: true,
      index: true,
    },
    {
      name: 'payload',
      type: 'json',
      required: true,
    },
    {
      name: 'sourceHash',
      type: 'text',
      required: true,
    },
  ],
};
