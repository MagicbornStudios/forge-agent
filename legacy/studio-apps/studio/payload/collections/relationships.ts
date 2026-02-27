import type { CollectionConfig } from 'payload';
import { projectScopedAccess, requireAuthenticated } from '../access/authorization.ts';

export const Relationships: CollectionConfig = {
  slug: 'relationships',
  access: {
    read: ({ req }) => projectScopedAccess({ req }),
    create: requireAuthenticated,
    update: ({ req }) => projectScopedAccess({ req }),
    delete: ({ req }) => projectScopedAccess({ req }),
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

