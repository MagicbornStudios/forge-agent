# Implementation Pointers

Where to go when implementing each phase. For agents and developers.

## Phase A: Internal Payload + Settings

- **Internal Payload**: New package or `apps/repo-studio/payload/` with SQLite adapter; DB path configurable (`.repo-studio/data/` for web, bundled path for Electron)
- **Settings registry**: Port from `apps/studio/lib/editor-registry/settings-registry.ts`; `apps/studio/components/settings/` (SettingsSection, SettingsField, types)
- **Replace**: `config.json` + `local.overrides.json` → Payload collections (e.g. `settings-overrides` or repo-studio-specific schema)
- **Consumer**: `RepoSettingsPanelContent` → use registry; `RepoStudioShell` mounts registry-backed panel
- **Config consumers**: `packages/repo-studio/src/lib/config.mjs`, `packages/repo-studio/src/server/server.mjs`; migrate to load from Payload API

## Phase B: Menu Contribution

- **Menu registry**: New store or context for workspace-contributed items; or extend `createEditorMenubarMenus` to accept workspace contributions
- **Workspaces**: `apps/repo-studio/src/components/features/*` (PlanningWorkspace, EnvWorkspace, etc.)
- **Shell**: `RepoStudioShell` lines 314–328 (menus); today hardcoded; change to aggregate workspace contributions
- **Package publish**: `package.json` scripts `registry:forge:publish:local`; add repo-studio, shared if missing

## Phase C: Parsers + Story Publish

- **Planning parser**: New `@forge/planning-parser` or `packages/repo-studio/src/parsers/`; `gray-matter` for frontmatter; custom for `<objective>`, `<context>`, `<tasks>`
- **Story parser**: Markdown → Blocks (paragraph, heading_1, etc.); `apps/studio/payload/collections/blocks.ts` schema
- **Publish API**: New route e.g. `POST /api/repo/story/publish`; creates Page + Blocks from story file; target internal Payload or platform
- **Pages/Blocks**: `apps/studio/payload/collections/pages.ts`, `blocks.ts`

## Phase D: Electron

- **Entrypoint**: electron-vite or electron-next; main process loads Repo Studio URL or static build
- **SQLite path**: Configure for app user data dir (e.g. `app.getPath('userData')`)
- **Build**: Add electron builder config; package scripts

## Phase E: Desktop Auth

- **Scopes**: Extend `apps/studio/lib/server/api-keys.ts` `API_KEY_SCOPES`; add `repo-studio` or `desktop`
- **Client**: Store token in keytar or electron-store; send `Authorization: Bearer <token>` when calling platform API
