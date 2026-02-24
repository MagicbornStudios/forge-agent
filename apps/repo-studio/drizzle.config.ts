import { defineConfig } from 'drizzle-kit';

/**
 * Drizzle Kit config for Repo Studio's Payload SQLite database.
 * Same DB as payload.config.ts (REPO_STUDIO_DATABASE_URI or default ./data/repo-studio.db).
 * Drizzle Studio starts automatically with `pnpm dev`. If Payload collections change, run
 * `pnpm db:pull` to regenerate the schema (requires compatible drizzle-kit/drizzle-orm).
 */
const databaseUrl =
  process.env.REPO_STUDIO_DATABASE_URI?.trim() || 'file:./data/repo-studio.db';

export default defineConfig({
  dialect: 'sqlite',
  schema: './drizzle/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: databaseUrl,
  },
});
