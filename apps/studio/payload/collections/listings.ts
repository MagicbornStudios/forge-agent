import type { CollectionConfig } from 'payload';

export const Listings: CollectionConfig = {
  slug: 'listings',
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
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
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'listingType',
      type: 'select',
      required: true,
      options: [
        { label: 'Project', value: 'project' },
        { label: 'Template', value: 'template' },
        { label: 'Strategy core', value: 'strategy-core' },
      ],
    },
    {
      name: 'project',
      type: 'relationship',
      relationTo: 'projects',
      admin: { description: 'Optional — for project or template listings' },
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: { description: 'Price in cents, or 0 for free' },
    },
    {
      name: 'currency',
      type: 'text',
      defaultValue: 'USD',
    },
    {
      name: 'creator',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Card image for catalog' },
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Narrative', value: 'narrative' },
        { label: 'Character', value: 'character' },
        { label: 'Template', value: 'template' },
        { label: 'Strategy', value: 'strategy' },
      ],
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
    {
      name: 'cloneMode',
      type: 'select',
      required: true,
      defaultValue: 'indefinite',
      options: [
        { label: 'Indefinite (always current)', value: 'indefinite' },
        { label: 'That version only', value: 'version-only' },
      ],
      admin: { description: 'Clone again: indefinite = current project; version-only = snapshot at purchase' },
    },
  ],
};
