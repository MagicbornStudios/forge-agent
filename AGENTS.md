---
created: 2026-02-04
updated: 2026-02-07
---

# Forge Agent - Agent rules

**Agent artifact index:** See [docs/18-agent-artifacts-index.mdx](docs/18-agent-artifacts-index.mdx) for the full list of agent-only docs (agent-artifacts/core: STATUS, decisions, errors-and-attempts, tool-usage, compacting; all AGENTS.md). **Strategy and conventions:** [docs/19-coding-agent-strategy.mdx](docs/19-coding-agent-strategy.mdx). For **current state** and **failures**, read docs/agent-artifacts (index + core); for **area rules**, read this file and the relevant per-package AGENTS.md. Prefer **rg**/list_dir/Read to search and confirm - see [docs/agent-artifacts/core/tool-usage.md](docs/agent-artifacts/core/tool-usage.md).

## Workspace Platform Engineer

Owns **packages/shared/src/shared**: editor components, shared styles, and workspace types/contracts.

- **Loop**: Read **docs/agent-artifacts/core/STATUS.md** (see [18-agent-artifacts-index.mdx](docs/18-agent-artifacts-index.mdx)) and **AGENTS.md** (root + `packages/shared/src/shared/AGENTS.md` + `packages/shared/src/shared/components/workspace/AGENTS.md`) -> implement one vertical slice -> update STATUS (including **Ralph Wiggum loop**) and relevant AGENTS/README.
- **Naming**: Use **EditorShell** for the declarative root (layout + slots). Do not introduce a separate "container" name for the same concept.
- No imperative toolbar API; timeline is optional; no cross-domain imports in shared. Capabilities live in `packages/shared/src/shared/workspace/capabilities.ts` (contracts only).

## Unified editor (App Shell)

- **App Shell** (`apps/studio/components/AppShell.tsx`, `apps/studio/lib/app-shell/store.ts`) owns mode tabs and the active mode. Dialogue, Video, Character, and Strategy are sub-modes; only the active one is rendered.
- **Agent layers**: (1) Shell: context (activeWorkspace, workspaceNames) and actions (switchMode, openMode, closeMode). (2) Per-mode: domain contract (context + actions + suggestions) when that mode is active. (3) Optional co-agents: see **docs/17-co-agents-and-multi-agent.mdx**.
- **Do not repeat**: Before changing styling, model routing, or multi-mode registration, check **docs/agent-artifacts/core/errors-and-attempts.md** for known failures and fixes. For CopilotKit + OpenRouter use **OpenAI SDK** and **@ai-sdk/openai** with **baseURL** only; do not use `@openrouter/ai-sdk-provider`. See [errors-and-attempts.md](docs/agent-artifacts/core/errors-and-attempts.md) (BuiltInAgent/OpenRouter SDK) and [06-model-routing-and-openrouter.mdx](docs/architecture/06-model-routing-and-openrouter.mdx).

## Other agents

When touching modes (Dialogue, Character, Video, Strategy): use the shared shell from `@forge/shared/components/editor`. Do not invent new layout patterns; extend via slots and document in shared AGENTS.

## UI atoms

- Shared shadcn atoms live in `packages/ui` and are imported via `@forge/ui/*`.

## Feature gating

- Use `FeatureGate` for locked UI and `CAPABILITIES` from `packages/shared/src/shared/entitlements`.
- Avoid ad-hoc plan checks in components.

## Agent engine

- Workflow graphs live in `packages/agent-engine` (steps + events + streaming). Domains do not commit directly; they emit patches for review.

## Payload + Types (single app)

- **Collections live in** `apps/studio/payload/collections/` (users, projects, forge-graphs, video-docs, settings-overrides, agent-sessions).
- **Studio settings persistence** uses the `settings-overrides` collection and `GET`/`POST` `/api/settings`. Hydration runs on app init via `SettingsHydration`; users save explicitly from the settings sheet. Do not claim persistence is wired unless load and save are implemented.
- **Update** `docs/agent-artifacts/core/STATUS.md` after each slice.
- **Generated types live in** `packages/types/src/payload-types.ts`. Run `pnpm payload:types` after changing collections.
- **Domain types should prefer payload-generated shapes** via `packages/types/src/payload.ts` aliases (e.g. `ForgeGraphDoc` derives from payload types).

## Persistence and data layer

- **Read** `docs/agent-artifacts/core/decisions.md` and `docs/11-tech-stack.mdx` when changing persistence or the data layer (TanStack Query, Zustand drafts, API routes, localStorage).
- **Update** those docs when making or rejecting a significant choice (e.g. adding a new backend, changing the client boundary).
- **Keep one API boundary:** client talks only to our Next API routes; no direct Payload REST/GraphQL from the browser.
- **API client:** Collection CRUD uses the **Payload SDK** (`lib/api-client/payload-sdk.ts`) against Payload REST. Custom endpoints use the **generated** client where it exists (Auth, Settings, Model, Ai), **manual client modules** in `lib/api-client/` (elevenlabs, media, workflows), or **vendor SDKs** (e.g. ElevenLabs server SDK in route handlers). Do not add raw `fetch` for `/api/*` in components, hooks, or stores - **extend the client** (add a new module under `lib/api-client/` or use a vendor SDK) instead. The OpenAPI/Swagger spec is for **documentation only** (no streaming support); do not direct agents to add new endpoints to the spec to get a client. Use the TanStack Query hooks in `apps/studio/lib/data/hooks/` for server state. Swagger UI at `/api-doc`, spec at `/api/docs`.
