#!/usr/bin/env node

/**
 * Deletes the Repo Studio SQLite DB file used in current context (same resolution as payload.config).
 * Used at dev start so Payload recreates tables from collection config and never prompts "create or rename?".
 * Standalone: pnpm db:reset-dev. Also run automatically before dev (pnpm dev).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  resolveRepoStudioSqlite,
} from '../../../packages/repo-studio/src/core/runtime/sqlite-paths.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');
const runtime = process.env.REPO_STUDIO_DESKTOP === '1' ? 'desktop' : 'web';
const sqlite = resolveRepoStudioSqlite({
  runtime,
  workspaceRoot: repoRoot,
  explicitDatabaseUri: String(process.env.REPO_STUDIO_DATABASE_URI || '').trim(),
});

function pathToDelete() {
  if (sqlite.databasePath) return sqlite.databasePath;
  if (sqlite.databaseUri && sqlite.databaseUri.startsWith('file:')) {
    return fileURLToPath(sqlite.databaseUri);
  }
  return null;
}

const toDelete = pathToDelete();
if (!toDelete) {
  console.log('[db:reset-dev] No file path to delete (explicit non-file URI or no path). Skip.');
  process.exit(0);
}

try {
  if (fs.existsSync(toDelete)) {
    fs.rmSync(toDelete, { force: true });
    console.log('[db:reset-dev] Deleted', toDelete);
  } else {
    console.log('[db:reset-dev] No file at', toDelete, '(already absent).');
  }
} catch (err) {
  console.error('[db:reset-dev] Failed to delete', toDelete, err?.message || err);
  process.exitCode = 1;
}
