import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { sqliteAdapter } from '@payloadcms/db-sqlite';
import { lexicalEditor } from '@payloadcms/richtext-lexical';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const repoRoot = path.resolve(dirname, '..');

const generateTypesModule = await import(
  pathToFileURL(path.resolve(repoRoot, 'node_modules/payload/dist/bin/generateTypes.js')).toString(),
);
const { generateTypes } = generateTypesModule;

// Dynamic import so the collections graph (which pulls in Lexical with TLA) loads async
const collectionsPath = path.resolve(repoRoot, 'apps/studio/payload/collections/index.ts');
const collectionsModule = await import(pathToFileURL(collectionsPath).href);
const collections = collectionsModule.collections;

if (!Array.isArray(collections)) {
  throw new Error('Unable to load Payload collections for type generation.');
}

const configuredDatabaseUri = process.env.DATABASE_URI?.trim() ?? '';
const usesPostgres = /^postgres(ql)?:\/\//i.test(configuredDatabaseUri);
const migrationsDir = path.resolve(repoRoot, 'apps/studio/migrations');

const dbAdapter = usesPostgres
  ? postgresAdapter({
      migrationDir: migrationsDir,
      pool: {
        connectionString: configuredDatabaseUri,
      },
    })
  : sqliteAdapter({
      client: {
        url: configuredDatabaseUri || 'file:./data/payload.db',
      },
    });

const config = await buildConfig({
  admin: {
    user: 'users',
    route: '/payload',
  },
  collections,
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || 'dev-secret-change-me',
  typescript: {
    outputFile: path.resolve(repoRoot, 'packages/types/src/payload-types.ts'),
  },
  db: dbAdapter,
});

if (!config.typescript) {
  config.typescript = {};
}
config.typescript.outputFile = path.resolve(repoRoot, 'packages/types/src/payload-types.ts');

await generateTypes(config, { log: true });
