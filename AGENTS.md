# Forge Agent - Agent rules

## Workspace Platform Engineer

Owns **packages/shared/src/shared**: workspace components, shared styles, and workspace types/contracts.

- **Loop**: Read **docs/STATUS.md** -> read **AGENTS.md** (root + `packages/shared/src/shared/AGENTS.md` + `packages/shared/src/shared/components/workspace/AGENTS.md`) -> implement one vertical slice -> update STATUS (including **Ralph Wiggum loop**) and relevant AGENTS/README.
- **Naming**: Use **WorkspaceShell** for the declarative root (layout + slots). Do not introduce a separate "container" name for the same concept.
- No imperative toolbar API; timeline is optional; no cross-domain imports in shared. Capabilities live in `packages/shared/src/shared/workspace/capabilities.ts` (contracts only).

## Unified workspace (App Shell)

- **App Shell** (`apps/studio/components/AppShell.tsx`, `apps/studio/lib/app-shell/store.ts`) owns workspace tabs and active workspace. Forge and Video are sub-workspaces; only the active one is rendered.
- **Agent layers**: (1) Shell: context (activeWorkspace, workspaceNames) and actions (switchWorkspace, openWorkspace, closeWorkspace). (2) Per-workspace: domain contract (context + actions + suggestions) when that workspace is active. (3) Optional co-agents: see **docs/co-agents-and-multi-agent.md**.
- **Do not repeat**: Before changing styling, model routing, or multi-workspace registration, check **docs/errors-and-attempts.md** for known failures and fixes.

## Other agents

When touching workspaces (Forge, Writer, etc.): use the shared shell from `@forge/shared/components/workspace`. Do not invent new layout patterns; extend via slots and document in shared AGENTS.

## UI atoms

- Shared shadcn atoms live in `packages/ui` and are imported via `@forge/ui/*`.

## Feature gating

- Use `FeatureGate` for locked UI and `CAPABILITIES` from `packages/shared/src/shared/entitlements`.
- Avoid ad-hoc plan checks in components.

## Payload + Types (single app)

- **Collections live in** `apps/studio/payload/collections/` (users, projects, forge-graphs, video-docs, settings-overrides, agent-sessions).
- **Studio settings persistence** uses the `settings-overrides` collection and `GET`/`POST` `/api/settings`. Hydration runs on app init via `SettingsHydration`; users save explicitly from the settings sheet. Do not claim persistence is wired unless load and save are implemented.
- **Update** `docs/STATUS.md` after each slice.
- **Generated types live in** `packages/types/src/payload-types.ts`. Run `pnpm payload:types` after changing collections.
- **Domain types should prefer payload-generated shapes** via `packages/types/src/payload.ts` aliases (e.g. `ForgeGraphDoc` derives from payload types).

## Persistence and data layer

- **Read** `docs/decisions.md` and `docs/tech-stack.md` when changing persistence or the data layer (TanStack Query, Zustand drafts, API routes, localStorage).
- **Update** those docs when making or rejecting a significant choice (e.g. adding a new backend, changing the client boundary).
- **Keep one API boundary:** client talks only to our Next API routes; no direct Payload REST/GraphQL from the browser.
- **Use the generated API client only:** All API access goes through the OpenAPI-generated client in `apps/studio/lib/api-client/`. Use the TanStack Query hooks in `apps/studio/lib/data/hooks/` for server state. Do not use raw `fetch` or hand-rolled API methods. The OpenAPI spec is auto-generated from JSDoc in `app/api/` (next-swagger-doc); regenerate the client with `pnpm generate-client` after route/JSDoc changes. Swagger UI at `/api-doc`, spec at `/api/docs`.
