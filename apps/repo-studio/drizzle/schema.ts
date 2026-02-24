/**
 * Drizzle schema for Repo Studio SQLite DB.
 * Run `pnpm db:pull` to introspect the database and regenerate this file.
 */
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const _introspectPlaceholder = sqliteTable('_drizzle_introspect_placeholder', {
  id: text('id').primaryKey(),
});
