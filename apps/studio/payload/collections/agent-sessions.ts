import type { CollectionConfig, Where } from 'payload';
import { isAdminUser } from '../access/authorization.ts';

function asUserId(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  if (value && typeof value === 'object' && 'id' in value) {
    return asUserId((value as { id?: unknown }).id);
  }
  return null;
}

function selfOrAdminAccess({ req }: { req: { user?: unknown } }): boolean | Where {
  const userId = asUserId((req.user as { id?: unknown } | undefined)?.id);
  if (userId == null) return false;
  if (isAdminUser(req as never)) return true;
  return {
    user: {
      equals: userId,
    },
  } as unknown as Where;
}

export const AgentSessions: CollectionConfig = {
  slug: 'agent-sessions',
  admin: {
    useAsTitle: 'sessionKey',
    description: 'Durable LangGraph checkpoints keyed by user/editor/project.',
  },
  access: {
    read: selfOrAdminAccess,
    create: ({ req }) => asUserId((req.user as { id?: unknown } | undefined)?.id) != null,
    update: selfOrAdminAccess,
    delete: selfOrAdminAccess,
  },
  hooks: {
    beforeChange: [
      ({ data, req }) => {
        if (!data) return data;
        const requestUserId = asUserId((req.user as { id?: unknown } | undefined)?.id);
        if (requestUserId == null) return data;
        if (isAdminUser(req as never)) return data;

        return {
          ...data,
          user: requestUserId,
        };
      },
    ],
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
    },
    {
      name: 'project',
      type: 'relationship',
      relationTo: 'projects',
      required: true,
      index: true,
    },
    {
      name: 'editor',
      type: 'select',
      required: true,
      options: [
        { label: 'Dialogue', value: 'dialogue' },
        { label: 'Character', value: 'character' },
        { label: 'Writer', value: 'writer' },
        { label: 'App', value: 'app' },
      ],
      index: true,
    },
    {
      name: 'domain',
      type: 'select',
      required: true,
      options: [
        { label: 'Forge', value: 'forge' },
        { label: 'Character', value: 'character' },
        { label: 'Writer', value: 'writer' },
        { label: 'Video', value: 'video' },
        { label: 'App', value: 'app' },
      ],
      index: true,
    },
    {
      name: 'sessionKey',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'threadId',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'checkpoint',
      type: 'json',
    },
    {
      name: 'summary',
      type: 'textarea',
    },
    {
      name: 'events',
      type: 'json',
    },
    {
      name: 'messageCount',
      type: 'number',
      required: true,
      defaultValue: 0,
    },
    {
      name: 'lastModelId',
      type: 'text',
    },
  ],
};

