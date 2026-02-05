import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { tsImport } from 'tsx/esm/api';
import { buildConfig } from 'payload';
import { sqliteAdapter } from '@payloadcms/db-sqlite';
import { lexicalEditor } from '@payloadcms/richtext-lexical';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const repoRoot = path.resolve(dirname, '..');
const rootUrl = pathToFileURL(repoRoot + '/').toString();

const generateTypesModule = await import(
  pathToFileURL(path.resolve(repoRoot, 'node_modules/payload/dist/bin/generateTypes.js')).toString(),
);
const { generateTypes } = generateTypesModule;

const collectionsModule = await tsImport('./apps/studio/payload/collections/index.ts', rootUrl);
const collections = collectionsModule.default?.collections ?? collectionsModule.collections;

if (!Array.isArray(collections)) {
  throw new Error('Unable to load Payload collections for type generation.');
}

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
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || 'file:./data/payload.db',
    },
  }),
});

if (!config.typescript) {
  config.typescript = {};
}
config.typescript.outputFile = path.resolve(repoRoot, 'packages/types/src/payload-types.ts');

await generateTypes(config, { log: true });
