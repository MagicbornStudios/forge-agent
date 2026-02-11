import type { CollectionConfig } from 'payload';

export const Projects: CollectionConfig = {
  slug: 'projects',
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  hooks: {
    beforeChange: [
      ({ data, req }) => {
        if (!data || !req?.user) return data;
        const requestUser = req.user as { id?: unknown; defaultOrganization?: unknown };
        const nextData = { ...data } as Record<string, unknown>;
        if (nextData.owner == null && typeof requestUser.id === 'number') {
          nextData.owner = requestUser.id;
        }
        if (nextData.organization == null && requestUser.defaultOrganization != null) {
          nextData.organization =
            typeof requestUser.defaultOrganization === 'object' &&
            requestUser.defaultOrganization != null &&
            'id' in requestUser.defaultOrganization
              ? (requestUser.defaultOrganization as { id: number }).id
              : requestUser.defaultOrganization;
        }
        return nextData;
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'domain',
      type: 'select',
      required: true,
      defaultValue: 'forge',
      options: [
        { label: 'Forge', value: 'forge' },
        { label: 'Video', value: 'video' },
        { label: 'Character', value: 'character' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Archived', value: 'archived' },
      ],
    },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'organization',
      type: 'relationship',
      relationTo: 'organizations',
      admin: {
        description: 'Owning organization for creator dashboards (optional during migration).',
      },
    },
    {
      name: 'forgeGraph',
      type: 'relationship',
      relationTo: 'forge-graphs',
    },
  ],
};
