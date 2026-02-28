# Roadmap: Forge Agent

## Overview

Operational roadmap for Forge Loop lifecycle delivery in RepoStudio, aligned to analysis outputs in:

- `repo_studio_analysis/`
- `forge_env_analysis/`
- `ide_navigation_analysis/`

Phase 12 implementation is in final closeout (`12-05`). Phase 13 (AI runtimes correction and Database workspace) completed. Phase 14 (AI/chat-first hard-cut + consumer studio) completed. Phase 15 (Strategic shift: Repo Studio + Platform focus) is active in execution.

Phase 15 archive execution note: `apps/studio` and `apps/consumer-studio` are now marked archived while capability extraction proceeds through RepoStudio-Extensions installables/examples.

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
- [x] **Phase 14: AI/chat-first hard-cut and consumer studio reference** - Canonical shared assistant surface, inline workspace panel composition, `assistantTarget` contracts, companion runtime reuse, and chat-only consumer app
- [ ] **Phase 15: Strategic shift — Repo Studio + Platform focus** - Archive Studio app; move Character and Dialogue workspaces to extensions (other repo); turn consumer-studio into extension; deprecate forge graphs and Yarn Spinner dialogue on platform; platform supports Repo Studio first
- [ ] **Phase 16: Repo Studio canonical submodule** - Add MagicbornStudios/RepoStudio as submodule (vendor/repo-studio); verify in GitHub, pull, and build in monorepo; then switch to canonical build from submodule so monorepo is shared packages + platform + Repo Studio (submodule)
- [ ] **Phase 17: Platform submodule and docs deploy** - Platform in RepoStudio-Platform repo and as submodule (vendor/platform); docs site (apps/docs) and platform on Vercel; deployment matrix (docs Vercel, platform Vercel, npm, Electron Releases)
- [ ] **Phase 18: Platform integration gateway** - Platform as BFF: Open Router proxy, extension install proxy, capability flags in auth response; Repo Studio uses proxy when connected
- [ ] **Phase 19: Planning assistant context and tools** - Ensure assistant receives loopId/workspaceId/selectedDocId; add plan-specific Forge tools (add task, update status, open planning doc); optional LangGraph for planning orchestration and multi-loop awareness
- [ ] **Phase 20: Planning artifacts first-class in Repo Studio — DoD, HUMAN-TASKS, panels, unified todos** - Bake DoD and HUMAN-TASKS into snapshot and panels; unified "my todos | agent tasks" view with correlation; optional on-load Codex "what to do" and human-blocker notifications
- [ ] **Phase 21: Artifact layout and loop efficiency — planning** - Planning/design only: how artifacts are laid out for users in Repo Studio; how loops stay efficient (context, tools, cadence, handoffs); decisions and optional spec/checklist
- [ ] **Phase 22: Workspace and panel design refactor — composition, chat-in-chat, fewer rails** - Remove Copy @ from panels; reduce Planning left rail; tree + context menu for structure actions
- [ ] **Phase 23: Repo review and cleanup — GSD/Cursor setup, analysis consolidation, layout and legacy** - GSD install and Cursor rule; consolidate or clarify analysis; document repo layout and .cursor/plans hygiene
- [ ] **Phase 24: Loop model and multi-loop** - Loop hierarchy (new scope = new loop; child loops under meta loop); fixed naming conventions; max doc size + contextual summarize/archive; discoverability for Repo Studio and coding agents
- [ ] **Phase 25: Game simulation workspace** - Extension workspace "game simulation" with own parser and doc writes; GRD + `.concept`; simulation entry point scoping Codex to workspace docs only; two-loop handoff (concept vs PRD)

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

### Phase 14: AI/chat-first hard-cut and consumer studio reference
**Goal:** Enforce assistant-first architecture contracts, remove wrapper duplication, inline Repo Studio workspace panel composition, and ship chat-only consumer app reference.
**Depends on:** Phase 13
**Requirements:** (Phase 14 corrective + semantic hard-cut)
**Plans:** 4 plans

Plans:
- [x] 14-01: Shared canonical AssistantPanel + remove app-local assistant runtime wrappers
- [x] 14-02: Repo Studio inline workspace panel composition + `assistantTarget` contract hard-cut + companion CORS
- [x] 14-03: Shared companion runtime switch/store/url hook + Studio adoption
- [x] 14-04: Remove `examples/consumer`, add `apps/consumer-studio`, add AI/chat-first semantic guard scripts

### Phase 16: Repo Studio canonical submodule
**Goal:** Repo Studio app is canonical in MagicbornStudios/RepoStudio; include as submodule and build from it so the monorepo is shared packages + platform + Repo Studio (submodule).
**Depends on:** Phase 15 (release cut); RepoStudio repo on GitHub with initial structure
**Plans:** 2 plans

Plans:
- [ ] 16-01: Add submodule at vendor/repo-studio; verify repo on GitHub, pullable, and monorepo builds with submodule
- [ ] 16-02: Switch to canonical build from submodule (workspace integration, next-server/build.mjs resolution, release workflow; remove/archive in-repo app/package)

### Phase 17: Platform submodule and docs deploy
**Goal:** Platform in own repo (RepoStudio-Platform) and as submodule in forge-agent; docs site and platform both on Vercel; forge-agent = docs + shared packages + Electron releases + submodules; deployment matrix documented.
**Depends on:** Phase 16 optional; RepoStudio-Platform repo on GitHub
**Plans:** 4 plans

Plans:
- [ ] 17-01: Add Platform submodule (vendor/platform); update .gitmodules and release workflow; verify clone/build
- [ ] 17-02: Docs site Vercel-ready and deploy from forge-agent; record docs URL
- [ ] 17-03: Platform deploy from RepoStudio-Platform repo; env NEXT_PUBLIC_DOCS_APP_URL; remove/archive apps/platform when submodule canonical
- [ ] 17-04: Deployment matrix and CI; release workflow update; STATE/DECISIONS

### Phase 18: Platform integration gateway
**Goal:** Platform acts as integration gateway (BFF): holds credentials, exposes proxy APIs (Open Router, extension fetch), returns capability flags so Repo Studio can use proxy when connected.
**Depends on:** Phase 17 (platform submodule and docs deploy)
**Plans:** 3 plans

Plans:
- [ ] 18-01: Open Router proxy on platform; Repo Studio calls platform when capabilities.openRouterProxy
- [ ] 18-02: Extension install via platform (fetch from RepoStudio-Extensions); Repo Studio uses when capabilities.extensionInstallProxy and no user GitHub token
- [ ] 18-03: Extend auth response capabilities (openRouterProxy, extensionInstallProxy); Repo Studio types and client wiring

### Phase 19: Planning assistant context and tools
**Goal:** Assistant context correctness (loop/workspace/doc in every request) and plan actions (Forge tools); optional LangGraph for planning orchestration and multi-loop awareness.
**Depends on:** Phase 15 (release cut); can overlap with 16–18
**Plans:** 3 plans

Plans:
- [ ] 19-01: Client→server context: loopId, workspaceId, selectedDocId in body or server fallback to query params
- [ ] 19-02: Plan-specific Forge tools: add_task, update_task_status, open_planning_doc (scoped to active loop)
- [ ] 19-03: LangGraph for planning assistant (feature-flagged): orchestration for planning workspace, multi-loop awareness, optional checkpoints

### Phase 20: Planning artifacts and todos in Repo Studio
**Goal:** DoD and HUMAN-TASKS first-class in Planning workspace; unified human/agent todo view with correlation; optional on-load planning prompt and human-blocker notifications.
**Depends on:** Phase 19 recommended first; can overlap with 16–18
**Plans:** 3 plans

Plans:
- [ ] 20-01: Add DoD and HUMAN-TASKS to planning snapshot (coreFiles); DoD panel and Human TODOs panel
- [ ] 20-02: Unified "My todos | Agent tasks" view with correlation (e.g. blocked by HT-xx)
- [ ] 20-03: Optional on-load Codex "what to do" prompt; optional human-blocker badge/notifications; document in DECISIONS

### Phase 21: Artifact layout and loop efficiency — planning
**Goal:** Decide and document artifact layout for users (which panels/groups, viewport vs tree) and loop efficiency (context, tools, cadence, handoffs). No code deliverables; output informs Phase 20 panel design and Phase 22 refactor.
**Depends on:** Phase 19 and 20 inform this; can run after or in parallel with 20
**Plans:** 2 plans

Plans:
- [ ] 21-01: Artifact layout for users: which artifacts in which panels/groups; viewport vs tree; align with panel discipline
- [ ] 21-02: Loop efficiency: context, tools, cadence and human/agent handoffs; optional checklist

### Phase 22: Workspace and panel design refactor — composition, chat-in-chat, fewer rails
**Goal:** Execute UX constraints: chat-in-chat (remove Copy @ from panels), panel discipline (reduce Planning left rail), tree as primary with context menu for structure actions.
**Depends on:** Phase 21 recommended first; Phase 20 can overlap
**Plans:** 3 plans

Plans:
- [ ] 22-01: Chat-in-chat: remove Copy @ (and similar) from panels; rely on @ in assistant composer; document in DECISIONS
- [ ] 22-02: Panel discipline: reduce Planning left rail (group/tab/collapse); align with Phase 21 artifact layout if done
- [ ] 22-03: Tree as primary: context menu (and optional toolbar) for structure actions; Story or Planning tree improvements as needed

### Phase 23: Repo review and cleanup — GSD/Cursor setup, analysis consolidation, layout and legacy
**Goal:** Align tooling (GSD + Cursor), consolidate or clarify analysis, document repo layout and legacy/.cursor hygiene.
**Depends on:** None; can run in parallel with 19–22
**Plans:** 3 plans

Plans:
- [ ] 23-01: GSD install and Cursor alignment (.gitignore .codex, Cursor rule, "Cursor with this repo" doc)
- [ ] 23-02: Analysis consolidation (audit, decide model, update ANALYSIS-LOOPS and ANALYSIS-REFERENCES)
- [ ] 23-03: Repo layout and legacy cleanup (expected layout doc, app wording, legacy/snapshots, .cursor/plans)

### Phase 24: Loop model and multi-loop
**Goal:** Document and implement loop hierarchy (new scope = new loop; when scope grows, loop can become child of a meta loop), fixed naming conventions for loop/planning docs, max doc size with contextual summarize/archive, and how Repo Studio and coding agents discover loop docs. May extend or align with Phase 21.
**Depends on:** Phase 21 recommended; can run in parallel with 22–23
**Plans:** 2 plans

Plans:
- [ ] 24-01: Loop hierarchy and naming: document when to create child loops; fixed naming conventions for GRD/PRD and loop folders; LOOPS.json and .planning/loops/<loopId> discoverability
- [ ] 24-02: Max doc size and summarize/archive: define max size for key planning docs; contextual summarize and archive behavior; wire or document existing mechanisms

### Phase 25: Game simulation workspace
**Goal:** Extension workspace "game simulation" with its own parser and doc writes; GRD + `.concept`; simulation entry point (e.g. agent.md) that scopes Codex to this workspace only; two-loop model (concept/simulation loop vs software/PRD loop) with handoff; one game loop + one PRD per workspace. Reference: `.tmp/dungeonbreak-docs-reference/` (from `pnpm reference:copy-dungeonbreak`).
**Depends on:** Phase 24 recommended (loop model); extension workspace pattern (e.g. Story)
**Plans:** 2 plans

Plans:
- [ ] 25-01: Game simulation workspace extension: register workspace; own parser and write path for docs; tree + viewport similar to Planning; fixed naming; `.concept` as project folder; simulation entry point for Codex
- [ ] 25-02: Two-loop handoff and scoping: concept/simulation loop (GRD, .concept) vs software/PRD loop; assistant scoped to game simulation workspace docs only during simulation; handoff from simulation to PRD

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
| 14. AI/chat-first hard-cut and consumer studio reference | 7/7 | Complete | 2026-02-26 |
| 15. Strategic shift — Repo Studio + Platform focus | 1/1+ | In progress | - |
| 16. Repo Studio canonical submodule | 0/2 | Pending | - |
| 17. Platform submodule and docs deploy | 0/4 | Pending | - |
| 18. Platform integration gateway | 0/3 | Pending | - |
| 19. Planning assistant context and tools | 0/3 | Pending | - |
| 20. Planning artifacts first-class (DoD, HUMAN-TASKS, panels, unified todos) | 0/3 | Pending | - |
| 21. Artifact layout and loop efficiency (planning) | 0/2 | Pending | - |
| 22. Workspace and panel design refactor | 0/3 | Pending | - |
| 23. Repo review and cleanup | 0/3 | Pending | - |
| 24. Loop model and multi-loop | 0/2 | Pending | - |
| 25. Game simulation workspace | 0/2 | Pending | - |
