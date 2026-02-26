import type { CollectionConfig } from 'payload';

export const RepoIntegrations: CollectionConfig = {
  slug: 'repo-integrations',
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  admin: {
    useAsTitle: 'provider',
  },
  fields: [
    {
      name: 'provider',
      type: 'select',
      required: true,
      unique: true,
      options: [
        { label: 'GitHub', value: 'github' },
      ],
      index: true,
    },
    {
      name: 'tokenCipher',
      type: 'textarea',
      required: true,
    },
    {
      name: 'refreshTokenCipher',
      type: 'textarea',
    },
    {
      name: 'expiresAtIso',
      type: 'text',
    },
    {
      name: 'username',
      type: 'text',
      index: true,
    },
    {
      name: 'host',
      type: 'text',
      defaultValue: 'github.com',
    },
    {
      name: 'scopes',
      type: 'json',
    },
    {
      name: 'authType',
      type: 'text',
      defaultValue: 'oauth-device',
    },
  ],
};
