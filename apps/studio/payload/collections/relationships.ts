import type { CollectionConfig } from 'payload';

export const Relationships: CollectionConfig = {
  slug: 'relationships',
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'sourceCharacter', 'targetCharacter', 'project'],
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
      name: 'sourceCharacter',
      type: 'relationship',
      relationTo: 'characters',
      required: true,
    },
    {
      name: 'targetCharacter',
      type: 'relationship',
      relationTo: 'characters',
      required: true,
    },
    {
      name: 'label',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
  ],
};
