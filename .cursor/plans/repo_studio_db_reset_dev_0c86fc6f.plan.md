# Repo Studio: Dev DB reset and avoid Payload column-rename prompts

## Context

- **Payload** owns the Repo Studio SQLite schema (collections in `apps/repo-studio/payload/collections/`). Same DB path as Drizzle (`drizzle.config.ts` uses `REPO_STUDIO_DATABASE_URI` or `file:./data/repo-studio.db`).
- **Drizzle** is used for introspection (`pnpm db:pull` → `drizzle/schema.ts`) and **Drizzle Studio** (DB UI), which is part of Repo Studio: when you open the repo-studio workspace, Drizzle Studio should be running (start it if it isn’t).
- The interactive prompt **"Is assistant_target column created or renamed from another column?"** comes from **Payload CMS** (collections in dev mode), not from Drizzle. When you rename a Payload field (e.g. `editor_target` → `assistant_target`), Payload sees the diff and prompts. We do not want persistent dev data or that prompt.

## Goal

1. **No persistent dev data** – allow wiping the DB when schema/renames change so Payload recreates tables and never sees "old vs new" column.
2. **Avoid Payload’s interactive prompt** – wipe-and-recreate in dev so Payload never has to ask "create or rename?"
3. **Drizzle Studio stays part of Repo Studio** – when opening the workspace, if it isn’t running it should start (e.g. via dev script or workspace task). Fine if it’s not started by default in the single-command sense, but when we’re in repo-studio we should have it available and start it if not running.
4. **Document in the loop** and agent artifacts.

---

## Options (revised)

- **Option B (dev-only DB path):** No.
- **Option C (document-only, no script):** No.
- **Option D (remove Drizzle Studio from dev):** No – Drizzle Studio is part of Repo Studio; when we open the workspace it should start if not running.

---

## Chosen approach: Option A + Drizzle Studio behavior

### 1. Reset script + docs (Option A)

- Add **`db:reset-dev`** that deletes the Repo Studio SQLite file (same resolution as `payload.config.ts`: `resolveRepoStudioSqlite` in `packages/repo-studio/src/core/runtime/sqlite-paths.mjs`). Web default: `apps/repo-studio/data/repo-studio.db`; respect `REPO_STUDIO_DATABASE_URI` if set.
- Steps: resolve DB path, delete file if present, log path and: "Restart dev so Payload recreates tables; then run pnpm db:pull to refresh Drizzle schema."
- **Docs:** In `docs/agent-artifacts/core/decisions.md` add ADR: Repo Studio dev DB – Payload owns schema; for collection/field renames run `pnpm db:reset-dev`, restart dev, then `pnpm db:pull` if using Drizzle Studio. In `errors-and-attempts.md`: the "assistant_target / create or rename?" prompt is **from Payload** (collections dev mode); fix is reset dev DB, restart, then db:pull.

### 2. Drizzle Studio as part of Repo Studio

- Keep Drizzle Studio as part of the Repo Studio experience. When opening the repo-studio workspace, if Drizzle Studio isn’t running, it should be started (e.g. `pnpm dev` runs both Next and `drizzle-kit studio`, or a workspace task / documented second terminal so "open workspace" flow starts it if not running).
- No removal of Drizzle Studio from dev; ensure the chosen dev/workspace flow starts it when we’re in repo-studio (e.g. concurrent dev script is acceptable).

---

## Implementation summary

1. **Script** – Add `scripts/reset-dev-db.mjs`: resolve DB path (same as Payload), delete file if present, log path and next steps. Add `"db:reset-dev": "node scripts/reset-dev-db.mjs"` in `apps/repo-studio/package.json`.
2. **Docs** – decisions.md: ADR "Repo Studio dev DB: wipe on schema change (db:reset-dev), Payload rebuilds, Drizzle pull-only." errors-and-attempts.md: entry that the "create or rename?" prompt is **Payload** (collections dev mode); run `db:reset-dev`, restart dev, `db:pull`.
3. **Drizzle Studio** – Keep current or desired behavior so that when opening the repo-studio workspace, Drizzle Studio runs if not running (e.g. keep `concurrently` in dev or add workspace task; do not remove it from the dev experience).
4. **Loop** – Note in .planning (STATE or similar) that Repo Studio dev DB is ephemeral for schema work; reset when renaming columns; prompt is Payload, not Drizzle.
