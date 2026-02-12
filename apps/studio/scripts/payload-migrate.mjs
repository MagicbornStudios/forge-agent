#!/usr/bin/env node

import path from 'node:path';
import process from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { sqliteAdapter } from '@payloadcms/db-sqlite';
import { lexicalEditor } from '@payloadcms/richtext-lexical';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const studioRoot = path.resolve(dirname, '..');
const repoRoot = path.resolve(dirname, '..', '..', '..');
const migrateModulePath = path.resolve(repoRoot, 'node_modules/payload/dist/bin/migrate.js');
const migrationsDir = path.resolve(studioRoot, 'migrations');

/**
 * Tiny argv parser compatible with Payload's migrate handler shape.
 * Returns `{ _: [...positional], key: value|true }`.
 * @param {string[]} argv
 */
function parseArgs(argv) {
  /** @type {Record<string, string | boolean | string[]>} */
  const parsed = { _: [] };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) {
      parsed._.push(token);
      continue;
    }

    const key = token.slice(2);
    if (!key) continue;

    const next = argv[i + 1];
    if (next != null && !next.startsWith('--')) {
      parsed[key] = next;
      i += 1;
      continue;
    }
    parsed[key] = true;
  }

  return parsed;
}

async function loadCollections() {
  const collectionsPath = path.resolve(studioRoot, 'payload/collections/index.ts');
  const collectionsModule = await import(pathToFileURL(collectionsPath).href);
  if (!Array.isArray(collectionsModule.collections)) {
    throw new Error('Unable to load Payload collections for migrations.');
  }
  return collectionsModule.collections;
}

function resolveDatabaseAdapter() {
  const configuredDatabaseUri = process.env.DATABASE_URI?.trim() ?? '';
  const usesPostgres = /^postgres(ql)?:\/\//i.test(configuredDatabaseUri);

  if (usesPostgres) {
    return postgresAdapter({
      migrationDir: migrationsDir,
      pool: {
        connectionString: configuredDatabaseUri,
      },
    });
  }

  return sqliteAdapter({
    client: {
      url: configuredDatabaseUri || 'file:./data/payload.db',
    },
  });
}

async function buildPayloadConfig() {
  const collections = await loadCollections();
  return buildConfig({
    admin: {
      user: 'users',
      route: '/payload',
    },
    collections,
    editor: lexicalEditor({}),
    secret: process.env.PAYLOAD_SECRET || 'dev-secret-change-me',
    db: resolveDatabaseAdapter(),
  });
}

async function main() {
  const parsedArgs = parseArgs(process.argv.slice(2));
  const command = typeof parsedArgs._[0] === 'string' ? parsedArgs._[0] : '';
  if (!command.startsWith('migrate')) {
    console.error('[payload-migrate] Expected a migrate command (for example: migrate, migrate:create).');
    process.exit(1);
  }

  const configuredDatabaseUri = process.env.DATABASE_URI?.trim() ?? '';
  const usesPostgres = /^postgres(ql)?:\/\//i.test(configuredDatabaseUri);
  if (!usesPostgres) {
    if (command === 'migrate') {
      console.log(
        '[payload-migrate] DATABASE_URI is not a postgres URI. Skipping migrations for local sqlite runtime.',
      );
      process.exit(0);
    }

    throw new Error(
      'DATABASE_URI must be a postgres:// or postgresql:// URL for migration commands other than `migrate`.',
    );
  }

  const config = await buildPayloadConfig();
  const migrateModule = await import(pathToFileURL(migrateModulePath).toString());
  const migrateFn = migrateModule?.migrate;
  if (typeof migrateFn !== 'function') {
    throw new Error('Unable to load Payload migrate function from payload/dist/bin/migrate.js.');
  }

  await migrateFn({
    config,
    parsedArgs,
  });

  process.exit(0);
}

main().catch((error) => {
  console.error('[payload-migrate] unhandled error:', error);
  process.exit(1);
});
