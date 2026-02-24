import type { CollectionConfig } from 'payload';

export const RepoProposals: CollectionConfig = {
  slug: 'repo-proposals',
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'proposalId',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'assistantTarget',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'loopId',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'domain',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'scopeRoots',
      type: 'json',
    },
    {
      name: 'scopeOverrideToken',
      type: 'text',
    },
    {
      name: 'threadId',
      type: 'text',
    },
    {
      name: 'turnId',
      type: 'text',
    },
    {
      name: 'kind',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'summary',
      type: 'textarea',
      required: true,
    },
    {
      name: 'files',
      type: 'json',
    },
    {
      name: 'diff',
      type: 'textarea',
    },
    {
      name: 'metadata',
      type: 'json',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Applied', value: 'applied' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Failed', value: 'failed' },
      ],
      defaultValue: 'pending',
    },
    {
      name: 'approvalToken',
      type: 'text',
      index: true,
    },
    {
      name: 'createdAtIso',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'resolvedAt',
      type: 'date',
    },
  ],
};


