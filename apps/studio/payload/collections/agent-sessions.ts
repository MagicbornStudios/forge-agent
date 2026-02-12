import type { CollectionConfig } from 'payload';

export const AgentSessions: CollectionConfig = {
  slug: 'agent-sessions',
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'domain',
      type: 'select',
      required: true,
      options: [
        { label: 'Forge', value: 'forge' },
        { label: 'Video', value: 'video' },
      ],
    },
    {
      name: 'docId',
      type: 'text',
    },
    {
      name: 'summary',
      type: 'textarea',
    },
    {
      name: 'events',
      type: 'json',
    },
  ],
};

