import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildConfig } from 'payload';
import { sqliteAdapter } from '@payloadcms/db-sqlite';
import { RepoBlocks } from './payload/collections/repo-blocks';
import { RepoPages } from './payload/collections/repo-pages';
import { RepoProposals } from './payload/collections/repo-proposals';
import { RepoAgentSessions } from './payload/collections/repo-agent-sessions';
import { RepoSettingsOverrides } from './payload/collections/repo-settings-overrides';
import {
  ensureSqliteParentDir,
  resolveRepoStudioSqlite,
} from '../../packages/repo-studio/src/core/runtime/sqlite-paths.mjs';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const configuredDatabaseUri = String(process.env.REPO_STUDIO_DATABASE_URI || '').trim();
const runtime = process.env.REPO_STUDIO_DESKTOP === '1' ? 'desktop' : 'web';
const sqlite = resolveRepoStudioSqlite({
  runtime,
  workspaceRoot: path.resolve(dirname, '..', '..'),
  explicitDatabaseUri: configuredDatabaseUri,
});

try {
  if (sqlite.databasePath) {
    ensureSqliteParentDir(sqlite.databasePath);
  } else {
    const fallbackDataDir = path.join(dirname, 'data');
    fs.mkdirSync(fallbackDataDir, { recursive: true });
  }
} catch {
  // sqlite adapter will surface a clear error if this path is unusable.
}

const sqliteUrl = sqlite.databaseUri;

export default buildConfig({
  collections: [RepoSettingsOverrides, RepoPages, RepoBlocks, RepoProposals, RepoAgentSessions],
  secret: process.env.REPO_STUDIO_PAYLOAD_SECRET || process.env.PAYLOAD_SECRET || 'repo-studio-secret-change-me',
  db: sqliteAdapter({
    client: {
      url: sqliteUrl,
    },
  }),
});
