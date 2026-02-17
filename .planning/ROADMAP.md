# Roadmap: Forge Agent

## Overview

Operational roadmap for Forge Loop lifecycle delivery in RepoStudio, aligned to analysis outputs in:

- `repo_studio_analysis/`
- `forge_env_analysis/`
- `ide_navigation_analysis/`

Phase 07 is closed. Phase 08 is now the active execution gate before phase 09.

## Phases

- [x] **Phase 01: Forge Loop bootstrap** - Establish lifecycle command baseline
- [x] **Phase 02: RepoStudio command center** - Build reusable RepoOps shell + env/assistant/verification command center
- [x] **Phase 03: Multi-loop orchestration and dual-assistant editors** - Run many loop tracks from one Studio-grade RepoStudio surface
- [x] **Phase 04: Story domain Codex writer** - Deliver story-scoped authoring/editor workflows with strict domain guardrails and Git-integrated review loops
- [x] **Phase 05: Settings foundation and canonical env UX** - Move RepoStudio settings to internal Payload+SQLite patterns and complete env target editing parity
- [x] **Phase 06: Workspace contributions and IDE navigation core** - Add per-workspace menus/settings, Navigator/search baseline, and publishability parity
- [x] **Phase 07: Structured parsers and story publish pipeline** - Convert planning/story content into structured models and publish story files into pages/blocks
- [x] **Phase 08: Electron desktop runtime** - Deliver packaged desktop runtime with bundled SQLite and watcher-first behavior
- [ ] **Phase 09: Desktop auth and platform connection** - Add secure desktop connection/auth scope and credential flow

## Phase Details

### Phase 01: Forge Loop bootstrap
**Goal:** Establish lifecycle command baseline
**Depends on:** Nothing
**Requirements:** [REQ-01, REQ-02]
**Plans:** 2 plans

Plans:
- [x] 01-01: Bootstrap planning contracts and baseline artifacts
- [x] 01-02: Safety hardening and docs alignment

### Phase 02: RepoStudio command center
**Goal:** Build reusable RepoOps command center with Studio-grade parity, Codex-first assistant operations, runner-aware env gates, and nonstop Forge Loop visibility.
**Depends on:** Phase 01
**Requirements:** [REQ-03, REQ-04, REQ-05, REQ-06, REQ-07, REQ-08, REQ-09]
**Plans:** 7 plans

Plans:
- [x] 02-01: `.planning` reset + `forge-env` modular refactor and discovery contracts
- [x] 02-02: `@forge/repo-studio` runtime unification, resolver hardening, command UX filters/toggles/history
- [x] 02-03: Studio-grade app parity (dock views, settings/codegen, assistant panel reuse)
- [x] 02-04: Forge Loop analytics workspace, nonstop cadence docs, and quality gates
- [x] 02-05: Build unblock + app/package runtime parity APIs + command stream controls
- [x] 02-06: Command center hardening (tabs/filter/search/allow-disable/run-stop) with local override persistence
- [x] 02-07: Codex-first assistant integration + runner-aware env gate + docs/tests hardening

### Phase 03: Multi-loop orchestration and dual-assistant editors
**Goal:** Make RepoStudio loop-first for many package/project loops with explicit Loop Assistant and Codex Assistant surfaces plus read-first diff tooling.
**Depends on:** Phase 02
**Requirements:** [REQ-10, REQ-11, REQ-12]
**Plans:** 4 plans

Plans:
- [x] 03-01: Multi-loop artifact model + CLI loop selection + RepoStudio loop switch APIs
- [x] 03-02: Dual assistant editor routing with Codex app-server primary and explicit fallback controls
- [x] 03-03: Monaco diff read-first panel, assistant attach flow, and release-hardening docs/tests
- [x] 03-04: Codex IDE parity hardening (event mapping, review queue fidelity, package runtime parity checks)

### Phase 04: Story domain Codex writer
**Goal:** Build story-domain focused editing flows (outline/page/reader/diff/git) with codex scope controls and loop-safe approvals.
**Depends on:** Phase 03
**Requirements:** [REQ-13, REQ-14, REQ-15, REQ-16]
**Plans:** 4 plans

Plans:
- [x] 04-01: Story parser + canonical create hardening and editor baseline
- [x] 04-02: Hard scope guard + override lifecycle for story-domain codex operations
- [x] 04-03: Story/Git/Diff dock-panel parity and reusable scoped diff flow
- [x] 04-04: Story-domain runbooks and regression tests + strict verification closeout

Phase 04 strict gate: completed on 2026-02-16 (`forge-loop verify-work 04 --strict` pass).

### Phase 05: Settings foundation and canonical env UX
**Goal:** Move RepoStudio settings to internal Payload+SQLite patterns and complete env target read/write parity.
**Depends on:** Phase 04
**Requirements:** [REQ-17, REQ-18]
**Plans:** 4 plans

Plans:
- [x] 05-01: Internal Payload bootstrap for RepoStudio settings state
- [x] 05-02: Settings registry migration (section/field/codegen parity with Studio)
- [x] 05-03: Env target read/write APIs (single target, mode-scoped, validate-after-write)
- [x] 05-04: Env workspace per-key editing + copy-paste + scope filter (`package|app|vendor|root`)

### Phase 06: Workspace contributions and IDE navigation core
**Goal:** Add workspace-contributed menus/settings and IDE-like Navigator/search baseline with publishability parity.
**Depends on:** Phase 05
**Requirements:** [REQ-19, REQ-20]
**Plans:** 4 plans

Plans:
- [x] 06-01: Per-workspace menu contribution registry
- [x] 06-02: Generic Navigator panel (code-first, reusable in other workspaces)
- [x] 06-03: Server-side search API (`plain|regex|include|exclude|scope`)
- [x] 06-04: Git status decorations in tree/open files + publish script parity

### Phase 07: Structured parsers and story publish pipeline
**Goal:** Parse planning/story artifacts structurally and publish story markdown into page/block models.
**Depends on:** Phase 06
**Requirements:** [REQ-21]
**Plans:** 4 plans

Plans:
- [x] 07-01: Planning parser utility (frontmatter + section extraction)
- [x] 07-02: Story markdown to blocks transformer
- [x] 07-03: Story publish API (`story file -> page + blocks`)
- [x] 07-04: Review/diff integration for publish previews

### Phase 08: Electron desktop runtime
**Goal:** Provide Electron runtime with bundled SQLite and native watcher-first repository refresh behavior.
**Depends on:** Phase 07
**Requirements:** [REQ-22]
**Plans:** 4 plans

Plans:
- [ ] 08-01: Electron runtime shell and startup contracts
- [ ] 08-02: SQLite path strategy (web dev vs desktop bundled/userData)
- [ ] 08-03: Native watcher integration for tree/search/git refresh
- [ ] 08-04: Packaging and release scripts/docs

### Phase 09: Desktop auth and platform connection
**Goal:** Secure desktop connection to platform APIs with scoped auth and local credential lifecycle.
**Depends on:** Phase 08
**Requirements:** [REQ-23]
**Plans:** 4 plans

Plans:
- [ ] 09-01: Server scope additions (`repo-studio|desktop`) and auth checks
- [ ] 09-02: Desktop token lifecycle and secure storage strategy
- [ ] 09-03: Connection status/remediation UX in RepoStudio
- [ ] 09-04: Security/runbook hardening for desktop auth flow

## Progress

| Phase | Plans Complete | Status | Completed |
|---|---|---|---|
| 01. Forge Loop bootstrap | 2/2 | Complete | 2026-02-13 |
| 02. RepoStudio command center | 7/7 | Complete | 2026-02-14 |
| 03. Multi-loop orchestration and dual-assistant editors | 4/4 | Complete | 2026-02-14 |
| 04. Story domain Codex writer | 4/4 | Complete | 2026-02-16 |
| 05. Settings foundation and canonical env UX | 4/4 | Complete | 2026-02-16 |
| 06. Workspace contributions and IDE navigation core | 4/4 | Complete | 2026-02-16 |
| 07. Structured parsers and story publish pipeline | 4/4 | Complete | 2026-02-16 |
| 08. Electron desktop runtime | 0/4 | Planned | - |
| 09. Desktop auth and platform connection | 0/4 | Planned | - |
