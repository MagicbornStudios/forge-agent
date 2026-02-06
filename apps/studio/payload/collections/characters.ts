import type { CollectionConfig } from 'payload';

export const Characters: CollectionConfig = {
  slug: 'characters',
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'imageUrl',
      type: 'text',
      admin: {
        description:
          'URL to a character portrait (external or AI-generated). UI falls back to initials when empty.',
      },
    },
    {
      name: 'voiceId',
      type: 'text',
      admin: {
        description:
          'ElevenLabs voice ID for this character; used for text-to-speech preview and generation.',
      },
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'project',
      type: 'relationship',
      relationTo: 'projects',
      required: true,
      index: true,
    },
    {
      name: 'meta',
      type: 'json',
      admin: {
        description: 'Extensible metadata (traits, tags, etc.).',
      },
    },
    {
      name: 'archivedAt',
      type: 'date',
    },
  ],
};
