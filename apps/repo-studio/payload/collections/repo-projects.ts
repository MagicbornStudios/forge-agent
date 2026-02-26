import type { CollectionConfig } from 'payload';

export const RepoProjects: CollectionConfig = {
  slug: 'repo-projects',
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
      name: 'projectId',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'rootPath',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'remoteUrl',
      type: 'text',
    },
    {
      name: 'provider',
      type: 'text',
    },
    {
      name: 'defaultBranch',
      type: 'text',
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: false,
      index: true,
    },
    {
      name: 'createdAtIso',
      type: 'text',
      index: true,
    },
  ],
};
