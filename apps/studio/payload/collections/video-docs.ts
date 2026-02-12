import type { CollectionConfig } from 'payload';

export const VideoDocs: CollectionConfig = {
  slug: 'video-docs',
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'graphId',
      type: 'text',
    },
    {
      name: 'doc',
      type: 'json',
      required: true,
    },
  ],
};

