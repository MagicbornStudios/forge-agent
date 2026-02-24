import type { CollectionConfig } from 'payload';

/**
 * Minimal agent-session store for companion mode: when Open Router + LangGraph runs in Repo Studio,
 * checkpoints are persisted here. No user/project required so companion apps can write without Payload user auth.
 * Keyed by sessionKey (unique) and threadId for lookup.
 */
export const RepoAgentSessions: CollectionConfig = {
  slug: 'repo-agent-sessions',
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  admin: {
    useAsTitle: 'sessionKey',
    description: 'Durable LangGraph checkpoints when Repo Studio is used as AI runtime (companion mode).',
  },
  fields: [
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
      name: 'editor',
      type: 'select',
      options: [
        { label: 'Dialogue', value: 'dialogue' },
        { label: 'Character', value: 'character' },
        { label: 'Loop', value: 'loop' },
        { label: 'App', value: 'app' },
      ],
      index: true,
    },
    {
      name: 'domain',
      type: 'text',
      admin: { description: 'Optional domain (e.g. forge, character).' },
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
