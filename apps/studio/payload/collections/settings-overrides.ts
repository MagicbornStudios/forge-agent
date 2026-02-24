import type { CollectionConfig } from 'payload';

export const SettingsOverrides: CollectionConfig = {
  slug: 'settings-overrides',
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
        { label: 'Viewport', value: 'viewport' },
        { label: 'Project', value: 'project' },
      ],
    },
    {
      name: 'scopeId',
      type: 'text',
      admin: {
        description: 'Null for app; workspaceId for workspace; workspaceId:viewportId for viewport.',
      },
    },
    {
      name: 'settings',
      type: 'json',
      required: true,
      admin: {
        description: 'JSON object of overridden keys only.',
      },
    },
    {
      name: 'label',
      type: 'text',
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: false,
      admin: {
        description: 'When set, this override is owned by this user; null = global/legacy.',
      },
    },
  ],
};

