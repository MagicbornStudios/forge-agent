import type { CollectionConfig } from 'payload';

/**
 * Notion-inspired pages for WriterMode.
 * Parent, properties, cover, icon align with Notion API concepts.
 */
export const Pages: CollectionConfig = {
  slug: 'pages',
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'project',
      type: 'relationship',
      relationTo: 'projects',
      required: true,
      index: true,
    },
    {
      name: 'parent',
      type: 'json',
      required: true,
      defaultValue: { type: 'workspace', workspace: true },
    },
    {
      name: 'properties',
      type: 'json',
      required: true,
      defaultValue: {},
    },
    {
      name: 'cover',
      type: 'json',
    },
    {
      name: 'icon',
      type: 'json',
    },
    {
      name: 'archived',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'in_trash',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'url',
      type: 'text',
    },
    {
      name: 'public_url',
      type: 'text',
    },
  ],
};
