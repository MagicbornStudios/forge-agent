import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { sqliteAdapter } from '@payloadcms/db-sqlite';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import path from 'path';
import fs from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import { collections } from './payload/collections/index.ts';
import { seedStudio } from './payload/seed.ts';
import { activatePromotion } from './payload/tasks/activatePromotion.ts';
import { deactivatePromotion } from './payload/tasks/deactivatePromotion.ts';
import { getAllowedCorsOrigins } from './lib/server/cors.ts';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const migrationsDir = path.join(dirname, 'migrations');

// Resolve DB path relative to this config so it works regardless of cwd (e.g. pnpm dev from repo root).
const dataDir = path.join(dirname, 'data');
const defaultDbPath = path.join(dataDir, 'payload.db');

const configuredDatabaseUri = process.env.DATABASE_URI?.trim() ?? '';
const usesPostgres = /^postgres(ql)?:\/\//i.test(configuredDatabaseUri);

if (!usesPostgres) {
  try {
    fs.mkdirSync(dataDir, { recursive: true });
  } catch {
    // Ignore; adapter will fail with a clear error if dir is missing
  }
}

const allowedCorsOrigins = getAllowedCorsOrigins();
const shouldRunSeedOnInit =
  process.env.NODE_ENV === 'development' && process.env.VERCEL !== '1' && process.env.CI !== 'true';

const dbAdapter = usesPostgres
  ? postgresAdapter({
      migrationDir: migrationsDir,
      pool: {
        connectionString: configuredDatabaseUri,
      },
    })
  : sqliteAdapter({
      client: {
        url: configuredDatabaseUri || pathToFileURL(defaultDbPath).href,
      },
    });

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
    if (shouldRunSeedOnInit) {
      await seedStudio(payload);
      return;
    }

    payload.logger.info('[Seed] Skipped seed bootstrap outside local development runtime.');
  },
  editor: lexicalEditor({}),
  cors: allowedCorsOrigins,
  csrf: allowedCorsOrigins,
  secret: process.env.PAYLOAD_SECRET || 'dev-secret-change-me',
  typescript: {
    outputFile: path.resolve(dirname, '../../packages/types/src/payload-types.ts'),
  },
  // DATABASE_URI: postgres:// or postgresql:// -> Postgres adapter, otherwise sqlite local fallback.
  db: dbAdapter,
});
