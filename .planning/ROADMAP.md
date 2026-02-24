# Roadmap: Forge Agent

## Overview

Operational roadmap for Forge Loop lifecycle delivery in RepoStudio, aligned to analysis outputs in:

- `repo_studio_analysis/`
- `forge_env_analysis/`
- `ide_navigation_analysis/`

Phase 12 implementation is in final closeout (`12-05`). Phase 13 (AI runtimes correction and Database workspace) completed.

## Phases

- [x] **Phase 01: Forge Loop bootstrap** - Establish lifecycle command baseline
- [x] **Phase 02: RepoStudio command center** - Build reusable RepoOps shell + env/assistant/verification command center
- [x] **Phase 03: Multi-loop orchestration and dual-assistant editors** - Run many loop tracks from one Studio-grade RepoStudio surface
- [x] **Phase 04: Story domain Codex writer** - Deliver story-scoped authoring/editor workflows with strict domain guardrails and Git-integrated review loops
- [x] **Phase 05: Settings foundation and canonical env UX** - Move RepoStudio settings to internal Payload+SQLite patterns and complete env target editing parity
- [x] **Phase 06: Workspace contributions and IDE navigation core** - Add per-workspace menus/settings, Navigator/search baseline, and publishability parity
- [x] **Phase 07: Structured parsers and story publish pipeline** - Convert planning/story content into structured models and publish story files into pages/blocks
- [x] **Phase 08: Electron desktop runtime** - Deliver packaged desktop runtime with bundled SQLite and watcher-first behavior
- [x] **Phase 09: Desktop auth and platform connection** - Add secure desktop connection/auth scope and credential flow
- [x] **Phase 10: RepoStudio build and runtime guardrails** - Prevent CSS/dependency regressions with verify-work, doctor, dev prechecks, and CI gates
- [x] **Phase 11: Review Queue persistence and diff UX** - Move proposals to SQLite source-of-truth, add one-file Monaco diff review, and enforce scope-safe global trust-mode auto-apply
- [x] **Phase 12: Codex-interactive Ralph Loop CLI** - Add provider-based interactive CLI runtime with Codex app-server primary, prompt-pack fallback, and run-event telemetry
- [x] **Phase 13: AI runtimes correction and Database workspace** - Register AI runtimes/companion work in the loop, fix Database workspace to use embedded Drizzle Studio, and sync legacy artifacts

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
- [x] 08-01: Electron runtime shell and startup contracts
- [x] 08-02: SQLite path strategy (web dev vs desktop bundled/userData)
- [x] 08-03: Native watcher integration for tree/search/git refresh
- [x] 08-04: Packaging and release scripts/docs

### Phase 09: Desktop auth and platform connection
**Goal:** Secure desktop connection to platform APIs with scoped auth and local credential lifecycle.
**Depends on:** Phase 08
**Requirements:** [REQ-23]
**Plans:** 4 plans

Plans:
- [x] 09-01: Studio scope additions (`repo-studio.*|connect|read|write`) and desktop connection validation endpoint
- [x] 09-02: Desktop token lifecycle with keytar + safeStorage fallback and IPC bridge auth controls
- [x] 09-03: Settings-registry connection status/remediation UX and typed client integration
- [x] 09-04: Desktop auth diagnostics, security tests, and runbook hardening

### Phase 10: RepoStudio build and runtime guardrails
**Goal:** Catch RepoStudio CSS/dependency regressions early through verify-work gating, doctor diagnostics, dev prechecks, and CI.
**Depends on:** Phase 09
**Requirements:** [REQ-24]
**Plans:** 4 plans

Plans:
- [x] 10-01: Add path-based RepoStudio build gate to Forge Loop verify-work
- [x] 10-02: Extend RepoStudio dependency doctor with CSS package checks (`tw-animate-css`, `tailwindcss-animate`)
- [x] 10-03: Add `predev:repo-studio` fail-fast doctor precheck
- [x] 10-04: Add minimal CI workflow and document CSS import/dependency rules for agents

### Phase 11: Review Queue persistence and diff UX
**Goal:** Make Review Queue production-grade with SQLite-backed proposals, one-file-at-a-time Monaco diff UX, and scope-safe trust-mode auto-apply.
**Depends on:** Phase 10
**Requirements:** [REQ-25]
**Plans:** 4 plans

Plans:
- [x] 11-01: Proposal store repository refactor + SQLite canonical persistence + one-time JSON import
- [x] 11-02: Proposal diff parsing service + diff-files/diff-file API contracts + typed client support
- [x] 11-03: Review Queue one-file Monaco UX + settings trust-mode wiring + auto-apply behavior
- [x] 11-04: Docs/tests/verification closeout + phase summaries and artifact trace updates

### Phase 12: Codex-interactive Ralph Loop CLI
**Goal:** Extend `forge-loop` with provider abstraction and interactive codex-enabled execution while preserving prompt-pack compatibility.
**Depends on:** Phase 11
**Requirements:** [REQ-26]
**Plans:** 5 plans

Plans:
- [x] 12-01: Runtime provider abstraction + runtime config normalization
- [x] 12-02: Codex app-server runner core + event telemetry
- [x] 12-03: Interactive Ink TUI command and flow orchestration
- [x] 12-04: Stage command integration (`discuss|plan|execute`) with runner semantics
- [ ] 12-05: Docs/tests/verification closeout and phase summary artifacts

### Phase 13: AI runtimes correction and Database workspace
**Goal:** Register AI runtimes/companion work in the loop, fix Database workspace to use embedded Drizzle Studio, and sync legacy artifacts.
**Depends on:** Phase 12
**Requirements:** (Phase 13 corrective)
**Plans:** 2 plans

Plans:
- [x] 13-01: Retrospective — Add Phase 13 to ROADMAP, add completed AI runtimes tasks to TASK-REGISTRY, run sync-legacy, update STATUS and DECISIONS
- [x] 13-02: Database workspace — Replace custom SQL runner with embedded Drizzle Studio; remove better-sqlite3 and POST /api/repo/db/query

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
| 08. Electron desktop runtime | 4/4 | Complete | 2026-02-17 |
| 09. Desktop auth and platform connection | 4/4 | Complete | 2026-02-17 |
| 10. RepoStudio build and runtime guardrails | 4/4 | Complete | 2026-02-17 |
| 11. Review Queue persistence and diff UX | 4/4 | Complete | 2026-02-17 |
| 12. Codex-interactive Ralph Loop CLI | 4/5 | In progress | - |
| 13. AI runtimes correction and Database workspace | 2/2 | Complete | 2026-02-23 |
