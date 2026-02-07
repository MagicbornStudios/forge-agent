import type { CollectionConfig } from 'payload';

/**
 * Notion-inspired blocks (page content) for WriterMode.
 * type + payload mirror Notion block structure; parent is page or block.
 */
export const Blocks: CollectionConfig = {
  slug: 'blocks',
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
      relationTo: 'pages',
      required: true,
      index: true,
    },
    {
      name: 'parent_block',
      type: 'relationship',
      relationTo: 'blocks',
      admin: { description: 'Optional; set when block is nested under another block.' },
    },
    {
      name: 'type',
      type: 'text',
      required: true,
      index: true,
      admin: { description: 'e.g. paragraph, heading_1, heading_2, bulleted_list_item, code' },
    },
    {
      name: 'position',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: { description: 'Order among siblings.' },
    },
    {
      name: 'payload',
      type: 'json',
      required: true,
      defaultValue: {},
      admin: { description: 'Type-specific content (e.g. rich_text, code.language).' },
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
      name: 'has_children',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
};
