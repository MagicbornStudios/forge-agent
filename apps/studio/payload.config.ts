import { buildConfig } from 'payload';
import { sqliteAdapter } from '@payloadcms/db-sqlite';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import path from 'path';
import fs from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import { collections } from './payload/collections/index.ts';
import { seedStudio } from './payload/seed.ts';
import { activatePromotion } from './payload/tasks/activatePromotion.ts';
import { deactivatePromotion } from './payload/tasks/deactivatePromotion.ts';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// Resolve DB path relative to this config so it works regardless of cwd (e.g. pnpm dev from repo root).
const dataDir = path.join(dirname, 'data');
const defaultDbPath = path.join(dataDir, 'payload.db');
if (!process.env.DATABASE_URI) {
  try {
    fs.mkdirSync(dataDir, { recursive: true });
  } catch {
    // Ignore; adapter will fail with a clear error if dir is missing
  }
}

export default buildConfig({
  admin: {
    user: 'users',
  },
  collections,
  jobs: {
    tasks: [
      {
        slug: 'activatePromotion',
        handler: activatePromotion,
      },
      {
        slug: 'deactivatePromotion',
        handler: deactivatePromotion,
      },
    ],
  },
  onInit: async (payload) => {
    await seedStudio(payload);
  },
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || 'dev-secret-change-me',
  typescript: {
    outputFile: path.resolve(dirname, '../../packages/types/src/payload-types.ts'),
  },
  // DATABASE_URI: set in .env (not just .env.example). If unset, we use apps/studio/data/payload.db.
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || pathToFileURL(defaultDbPath).href,
    },
  }),
});
