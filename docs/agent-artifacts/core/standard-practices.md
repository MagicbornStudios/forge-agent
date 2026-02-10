---
title: Standard practices (now / soon / as we grow)
created: 2026-02-09
updated: 2026-02-10
---

# Standard practices (now / soon / as we grow)

Single checklist for agents and humans. Where things live and when to revisit.

## Logging

- **Now:** Env-driven structured logging in Studio (pino); `LOG_LEVEL`, `LOG_FILE`, optional `LOG_NAMESPACES`. See [apps/studio/lib/logger.ts](../../../apps/studio/lib/logger.ts) and [apps/studio/.env.example](../../../apps/studio/.env.example). Client logs can be appended to the same file in dev via `POST /api/dev/log` when `ALLOW_CLIENT_LOG=1` and `NEXT_PUBLIC_LOG_TO_SERVER=1`.
- **Revisit:** When adding new server routes or model-router code, use `getLogger('namespace')`; no ad-hoc `console.log` (see errors-and-attempts).

## Env and config

- **Now:** Keep `.env.example` in sync with required/optional vars. Validate critical env at app init where it helps (e.g. `OPENROUTER_API_KEY` for Studio AI routes). See errors-and-attempts for env gotchas.
- **Revisit:** When adding a new required env var, document in .env.example and consider startup check.

## Health and ops

- **Now:** `GET /api/health` in Studio returns 200 when the app is up (optional: check DB or critical deps later for load balancers/scripts).
- **Revisit:** Add DB/Redis checks to health when we rely on them for readiness.

## Docs (MDX build)

- **Now:** All `.md` and `.mdx` under `docs/` are built by fumadocs-mdx and **must** have YAML frontmatter with at least **`title`** (string). When creating or moving a doc into `docs/`, add frontmatter; optional `created` / `updated`. See [errors-and-attempts](errors-and-attempts.md) (MDX build error) if the build fails with "invalid frontmatter".
- **Now:** Every change requires a **doc scan**: check relevant docs for drift (design/architecture/how-to/agent artifacts) and update them alongside the code change. Record the doc scan in STATUS.
- **Revisit:** When adding a new doc tree or changing how docs are loaded (e.g. source.config.mjs).

## Constants, enums, and DRY

- **Single source of truth:** Fixed sets (editor ids, API path segments, capability ids, query key namespaces) are defined once and imported elsewhere. No magic strings for these.
- **Enums:** Prefer `as const` object + derived type (e.g. `FORGE_NODE_TYPE`, `CAPABILITIES` in packages/types and packages/shared). Use TypeScript `enum` only when reverse mapping or exhaustiveness is needed.
- **Editor IDs:** Defined in app-shell ([apps/studio/lib/app-shell/store.ts](../../../apps/studio/lib/app-shell/store.ts)); new editors extend the canonical `EDITOR_IDS` and metadata (labels, viewport ids in editor-metadata.ts).
- **API routes:** Studio custom routes are listed in [apps/studio/lib/api-client/routes.ts](../../../apps/studio/lib/api-client/routes.ts); client code (services, fetch) imports path constants from there.
- **Query keys:** Use [apps/studio/lib/data/keys.ts](../../../apps/studio/lib/data/keys.ts) only; no ad-hoc `['studio', ...]` in hooks or components. For broad invalidation use the provided key helpers (e.g. `studioKeys.charactersAll()`, `studioKeys.relationshipsAll()`).
- **When adding a new API route:** Add the path to the routes module and use it in the client.
- **Storage keys:** App-session and draft persistence keys live as named constants in the respective store files (app-shell store, forge/video/character domain stores). Any new persisted key should be a named constant in one place; no magic strings for storage keys.

## Security and resilience (soon)

- Rate limiting on public endpoints (e.g. waitlist, newsletter, checkout).
- Security headers via Next.js config.
- CORS if we add cross-origin clients.
- **Revisit:** Before opening new public API surfaces.

## As we grow

- Request/trace IDs for correlation (middleware that sets `x-request-id` and logs it).
- OpenTelemetry for distributed tracing.
- Dependency audit in CI (e.g. `pnpm audit`).
- Error boundaries and global error reporting.
- Performance budgets for critical paths.
- **Revisit:** When scaling or adding more services.
