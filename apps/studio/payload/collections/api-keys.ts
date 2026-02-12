import type { CollectionConfig } from 'payload';

const AI_SCOPE_OPTIONS = [
  { label: 'All AI APIs', value: 'ai.*' },
  { label: 'Assistant Chat', value: 'ai.chat' },
  { label: 'Plan Generation', value: 'ai.plan' },
  { label: 'Structured Output', value: 'ai.structured' },
  { label: 'Image Generation', value: 'ai.image' },
] as const;

export const ApiKeys: CollectionConfig = {
  slug: 'api-keys',
  admin: {
    useAsTitle: 'name',
    description:
      'Programmatic API keys for customer AI usage. Secrets are hashed and only shown once at creation.',
  },
  access: {
    read: ({ req }) => {
      if (!req.user || typeof req.user.id !== 'number') return false;
      return {
        user: {
          equals: req.user.id,
        },
      };
    },
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      maxLength: 80,
    },
    {
      name: 'keyId',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Public key identifier embedded in the token for lookup.',
      },
    },
    {
      name: 'keyPrefix',
      type: 'text',
      required: true,
      admin: {
        description: 'Safe display prefix (never includes full secret).',
      },
    },
    {
      name: 'keyLast4',
      type: 'text',
      required: true,
      maxLength: 8,
    },
    {
      name: 'secretSalt',
      type: 'text',
      required: true,
      admin: {
        hidden: true,
      },
    },
    {
      name: 'secretHash',
      type: 'text',
      required: true,
      admin: {
        hidden: true,
      },
    },
    {
      name: 'scopes',
      type: 'select',
      hasMany: true,
      required: true,
      defaultValue: ['ai.*'],
      options: AI_SCOPE_OPTIONS as unknown as { label: string; value: string }[],
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'organization',
      type: 'relationship',
      relationTo: 'organizations',
      required: true,
    },
    {
      name: 'expiresAt',
      type: 'date',
      admin: {
        description: 'Optional key expiry. Expired keys are rejected.',
      },
    },
    {
      name: 'revokedAt',
      type: 'date',
    },
    {
      name: 'revokedReason',
      type: 'text',
      maxLength: 200,
    },
    {
      name: 'createdByIp',
      type: 'text',
      maxLength: 120,
    },
    {
      name: 'lastUsedAt',
      type: 'date',
    },
    {
      name: 'lastUsedIp',
      type: 'text',
      maxLength: 120,
    },
    {
      name: 'requestCount',
      type: 'number',
      required: true,
      defaultValue: 0,
    },
    {
      name: 'inputTokens',
      type: 'number',
      required: true,
      defaultValue: 0,
    },
    {
      name: 'outputTokens',
      type: 'number',
      required: true,
      defaultValue: 0,
    },
    {
      name: 'totalCostUsd',
      type: 'number',
      required: true,
      defaultValue: 0,
    },
  ],
};


