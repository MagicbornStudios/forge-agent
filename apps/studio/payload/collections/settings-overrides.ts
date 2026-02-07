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
        { label: 'Editor', value: 'editor' },
        { label: 'Viewport', value: 'viewport' },
      ],
    },
    {
      name: 'scopeId',
      type: 'text',
      admin: {
        description: 'Null for app; editorId for editor; editorId:viewportId for viewport.',
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
  ],
};
