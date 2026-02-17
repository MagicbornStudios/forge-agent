# Repo Studio Gaps

Identified gaps between current state and PRD. Updated 2026-02. Phases A-D (05-08) complete; Phase E (09) in progress.

## Resolved (Phases 05-08)

| Gap | Resolved In |
|-----|-------------|
| Settings persistence | Phase 05: Payload + SQLite, settings registry |
| Settings UI coverage | Phase 05: RepoSettingsRegistrations, section/field |
| Structured parsers | Phase 07: packages/repo-studio core parsers |
| Electron packaging | Phase 08: Desktop packaging, bundled SQLite |
| Menu contribution | Phase 06: buildRepoWorkspaceMenus, REPO_WORKSPACE_MENU_FACTORIES |
| Publish story → pages | Phase 07: publish-service, repo-pages/repo-blocks |
| UI definitions of done | styling-and-ui-consistency.md |
| Package publish | Phase 06: forge-repo-studio:package:publish (batch script: Low) |
| Layout/settings parity | Phase 05: registry pattern, codegen defaults |
| Env: per-key editing, copy-paste, scope, mode | Phase 05-04: Env workspace |
| Per-workspace menus/shortcuts | Phase 06: workspace menu factories |
| Navigator panel, server-side search | Phase 06: Code workspace, /api/repo/search |
| Repo Studio UI loads | Resolved; runs without blocking errors |

## Open (Phase E and Backlog)

### High Priority (Phase E)

| Gap | Current State | Target | Phase |
|-----|---------------|--------|-------|
| API key auth (desktop) | Session only (web) | Desktop scope + client flow; platform connection | E |

### Medium / Low Priority (Backlog)

| Gap | Current | Target |
|-----|---------|--------|
| Per-workspace settings sections | Minimal RepoSettingsPanelContent | Each workspace contributes; centralized registry |
| Review Queue diff UX | Table/list view | Click file → Monaco with diff; one file at a time (DS-13) |
| Proposal storage | In-memory / file | SQLite |
| Trust scope | None | Global only: auto-approve all vs require approval |
| React Query | Not used | Add for server state (optional) |

### Future / Aspirational

| Gap | Current | Target |
|-----|---------|--------|
| @ mentions UX | None | Paste data; display as tag (like Cursor) |
| Loop context cache | None | Invalidate on file change or manual refresh |
| Proposal attribution | None | agentId + agentType in requestApproval |
| Queue views | Single | Separate per-agent + aggregate views |
| Orchestrator | None | Repo Studio process for planning + execution loops |
| Codex observability | None | Dedicated Observability workspace |
| Docs workspace | Panel | Own workspace; doc content; markdown; aspirational MDX |

## Workspace Maturity

See [WORKSPACE-AUDIT.md](WORKSPACE-AUDIT.md) for full feature matrix.

| Workspace | Maturity | Notes |
|-----------|----------|-------|
| Planning | Good | Docs, loop snapshot; parser in core |
| Env | Good | Per-key editing, copy-paste, scope selector, mode |
| Commands | Good | — |
| Story | Good | Parser, publish API, scope guard |
| Code | Good | Navigator, file tree, server search, write flow |
| Diff | Good | Monaco diff; attach works |
| Git | Good | Panel, status, branches, commit |
| Docs | Basic | Docs load; panel only |
| Terminal | Basic | Workspace exists |
| Loop Assistant | Good | Shared runtime |
| Codex Assistant | Good | App-server; fallback |
| Review Queue | Partial | Proposals; Monaco diff UX pending (DS-13) |

## Ambiguity Resolved

- **Settings**: Internal Payload + SQLite (DS-01)
- **Story → pages**: Story files = Pages; content = Blocks (DS-02)
- **Phasing**: A → B → C → D → E
- **Workspace**: Same as editor; per-workspace contribution required (DS-04)
- **Writer vs Story**: Story files are the pages; no separate Writer blocks concept for storage—blocks are Notion-style storage for page content
