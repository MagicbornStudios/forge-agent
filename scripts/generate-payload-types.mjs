import path from 'node:path';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const repoRoot = path.resolve(dirname, '..');
const studioRoot = path.resolve(repoRoot, 'apps/studio');
const studioRequire = createRequire(path.resolve(studioRoot, 'package.json'));

const importFromStudio = async (specifier) => {
  const resolved = studioRequire.resolve(specifier);
  return import(pathToFileURL(resolved).href);
};

const resolvePackageRootFromEntry = (specifier) => {
  const entryPath = studioRequire.resolve(specifier);
  let currentDir = path.dirname(entryPath);
  const filesystemRoot = path.parse(currentDir).root;
  while (currentDir && currentDir !== filesystemRoot) {
    if (fs.existsSync(path.join(currentDir, 'package.json'))) {
      return currentDir;
    }
    currentDir = path.dirname(currentDir);
  }
  throw new Error(`Unable to resolve package root for "${specifier}" from ${entryPath}`);
};

const [{ buildConfig }, { lexicalEditor }] = await Promise.all([
  importFromStudio('payload'),
  importFromStudio('@payloadcms/richtext-lexical'),
]);

const payloadPackageDir = resolvePackageRootFromEntry('payload');
const generateTypesModule = await import(
  pathToFileURL(path.resolve(payloadPackageDir, 'dist/bin/generateTypes.js')).href,
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

let dbAdapter;
if (usesPostgres) {
  const { postgresAdapter } = await importFromStudio('@payloadcms/db-postgres');
  dbAdapter = postgresAdapter({
    migrationDir: migrationsDir,
    pool: {
      connectionString: configuredDatabaseUri,
    },
  });
} else {
  const { sqliteAdapter } = await importFromStudio('@payloadcms/db-sqlite');
  dbAdapter = sqliteAdapter({
    client: {
      url: configuredDatabaseUri || 'file:./data/payload.db',
    },
  });
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
  db: dbAdapter,
});

if (!config.typescript) {
  config.typescript = {};
}
config.typescript.outputFile = path.resolve(repoRoot, 'packages/types/src/payload-types.ts');

await generateTypes(config, { log: true });
