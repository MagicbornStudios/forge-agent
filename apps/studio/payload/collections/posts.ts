import type { CollectionConfig } from 'payload';
import { lexicalEditor } from '@payloadcms/richtext-lexical';

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: ({ req }) => {
      if (req.user) return true;
      return {
        status: { equals: 'published' },
      };
    },
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
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL-friendly identifier (e.g. my-post-title).',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
    },
    {
      name: 'body',
      type: 'richText',
      editor: lexicalEditor({}),
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        description: 'When the post is considered published.',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
    },
  ],
};
