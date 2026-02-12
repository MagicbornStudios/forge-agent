import type { CollectionConfig } from 'payload';
import {
  isAdminUser,
  organizationScopedAccess,
  requireAuthenticated,
} from '../access/authorization.ts';

type UserWithPlan = { id: number; plan?: string | null };

function ensurePlatformCapabilities({
  data,
  req,
}: {
  data: Record<string, unknown>;
  req: { user?: UserWithPlan | null };
}): void {
  const user = req?.user;
  const plan = user?.plan ?? 'free';
  const isPro = plan === 'pro';

  if (data.status === 'published' && !isPro) {
    throw new Error('Publishing listings requires a Pro plan. Upgrade to publish to the catalog.');
  }
  const price = typeof data.price === 'number' ? data.price : Number(data.price);
  if (!Number.isNaN(price) && price > 0 && !isPro) {
    throw new Error('Paid listings require a Pro plan. Upgrade to set a price.');
  }
}

export const Listings: CollectionConfig = {
  slug: 'listings',
  access: {
    read: async ({ req }) => {
      if (!req.user) {
        return {
          status: {
            equals: 'published',
          },
        };
      }
      if (isAdminUser(req)) return true;
      const scoped = await organizationScopedAccess(
        { req },
        { ownerField: 'creator', organizationField: 'organization' },
      );
      if (scoped === false) {
        return {
          status: {
            equals: 'published',
          },
        };
      }
      return {
        or: [
          {
            status: {
              equals: 'published',
            },
          },
          scoped,
        ],
      };
    },
    create: requireAuthenticated,
    update: ({ req }) =>
      organizationScopedAccess(
        { req },
        { ownerField: 'creator', organizationField: 'organization' },
      ),
    delete: ({ req }) =>
      organizationScopedAccess(
        { req },
        { ownerField: 'creator', organizationField: 'organization' },
      ),
  },
  hooks: {
    beforeChange: [
      ({ data, req }) => {
        if (req?.user && data) {
          const requestUser = req.user as { id?: unknown; defaultOrganization?: unknown };
          const nextData = { ...(data as Record<string, unknown>) };
          ensurePlatformCapabilities({ data: nextData, req });

          if (nextData.creator == null && typeof requestUser.id === 'number') {
            nextData.creator = requestUser.id;
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
        }
        return data as Record<string, unknown>;
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
      name: 'playUrl',
      type: 'text',
      admin: { description: 'Optional playable build URL for this listing' },
    },
    {
      name: 'listingType',
      type: 'select',
      required: true,
      options: [
        { label: 'Project', value: 'project' },
        { label: 'Template', value: 'template' },
        { label: 'Strategy core', value: 'strategy-core' },
      ],
    },
    {
      name: 'project',
      type: 'relationship',
      relationTo: 'projects',
      admin: { description: 'Optional — for project or template listings' },
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: { description: 'Price in cents, or 0 for free' },
    },
    {
      name: 'currency',
      type: 'text',
      defaultValue: 'USD',
    },
    {
      name: 'creator',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'organization',
      type: 'relationship',
      relationTo: 'organizations',
      admin: {
        description: 'Owning organization for this listing (optional during migration).',
      },
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Card image for catalog' },
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Narrative', value: 'narrative' },
        { label: 'Character', value: 'character' },
        { label: 'Template', value: 'template' },
        { label: 'Strategy', value: 'strategy' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
    },
    {
      name: 'cloneMode',
      type: 'select',
      required: true,
      defaultValue: 'indefinite',
      options: [
        { label: 'Indefinite (always current)', value: 'indefinite' },
        { label: 'That version only', value: 'version-only' },
      ],
      admin: { description: 'Clone again: indefinite = current project; version-only = snapshot at purchase' },
    },
  ],
};

