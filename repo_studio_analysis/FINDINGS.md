# Repo Studio Findings

## 1. Current Repo Studio State

- Uses `EditorDockLayout`, `EditorMenubar` from `@forge/shared/components/editor`
- Shared sidebar from `@forge/shared` and `@forge/ui`
- **Workspaces** (panels): Planning, Env, Commands, Story, Code, Diff, Git, Docs, Terminal, Loop Assistant, Codex Assistant, Review Queue
- Planning docs rendered as raw text in `PlanningWorkspace` (`<pre>{selectedDocContent}</pre>`)
- Key files: `apps/repo-studio/src/components/RepoStudioShell.tsx`, `packages/shared/src/shared/components/editor/index.ts`

### Settings Today
- `RepoSettingsPanelContent` edits only: profile, mode, confirmRuns, panel visibility
- Most config (`config.json`, `local.overrides.json`) has no UI—edit JSON by hand
- App shell store (zustand) persists to localStorage; CLI persists to `local.overrides.json` via API
- No settings registry; no section/field registration

### Forge Env Relationship
- Repo Studio Env workspace is the canonical env UI. Calls forge-env doctor/reconcile APIs.
- Legacy forge-env portal exists but is not used or embedded; Env workspace must provide full management.
- See [forge_env_analysis/](../forge_env_analysis/) and [WORKSPACE-AUDIT.md](WORKSPACE-AUDIT.md) for gaps (per-key editing, copy-paste, scoping).

### Config Consumed By
- packages/repo-studio: commandPolicy, assistant, domains, docs, loop, loops
- API routes proxy to CLI which loads config
- Config sections without UI: runtime, views, ui, assistant.codex, assistant.applyPolicy, domains.story, docs.paths, loop.paths

## 2. Gaps and Recommendations

### Settings (DS-01)
- **Gap**: RepoSettingsPanelContent is minimal; config has 15+ sections with no UI
- **Recommendation**: Internal Payload + SQLite; port Studio settings registry; back with Payload API instead of Payload cloud

### Parsers
- Planning files: YAML frontmatter + XML-like `<objective>`, `<context>`, `<tasks>`
- Story: markdown with act/chapter/page structure
- **Recommendation**: `gray-matter` for frontmatter; custom extractors for plan sections; story markdown → Blocks schema

### Publish-to-Pages (DS-02)
- Story file → Page (metadata) + Blocks (content)
- Existing collections: `pages` (project, parent, properties, url) and `blocks` (page, type, position, payload)
- **Recommendation**: API to create/update Page + Blocks from story file content; target internal Payload or platform when connected

### Electron
- No Electron today
- **Recommendation**: electron-vite or Next.js + Electron; bundle SQLite DB in app

### Auth (Phase E)
- Add `repo-studio` or `desktop` scope to api-keys; `Authorization: Bearer <token>`
- Desktop flow: OAuth or paste-and-store; keytar/electron-store for secure storage

### Menu Contribution (DS-04)
- Today: hardcoded menus in RepoStudioShell via createEditorMenubarMenus
- **Recommendation**: Workspace-scoped menu registry; each workspace contributes items to File/View/Edit/etc.

## 3. Tech/Pattern Suggestions

- **Internal Payload**: Separate instance; SQLite adapter; collections: settings-overrides (minimal); DB path configurable for Electron
- **Layout**: `--control-*`, `--panel-padding`, `--tab-height` per `styling-and-ui-consistency.md`
- **Package exports**: Add repo-studio to `registry:forge:publish:local`; ensure package.json exports
