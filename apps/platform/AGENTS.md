# Platform App - Agent rules

## Purpose

`apps/platform` is the customer-facing SaaS surface (docs, catalog, dashboard, billing, API keys).
It is not an editor shell.

## Core boundaries

- Keep platform styles isolated to `apps/platform/src/styles/*`.
- Do not import Studio editor styles or editor layout primitives into platform.
- Browser code talks to Studio through `apps/platform/src/lib/api/*` only.
- Do not add raw `fetch` calls in components/hooks/stores; extend the API client.

## Data conventions

- Use TanStack Query for server state.
- Query keys must come from `apps/platform/src/lib/constants/query-keys.ts`.
- Invalidation must use query-key constants, not magic arrays.
- Org context is first-class: org-scoped queries and mutations should include `orgId` when applicable.

## Auth conventions

- Dashboard auth is handled once via the dashboard auth gate.
- Do not duplicate login redirect effects in every dashboard page.
- Login return-url uses route constants from `apps/platform/src/lib/constants/routes.ts`.

## UI conventions

- `@forge/ui` is the source of truth for shared atoms.
- Keep platform-only shells/components local (for example `infobar`, `frame`, layout-specific wrappers).
- Prefer adapter wrappers in `apps/platform/src/components/ui/*` over direct atom copies.
- Do not re-export from `@forge/ui` root inside platform wrappers until package exports support server/client-safe subpaths.
- No visible UI drift during refactors unless explicitly requested.

## Housekeeping

- Remove unused starter/template leftovers in phased slices.
- Keep compatibility redirects (`/account/*`, `/billing`, temporary `/dashboard/product|kanban`) until explicitly removed.
- After each platform slice: run lint/build/doctors and update agent artifacts docs.
