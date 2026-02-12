import type { CollectionConfig } from 'payload';
import { lexicalEditor } from '@payloadcms/richtext-lexical';

export const Promotions: CollectionConfig = {
  slug: 'promotions',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  hooks: {
    afterChange: [
      async ({ doc, req }) => {
        const jobs = (req.payload as { jobs?: { queue: (args: unknown) => Promise<unknown> } }).jobs;
        if (!jobs?.queue) return;
        const id = doc.id as number;
        const startsAt = doc.startsAt ? new Date(doc.startsAt as string) : null;
        const endsAt = doc.endsAt ? new Date(doc.endsAt as string) : null;
        const now = new Date();
        if (startsAt && startsAt > now) {
          await jobs.queue({
            task: 'activatePromotion',
            input: { promotionId: id },
            waitUntil: startsAt,
          });
        }
        if (endsAt && endsAt > now) {
          await jobs.queue({
            task: 'deactivatePromotion',
            input: { promotionId: id },
            waitUntil: endsAt,
          });
        }
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
      name: 'body',
      type: 'richText',
      editor: lexicalEditor({}),
    },
    {
      name: 'active',
      type: 'checkbox',
      required: true,
      defaultValue: false,
    },
    {
      name: 'startsAt',
      type: 'date',
    },
    {
      name: 'endsAt',
      type: 'date',
    },
    {
      name: 'ctaUrl',
      type: 'text',
    },
  ],
};

