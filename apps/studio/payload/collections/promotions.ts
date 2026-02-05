import type { CollectionConfig } from 'payload';
import { lexicalEditor } from '@payloadcms/richtext-lexical';

export const Promotions: CollectionConfig = {
  slug: 'promotions',
  admin: {
    useAsTitle: 'title',
  },
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
      name: 'body',
      type: 'richText',
      editor: lexicalEditor({}),
    },
    {
      name: 'active',
      type: 'checkbox',
      required: true,
      defaultValue: false,
    },
    {
      name: 'startsAt',
      type: 'date',
    },
    {
      name: 'endsAt',
      type: 'date',
    },
    {
      name: 'ctaUrl',
      type: 'text',
    },
  ],
};
