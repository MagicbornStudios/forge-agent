import type { CollectionConfig } from 'payload';
import {
  organizationScopedAccess,
  requireAuthenticated,
} from '../access/authorization.ts';
import type { Where } from 'payload';

function organizationOwnerAccess({ req }: { req: { user?: { id?: unknown } | null } }): boolean | Where {
  if (!req.user || typeof req.user.id !== 'number') return false;
  if ((req.user as { role?: unknown }).role === 'admin') return true;
  return {
    owner: {
      equals: req.user.id,
    },
  } as unknown as Where;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const Organizations: CollectionConfig = {
  slug: 'organizations',
  access: {
    read: ({ req }) =>
      organizationScopedAccess(
        { req },
        { ownerField: 'owner', organizationField: 'id' },
      ),
    create: requireAuthenticated,
    update: organizationOwnerAccess,
    delete: organizationOwnerAccess,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) return data;
        if (typeof data.slug !== 'string' || data.slug.trim().length === 0) {
          const name = typeof data.name === 'string' ? data.name : '';
          if (name.trim().length > 0) {
            return {
              ...data,
              slug: slugify(name),
            };
          }
        }
        return data;
      },
    ],
  },
  fields: [
    {
      name: 'name',
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
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'stripeConnectAccountId',
      type: 'text',
      admin: { description: 'Stripe Connect Express account id (acct_xxx)' },
    },
    {
      name: 'stripeConnectOnboardingComplete',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'planTier',
      type: 'select',
      required: true,
      defaultValue: 'free',
      options: [
        { label: 'Free', value: 'free' },
        { label: 'Pro', value: 'pro' },
        { label: 'Enterprise', value: 'enterprise' },
      ],
    },
    {
      name: 'storageQuotaBytes',
      type: 'number',
      required: true,
      defaultValue: 5 * 1024 * 1024 * 1024,
      admin: {
        description: 'Total storage quota in bytes for this organization.',
      },
    },
    {
      name: 'storageUsedBytes',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: {
        description: 'Current measured storage usage in bytes.',
      },
    },
    {
      name: 'storageWarningThresholdPercent',
      type: 'number',
      required: true,
      defaultValue: 80,
      admin: {
        description: 'Warning threshold percentage for storage usage alerts.',
      },
    },
    {
      name: 'enterpriseSourceAccess',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'enterprisePremiumSupport',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'enterpriseCustomEditors',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'stripeCustomerId',
      type: 'text',
      admin: {
        description: 'Stripe customer id for storage/billing add-ons.',
      },
    },
    {
      name: 'lastStorageUpgradeSessionId',
      type: 'text',
      admin: {
        description: 'Last processed storage checkout session for idempotency.',
      },
    },
  ],
};

