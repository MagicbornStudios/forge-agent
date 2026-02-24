---
created: 2026-02-04
updated: 2026-02-07
---

# Forge Agent - Agent rules

**New here?** Read this file, then [18-agent-artifacts-index](docs/18-agent-artifacts-index.mdx) and [19-coding-agent-strategy](docs/19-coding-agent-strategy.mdx). For **current work** use `.planning` artifacts first, then legacy snapshots in [STATUS](docs/agent-artifacts/core/STATUS.md) and [task-registry](docs/agent-artifacts/core/task-registry.md); for **what's broken** see [ISSUES](ISSUES.md).

**User correction overrides agent assumptions:** When the user explicitly rejects a hypothesis or forbids a fix, stop. Do not re-implement it. Update [errors-and-attempts](docs/agent-artifacts/core/errors-and-attempts.md) so future agents find the correction. Push back once with evidence if needed; then defer.

**Agent artifact index:** See [docs/18-agent-artifacts-index.mdx](docs/18-agent-artifacts-index.mdx) for the full list of agent-only docs (agent-artifacts/core: STATUS, decisions, errors-and-attempts, tool-usage, compacting, standard-practices; all AGENTS.md). **Strategy and conventions:** [docs/19-coding-agent-strategy.mdx](docs/19-coding-agent-strategy.mdx). For **current state** and **failures**, read docs/agent-artifacts (index + core); for **granular "what can I do next?"** (small tasks by tier), see [task-registry](docs/agent-artifacts/core/task-registry.md) and [task-breakdown-system](docs/agent-artifacts/core/task-breakdown-system.md); for **known product/editor issues** (e.g. what's broken or locked), see [ISSUES.md](ISSUES.md); for **technical debt and refactors**, see [technical-debt-roadmap](docs/agent-artifacts/core/technical-debt-roadmap.md); for **area rules**, read this file and the relevant per-package AGENTS.md. Prefer **rg**/list_dir/Read to search and confirm - see [docs/agent-artifacts/core/tool-usage.md](docs/agent-artifacts/core/tool-usage.md). **Capabilities:** [SKILLS.md](SKILLS.md). **Human workflow and DoD:** [CONTRIBUTING.md](CONTRIBUTING.md) and [.github/pull_request_template.md](.github/pull_request_template.md).

**Forge Loop lifecycle:** `.planning/` is the source of truth. **Primary:** GSD (Codex) via `$gsd-*` skills—install with `pnpm gsd:install` (Codex-only). Use `forge-loop` for `doctor`, `progress`, `sync-legacy`. Phase execution is Codex + GSD skills only (no forge-loop phase CLI). `FORGE_LOOP_ID` unset → default loop (`.planning/`); set → `.planning/loops/<id>/`. Legacy files under `docs/agent-artifacts/core/*` are snapshot outputs. For GUI operations, prefer `forge-repo-studio` (`open`, `doctor`, `run`).

## Scoped edits / .tmp

The `.tmp/` directory (and any path listed in .gitignore as agent-download/reference) is used by agents to download entire repos or component trees for reference. Do **not** edit, refactor, or lint files under `.tmp/`. It is not part of our codebase; search and code changes apply to `apps/`, `packages/`, `docs/`, and root config only.

## AI/chat-first guardrail

- Treat assistant/chat flows as the primary architecture surface.
- Canonical runtime wrapper is shared: `@forge/shared/components/assistant-ui` `AssistantPanel`.
- Do **not** add app-local wrappers that wire `AssistantRuntimeProvider`, `AssistantChatTransport`, or `useChatRuntime` in `apps/*`.
- Companion runtime routing (Repo Studio detection + assistant URL resolution) must use shared workspace utilities, not app-local duplicates.

## Editor platform (shared)

Owns **packages/shared/src/shared**: editor components, shared styles, and editor/selection/overlay/toolbar types (internal `shared/workspace`; consumed via `@forge/shared`).

- **Loop**: Use GSD (Codex) `$gsd-*` skills for phases; run `forge-loop doctor` before major phase runs, then `forge-loop sync-legacy` to update snapshot sections in `docs/agent-artifacts/core/*`. Use RepoStudio Env workspace for guided headless/env remediation when interactive.
- **Naming**: Use **EditorShell** for the declarative root (layout + slots). Do not introduce a separate "container" name for the same concept.
- No imperative toolbar API; timeline is optional; no cross-domain imports in shared. Capabilities live in `packages/shared/src/shared/workspace/capabilities.ts` (contracts only).

## Studio and registries

- **Studio** (`apps/studio/components/Studio.tsx`) is the single root: it owns all providers (Sidebar, StudioMenubarProvider, StudioSettingsProvider, OpenSettingsSheetProvider) and layout. The host renders `<Studio />`; **AppShell** is a thin wrapper that registers Assistant UI actions and renders Studio. **Registries** (editor, menu, panel, settings) follow one pattern: place components in the tree under a scope provider; they register on mount and unregister on unmount; consumers read from the store and filter by scope/context/target. **App shell store** (`apps/studio/lib/app-shell/store.ts`) remains canonical for route, activeProjectId, and UI state; Studio and editors consume it. Project switching lives in the tab bar; do not add editor-level project switchers.
- **Agent layers**: (1) Shell: context (activeEditor, editorNames) and actions (switchEditor, openEditor, closeEditor). (2) Per-editor: domain contract when that editor is active. (3) Optional co-agents: see **docs/ai/05-agent-system.mdx** and **docs/ai/06-mcp-integration.mdx**.
- **Do not repeat**: Before changing styling, model routing, or multi-editor registration, check **docs/agent-artifacts/core/errors-and-attempts.md** for known failures and fixes. For CopilotKit + OpenRouter use **OpenAI SDK** and **@ai-sdk/openai** with **baseURL** only; do not use `@openrouter/ai-sdk-provider`. See [errors-and-attempts.md](docs/agent-artifacts/core/errors-and-attempts.md) and [06-model-routing-and-openrouter.mdx](docs/architecture/06-model-routing-and-openrouter.mdx).

## Other agents

When touching editors (Dialogue, Character, Video, Strategy): use the shared shell from `@forge/shared/components/editor`. Do not invent new layout patterns; extend via slots and document in shared AGENTS.

## UI atoms

- Shared shadcn atoms live in `packages/ui` and are imported via `@forge/ui/*`.

## UI density checklist

- Editor surfaces must use compact tokens (`--control-*`, `--panel-padding`, `--tab-height`).
- Avoid ad-hoc `px-*` / `py-*` utilities in editor UIs; prefer token-based values.
- Do not repeat context labels (project title, editor name) inside panels if already shown in the header.
- If an editor overrides density, set `data-density` on `EditorShell`.

## Styling and UI

- When changing UI/styling: follow [docs/agent-artifacts/core/styling-and-ui-consistency.md](docs/agent-artifacts/core/styling-and-ui-consistency.md) and [how-to 26 - Styling debugging with Cursor](docs/how-to/26-styling-debugging-with-cursor.mdx). Do not run browser screenshot automation (it errors often). After implementing, update design docs and STATUS; an "after" screenshot is optional—humans should capture and save to docs/images when they want a visual reference.
- When adding a CSS `@import` in any app `globals.css`, add that package to the same app `package.json` and run `pnpm --filter <app-package-name> build` before phase closeout.

## Vendor workflow

- Vendored dependencies live under `vendor/` (not `.tmp/`).
- Humans and agents follow the same process: [How-to 24 - Vendoring third-party code](docs/how-to/24-vendoring-third-party-code.mdx) for submodule updates, version alignment, pnpm overrides, and upstream PRs.
- For local consumer repos, publish vendored packages to Verdaccio (see How-to 24 and [How-to 25](docs/how-to/25-verdaccio-local-registry.mdx)).
- Forge publish flow: `registry:forge:build` + `registry:forge:publish:local`.
- Twick publish flow: `vendor:twick:build` + `vendor:twick:publish:local`.
- Verdaccio login is optional; 409 conflict fix is documented in How-to 25.

## Enhanced features / ideas backlog

- **Backlog:** [docs/agent-artifacts/core/enhanced-features-backlog.md](docs/agent-artifacts/core/enhanced-features-backlog.md). Process in same doc.
- Agents may add ideas with status `proposed` (Title, Context, Suggestion, Date). Do **not** implement proposed items until a human sets status to `accepted`. Human triages; then implement and set status to `implemented` with optional Link.

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

- **Read** `docs/agent-artifacts/core/decisions.md` and [how-to 01 - Foundation](docs/how-to/01-foundation.mdx) (stack overview) when changing persistence or the data layer (TanStack Query, Zustand drafts, API routes, localStorage).
- **Update** those docs when making or rejecting a significant choice (e.g. adding a new backend, changing the client boundary).
- **Keep one API boundary:** client talks only to our Next API routes; no direct Payload REST/GraphQL from the browser.
- **API client:** Collection CRUD uses the **Payload SDK** (`lib/api-client/payload-sdk.ts`) against Payload REST. Custom endpoints use the **generated** client where it exists (Auth, Settings, Model, Ai), **manual client modules** in `lib/api-client/` (elevenlabs, media, workflows), or **vendor SDKs** (e.g. ElevenLabs server SDK in route handlers). Do not add raw `fetch` for `/api/*` in components, hooks, or stores - **extend the client** (add a new module under `lib/api-client/` or use a vendor SDK) instead. The OpenAPI/Swagger spec is for **documentation only** (no streaming support); do not direct agents to add new endpoints to the spec to get a client. Use the TanStack Query hooks in `apps/studio/lib/data/hooks/` for server state. Swagger UI at `/api-doc`, spec at `/api/docs`.

## Code quality (constants and DRY)

- **Constants:** Editor ids, API paths, and query keys must use constants, not magic strings. See [docs/agent-artifacts/core/standard-practices.md](docs/agent-artifacts/core/standard-practices.md) § Constants, enums, and DRY.
- **Env keys:** When adding a new env variable, update the active `forge-env` profile (`.forge-env/config.json` and `packages/forge-env/src/lib/forge-agent-manifest.mjs` for forge-agent defaults), then run `pnpm forge-env:reconcile -- --write --sync-examples`. Validate with `pnpm forge-env:doctor -- --mode headless --strict`, and use `pnpm forge-repo-studio open --view env` for GUI inspection. Do not hand-edit generated `.env.example` outputs.

## Cursor Cloud specific instructions

### Services overview

| Service | Port | Start command | Notes |
|---------|------|---------------|-------|
| Studio (main app) | 3000 | `FORGE_SKIP_ENV_BOOTSTRAP=1 pnpm --filter @forge/studio dev` | Next.js + Payload CMS with embedded SQLite |
| Docs | 3002 | `pnpm dev:docs` | Optional — Fumadocs MDX site |
| Platform | 3001 | `pnpm dev:platform` | Optional — marketing/SaaS surface |

### Running the Studio dev server

- Set `FORGE_SKIP_ENV_BOOTSTRAP=1` when starting `pnpm dev` or `pnpm dev:studio` to avoid the interactive env portal opening in a browser.
- Minimum `.env.local` for `apps/studio`: `PAYLOAD_SECRET` (any random string), `NEXT_PUBLIC_LOCAL_DEV_AUTO_ADMIN=1`, `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD`. Auto-admin creates `admin@forge.local / admin12345` on first run.
- The SQLite database is auto-created at `apps/studio/data/payload.db` on first startup. No external database needed for local dev.
- `@forge/yarn-converter` must be built (`pnpm --filter @forge/yarn-converter build`) before Studio compiles — it exports from `dist/`.

### Lint, test, build

- **Lint:** `pnpm lint` runs guard scripts + css-doctor + ESLint for docs/platform/studio. Individual app lint: `pnpm --filter @forge/studio lint`.
- **Test:** `pnpm test` (runs Jest suite in studio — 8 suites, 24 tests).
- **Build:** `pnpm build` (studio production build).

### Known pre-existing issues

- `pnpm css:doctor` fails for studio due to `tw-animate-css` needing to be in `apps/studio/package.json` (same pattern as the repo-studio fix documented in `.planning/ERRORS.md`).
- `pnpm hydration:doctor` fails because `typescript` is not a root workspace dependency (only in sub-packages). Not blocking for dev.
- `apps/studio/components/media/ConnectedGenerateMediaModal` is referenced in character editor components but does not exist in the repo. A stub is needed for the dev server to compile the main page.
