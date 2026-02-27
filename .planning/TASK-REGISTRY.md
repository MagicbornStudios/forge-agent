# Task Registry

| Task ID | Phase | Plan | Status | Notes |
|---|---|---|---|---|
| FRG-201 | 02 | 02-01 | Complete | Split `forge-env` engine into modular libraries with compatibility facade. |
| FRG-202 | 02 | 02-01 | Complete | Added workspace discovery + mismatch diagnostics in env command outputs. |
| FRG-203 | 02 | 02-02 | Complete | Delivered `@forge/repo-studio` package runtime, CLI, resolver diagnostics, and command policy persistence. |
| FRG-204 | 02 | 02-02 | Complete | Implemented Env + Commands workspaces with filter/search/tabs, enable/disable toggles, and run history. |
| FRG-205 | 02 | 02-03 | Complete | Delivered Dockview panel-rail parity, persistent app-shell state, settings-only sidebar, and shared assistant/planning feature modules. |
| FRG-206 | 02 | 02-04 | Complete | Finalized loop analytics/readiness quality gates and generated `02-04-SUMMARY.md`. |
| FRG-207 | 02 | 02-04 | Complete | Added loop-index + loop command coverage and closed release-quality checks for Phase 02. |
| FRG-208 | 02 | 02-05 | Complete | Unblocked RepoStudio app builds (Dockview dependency + shared showcase typing fixes) and stabilized runtime parity surfaces. |
| FRG-209 | 02 | 02-05 | Complete | Added app runtime parity routes: command list/toggle/view, run start/stream/stop, codex status/start/stop. |
| FRG-210 | 02 | 02-06 | Complete | Hardened command center UX with tabs/filter/status sorting, allow-disable toggles, and explicit stop controls. |
| FRG-211 | 02 | 02-07 | Complete | Added Codex-first assistant flow with strict ChatGPT auth checks and CLI lifecycle commands. |
| FRG-212 | 02 | 02-07 | Complete | Added runner-aware env gate outputs and forwarded runner from Forge Loop headless flows. |
| FRG-213 | 02 | 02-07 | Complete | Updated package runbooks/docs and extended verification coverage for Codex readiness and runner-aware gating paths. |
| FRG-301 | 03 | 03-01 | Complete | Added multi-loop index/commands (`loop:list`, `loop:new`, `loop:use`) and `--loop` lifecycle resolution in Forge Loop CLI. |
| FRG-302 | 03 | 03-01 | Complete | Added RepoStudio loop APIs and planning loop switcher wired to loop-scoped snapshots. |
| FRG-303 | 03 | 03-02 | Complete | Added codex session/turn/proposal APIs and assistant-stream integration with app-server-first transport. |
| FRG-304 | 03 | 03-03 | Complete | Added read-first Monaco diff panel + attach-to-assistant context action and loop-aware file APIs. |
| FRG-305 | 03 | 03-03 | Complete | Expanded integration coverage for loop switching + codex app-server fallback/review-queue policy in app and package runtimes. |
| FRG-306 | 03 | 03-03 | Complete | Added Review Queue + Code workspaces with approval-gated writes and assistant context attach actions. |
| FRG-307 | 03 | 03-04 | Complete | Completed assistant route split, local loop-assistant runtime fallback, and codex turn scope context forwarding. |
| FRG-308 | 03 | 03-04 | Complete | Added story/scope/git API parity surfaces and validated app + package runtime test/build flows. |
| FRG-401 | 04 | 04-01 | Complete | Story parser/canonical create invariants landed; story workspace flows validated with structured UI surfaces. |
| FRG-402 | 04 | 04-02 | Complete | Hard scope guard + TTL override lifecycle enforced across codex/file/proposal paths. |
| FRG-403 | 04 | 04-03 | Complete | Story/Git/Diff are dock-parity workflows with reusable scoped diff presets. |
| FRG-404 | 04 | 04-04 | Complete | Story-domain runbooks and regression coverage landed; phase summaries generated. |
| FRG-405 | 04 | 04-04 | Complete | `@forge/studio` strict gate blockers were fixed and Phase 04 strict verify passed. |
| FRG-501 | 05 | 05-01 | Complete | Added Payload+SQLite settings persistence (`repo-settings-overrides`) and app settings APIs (`snapshot|upsert|reset|export`). |
| FRG-502 | 05 | 05-02 | Complete | Added RepoStudio settings registry/provider flow, generated defaults alignment, and deterministic settings-codegen test. |
| FRG-503 | 05 | 05-03 | Complete | Added `forge-env target-read/target-write`, mode-scoped write validation, and RepoStudio env target API integration. |
| FRG-504 | 05 | 05-04 | Complete | Refactored Env workspace to structured per-key editor with scope filter, paste/import, changed-files summary, and post-save readiness cards. |
| FRG-601 | 06 | 06-01 | Complete | Added per-workspace menu contribution registry and routed RepoStudio menubar construction through workspace contribution contracts. |
| FRG-602 | 06 | 06-02 | Complete | Added Navigator foundation in Code workspace and migrated feature networking to typed client services/hooks. |
| FRG-603 | 06 | 06-03 | Complete | Added safe server-side repository search API (`q|regex|include|exclude|scope`) with include/exclude validation and typed client integration. |
| FRG-604 | 06 | 06-04 | Complete | Added git-status decorations in file selection flows and warning-only direct-fetch guard script for app client layer policy. |
| FRG-701 | 07 | 07-01 | Complete | Added shared parser core in `packages/repo-studio/src/core/parsers` (`parsePlanningMarkdown`, `parsePlanningPlanDoc`) and planning model API (`GET /api/repo/planning/model`). |
| FRG-702 | 07 | 07-02 | Complete | Added deterministic markdown-to-block transformer (`parseStoryMarkdownToBlocks`) with stable block ids/hashes and parser fixtures in `@forge/repo-studio` tests. |
| FRG-703 | 07 | 07-03 | Complete | Added story publish preview/queue/apply services + routes and local Payload collections (`repo-pages`, `repo-blocks`) with hash-aware idempotent apply. |
| FRG-704 | 07 | 07-04 | Complete | Wired publish preview/queue/apply controls into Story workspace and review-queue apply path; added non-interactive lint config and updated story publish runbook. |
| FRG-801 | 08 | 08-01 | Complete | Added Electron runtime shell modules (`main/preload/boot/next-server`) and desktop lifecycle wiring in `forge-repo-studio open/status/stop`. |
| FRG-802 | 08 | 08-02 | Complete | Added shared SQLite path resolver with desktop `userData` strategy and writable-path diagnostics in doctor output. |
| FRG-803 | 08 | 08-03 | Complete | Added native watcher service (`chokidar`) with polling fallback and typed IPC invalidation events. |
| FRG-804 | 08 | 08-04 | Complete | Added electron-builder packaging scripts/config, desktop runbooks, and Windows-first desktop build pipeline scaffolding. |
| FRG-901 | 09 | 09-01 | Complete | Extended Studio API-key scopes to `repo-studio.*|connect|read|write` and added desktop connection validation endpoint with capability payload. |
| FRG-902 | 09 | 09-02 | Complete | Implemented desktop token lifecycle with secure credential storage fallback strategy. |
| FRG-903 | 09 | 09-03 | Complete | Added desktop connection status + remediation UX in RepoStudio settings. |
| FRG-904 | 09 | 09-04 | Complete | Hardened security/runbooks for desktop auth + platform connection flow. |
| FRG-1001 | 10 | 10-01 | Complete | Added path-based `@forge/repo-studio-app build` gating to Forge Loop verify-work and test coverage for RepoStudio change detection. |
| FRG-1002 | 10 | 10-02 | Complete | Extended package/app dependency health with CSS package resolvability checks and surfaced results in doctor/API/UI diagnostics. |
| FRG-1003 | 10 | 10-03 | Complete | Added root `predev:repo-studio` doctor precheck and documented fail-fast remediation flow in RepoStudio runbooks. |
| FRG-1004 | 10 | 10-04 | Complete | Added minimal CI workflow (`.github/workflows/ci.yml`) and codified CSS import dependency guard rules in AGENTS + errors-and-attempts docs. |
| FRG-1101 | 11 | 11-01 | Complete | Refactored proposal store to repository abstraction with SQLite (`repo-proposals`) canonical storage, idempotent JSON import, and read-only JSON fallback semantics. |
| FRG-1102 | 11 | 11-02 | Complete | Added proposal diff parser and new APIs (`diff-files`, `diff-file`) with typed client/service contracts for Review Queue file-level patch reads. |
| FRG-1103 | 11 | 11-03 | Complete | Upgraded Review Queue to one-file Monaco diff UX and wired global trust-mode (`require-approval|auto-approve-all`) with scope-safe auto-apply. |
| FRG-1104 | 11 | 11-04 | Complete | Closed docs/tests/verification for Phase 11 and published summaries + decision/error trace updates. |
| FRG-1201 | 12 | 12-01 | Complete | Runtime provider abstraction and config normalization (`runtime.mode|runtime.codex.*`) with compatibility for legacy string runtime values. |
| FRG-1202 | 12 | 12-02 | Complete | Codex app-server runner core with structured event capture into `.planning/runs/*.jsonl`. |
| FRG-1203 | 12 | 12-03 | Complete | Add `forge-loop interactive` Ink TUI command for single-loop sequential Ralph flow execution. |
| FRG-1204 | 12 | 12-04 | Complete | Wire stage commands to runner resolver and codex task-result semantics while preserving prompt-pack behavior. |
| FRG-1205 | 12 | 12-05 | In progress | Docs/tests/verification closeout and Phase 12 summary artifacts. |
| FRG-1301 | 13 | 13-01 | Complete | Retrospective: Phase 13 in ROADMAP, AI runtimes tasks in TASK-REGISTRY, sync-legacy, STATUS/DECISIONS updated for phase-tracked work. |
| FRG-1302 | 13 | 13-02 | Complete | Database workspace: embedded Drizzle Studio; remove custom SQL runner, better-sqlite3, POST /api/repo/db/query. |
| FRG-1401 | 14 | 14-01 | Complete | Added shared canonical AssistantPanel and removed app-local AssistantRuntimeProvider/useChatRuntime wrappers from Studio/Repo Studio. |
| FRG-1402 | 14 | 14-02 | Complete | Hard-cut Repo Studio assistant contracts to `assistantTarget`, inlined workspace panel JSX composition, and added companion CORS OPTIONS/headers. |
| FRG-1403 | 14 | 14-03 | Complete | Added shared companion runtime store/switch/useCompanionAssistantUrl and migrated Studio to shared companion primitives. |
| FRG-1404 | 14 | 14-04 | Complete | Removed `examples/consumer`, added `apps/consumer-studio`, and added AI/chat-first semantic guard scripts wired to lint/CI. |
| FRG-1405 | 14 | 14-05 | Complete | Extensions-first hard cut: removed static Story registration, added `.repo-studio/extensions` discovery/catalog, removed Planning/Story loop switchers, and wired active-workspace Forge extension tool proof (`forge_open_about_workspace`). |
| FRG-1406 | 14 | 14-06 | Complete | Repo Studio product hard cut: built-in workspaces reduced to planning/env/database/git/code, assistant moved to global right panel, terminal moved to global bottom dock with launch profiles, planning gained PRD/status/decisions/regression panels, and git execution moved to shared Windows-first resolver. |
| FRG-1407 | 14 | 14-07 | Complete | Extension layout consolidation hard cut: generated extension layout definitions, project-scoped registry install flow, and built-in Extensions workspace (Story-specific prompt removed in Phase 15 cut). |
| FRG-1501 | 15 | 15-01 | In progress | Archive Studio app: document, mark archived in ROADMAP/STATE/docs; add `apps/studio/ARCHIVED.md` and `apps/consumer-studio/ARCHIVED.md`. |
| FRG-1502 | 15 | 15-02 | Pending | Rescoped: Character moved to RepoStudio-Extensions as studio example (`examples/studios/character-workspace`), not installable runtime extension. |
| FRG-1503 | 15 | 15-02 | Pending | Add Character extension to extensions repo/submodule; document install and manifest. |
| FRG-1504 | 15 | 15-03 | Pending | Rescoped: Dialogue moved to RepoStudio-Extensions as studio example (`examples/studios/dialogue-workspace`), not installable runtime extension. |
| FRG-1505 | 15 | 15-03 | Pending | Add Dialogue extension to extensions repo; document; deprecate Yarn Spinner in platform docs. |
| FRG-1506 | 15 | 15-04 | Pending | Rescoped: consumer-studio moved as `assistant-only` studio example (`examples/studios/assistant-only`), non-installable. |
| FRG-1507 | 15 | 15-04 | Pending | Move consumer-studio surface to extensions repo; update monorepo and docs. |
| FRG-1508 | 15 | 15-05 | Pending | Document platform deprecations (forge graphs, Yarn Spinner) and Repo Studio–first roadmap. |
| FRG-1509 | 15 | 15-05 | Pending | Audit platform API surface; optional: add requirement for platform Repo Studio support. |
| FRG-1510 | 15 | 15-01 | In progress | Phase 15 plan 01 documentation pass: master plan, CONTEXT, PRD, ROADMAP, DECISIONS, TASK-REGISTRY, STATE updated. |
| FRG-1511 | 15 | 15-06 | In progress | Repo Studio extension registry split: installables vs studio examples APIs/types/UI; remove story-specific install prompt. |
| FRG-1512 | 15 | 15-06 | In progress | Submodule sync and content publish: installable `story` + studio examples (`character-workspace`, `dialogue-workspace`, `assistant-only`). |
| FRG-1513 | 15 | 15-07 | Complete | Repo Studio extraction cut complete: Story/Env renderers moved to `@forge/repo-studio-extension-adapters`; app-local Story/Env/Generic extension workspace files removed from Repo Studio app folder. |
| FRG-1514 | 15 | 15-07 | Complete | Built-in hard cut complete: built-ins now `planning/extensions/database/git/code`; added legacy `env` -> installed `env-workspace` alias route sanitization. |
| FRG-1515 | 15 | 15-07 | Complete | `apps/studio` and `apps/consumer-studio` moved to `legacy/studio-apps/*`; root scripts switched to Repo Studio-first active flows. |
| FRG-1516 | 15 | 15-07 | Complete | Verification/docs/guard closeout complete: build/tests/guard/registry health pass; hydration doctor updated to active app roots after legacy move. |
| FRG-1517 | 15 | 15-08 | Complete | Dev-kit surface alignment: moved `WorkspaceViewport` into `@forge/shared` and updated Repo Studio + extension adapters + shell tests to consume shared export. |
| FRG-1518 | 15 | 15-08 | Complete | Extensions authoring docs refresh: updated `vendor/repo-studio-extensions/README.md` and `docs/repo-studio-extensions.md` with dev-kit contract, install location, and edit-in-place flow. |
| FRG-1519 | 15 | 15-08 | Complete | Extension recognition hardening landed: extension APIs are no-store, root refresh preserves installed extensions on transient failures, and focus/visibility refresh picks up in-place extension edits reliably. |
| FRG-1520 | 15 | 15-09 | Complete | First Electron packaging cut completed for Repo Studio: produced Windows installer + portable artifacts under `packages/repo-studio/dist/desktop`. |
| FRG-1521 | 15 | 15-09 | In progress | Desktop standalone reliability hardening: remove fallback-only packaging path by resolving Next standalone symlink limitations and ensuring packaged app bundles runtime web assets (`.desktop-build/next`). |
| FRG-1522 | 15 | 15-10 | In progress | Add tag-driven GitHub release workflow for Repo Studio desktop artifacts (`v*` tags) with verify -> windows package -> release publish jobs. |
| FRG-1523 | 15 | 15-10 | Complete | Release gate remediation: fixed `@forge/platform`/`@forge/docs` dependency matrix so both builds pass in release verification flow. |
| FRG-1524 | 15 | 15-10 | Complete | Published `vendor/repo-studio-extensions` updates to upstream `main` and prepared forge-agent submodule pointer update to pushed SHA. |
| FRG-1525 | 15 | 15-10 | Complete | Enforced hard desktop standalone gate for packaging (`--require-standalone` + `verify-standalone` checks + CI assertion before artifact upload). |
| FRG-1526 | 15 | 15-10 | In progress | Forge Agent release push cut: single commit to `main`, annotated tag `v0.1.1`, and GitHub Release publication verification. |
| FRG-1527 | 15 | 15-10 | Pending | Closeout artifacts sync: update STATE/DECISIONS/ERRORS/STATUS for release cut outcomes and remaining risks. |
