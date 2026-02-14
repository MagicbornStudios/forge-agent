# Repo Studio Gaps

Identified gaps between current state and PRD. Ambiguity removed where possible.

## High Priority

| Gap | Current State | Target | Phase |
|-----|---------------|--------|-------|
| Settings persistence | config.json + local.overrides.json; no registry | Internal Payload + SQLite; settings registry; section/field UI | A |
| Settings UI coverage | 4 controls (profile, mode, confirmRuns, panels) | All config sections editable via right sidebar | A |
| Structured parsers | Raw `<pre>` for planning; raw for story | Parsed YAML/XML for planning; markdown → structure for story | C |
| Electron packaging | None | Desktop app with bundled SQLite | D |

## Medium Priority

| Gap | Current State | Target | Phase |
|-----|---------------|--------|-------|
| Menu contribution | Hardcoded in RepoStudioShell | Per-workspace menu registration | B |
| Publish story → pages | Story saves to files only | API: story file → Page + Blocks | C |
| API key auth (desktop) | Session only (web) | Desktop scope + client flow | E |
| UI definitions of done | Ad-hoc | Formal DoD; compact tokens; no ad-hoc padding | B |
| Package publish | repo-studio not in registry script | Add to Verdaccio/npm publish | B |

## Low Priority

| Gap | Current State | Target | Phase |
|-----|---------------|--------|-------|
| Layout/settings parity | RepoSettingsPanelContent vs AppSettingsPanelContent | Same registration pattern; codegen for defaults | A/B |

## Workspace Maturity

See [WORKSPACE-AUDIT.md](WORKSPACE-AUDIT.md) for full feature matrix and Env gap breakdown.

| Workspace | Maturity | Gaps |
|-----------|----------|------|
| Planning | Basic | Raw text; no parser; no structured view |
| Env | Partial | Doctor-only; no per-key editing; no copy-paste; no scope selector |
| Commands | Good | — |
| Story | In progress | Parser weak; no publish; scope guard in progress |
| Code | Basic | Read-first only; no write flow |
| Diff | Good | Monaco diff; attach works |
| Git | Partial | Panel exists; "first-class" ops (REQ-15) pending |
| Docs | Basic | Docs load |
| Terminal | Basic | Workspace exists |
| Loop Assistant | Good | Shared runtime |
| Codex Assistant | Good | App-server; fallback |
| Review Queue | Partial | Proposals; Tool UI cards not standardized |

### Env Workspace Gaps (canonical env UI; no standalone portal)

- Per-key editing per target; Save/Refresh
- Copy-paste: paste .env content into target/mode inputs
- Scope selector: package \| app \| vendor \| root
- Mode-scoped inputs per target (local vs dev vs prod)

### UI Load / Runtime (blocking)

| Gap | Current | Target |
|-----|---------|--------|
| Repo Studio UI loads | Has not loaded due to errors | Runs without blocking errors |
| Root cause | TBD | Analyze and document in errors-and-attempts |

### New Gaps (from DECISIONS-WORKSPACE-PANELS)

| Gap | Current | Target |
|-----|---------|--------|
| React Query | Not used in repo-studio-app | Add for server state; avoid performance issues |
| Per-workspace menus/shortcuts | Hardcoded | Workspace registration |
| Per-workspace settings sections | Minimal RepoSettingsPanelContent | Each workspace contributes; centralized registry |
| Navigator panel | None | Generic Navigator; Code workspace first |
| Review Queue diff UX | Table/list view | Click file → Monaco with diff; one file at a time |
| Proposal storage | In-memory? | SQLite |
| Panel behavior props | Ad-hoc | Attach/copy/refresh modular; hide when no data |
| Story/Docs as sibling workspaces | Story exists; Docs is panel | Story + Docs each full workspace |
| Loops for planning | Planning artifacts | PRD/plan iteration; loop creation |

## Ambiguity Resolved

- **Settings**: Internal Payload + SQLite (DS-01)
- **Story → pages**: Story files = Pages; content = Blocks (DS-02)
- **Phasing**: A → B → C → D → E
- **Workspace**: Same as editor; per-workspace contribution required (DS-04)
- **Writer vs Story**: Story files are the pages; no separate Writer blocks concept for storage—blocks are Notion-style storage for page content
