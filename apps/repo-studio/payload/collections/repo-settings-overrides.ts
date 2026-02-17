import type { CollectionConfig } from 'payload';

export const RepoSettingsOverrides: CollectionConfig = {
  slug: 'repo-settings-overrides',
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
        { label: 'Local', value: 'local' },
      ],
    },
    {
      name: 'scopeId',
      type: 'text',
      admin: {
        description: 'Optional scope discriminator. e.g. workspace id or local profile id.',
      },
    },
    {
      name: 'settings',
      type: 'json',
      required: true,
      admin: {
        description: 'Nested settings object for this scope.',
      },
    },
  ],
};

