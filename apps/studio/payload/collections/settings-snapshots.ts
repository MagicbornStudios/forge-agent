import type { CollectionConfig } from 'payload';

export const SettingsSnapshots: CollectionConfig = {
  slug: 'settings-snapshots',
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'scope',
      type: 'select',
      required: true,
      options: [
        { label: 'App', value: 'app' },
        { label: 'Workspace', value: 'workspace' },
        { label: 'Editor', value: 'editor' },
      ],
    },
    {
      name: 'scopeId',
      type: 'text',
    },
    {
      name: 'settings',
      type: 'json',
      required: true,
    },
    {
      name: 'label',
      type: 'text',
    },
  ],
};
