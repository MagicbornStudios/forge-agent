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
| FRG-1521 | 15 | 15-09 | Complete | Desktop standalone reliability hardening complete: strict standalone gate enforced and packaging verified with bundled runtime web assets (`.desktop-build/next`). |
| FRG-1522 | 15 | 15-10 | Complete | Tag-driven GitHub desktop release workflow operational (`v*` tags) with verify -> windows package -> release publish jobs; artifact paths generalized for non-`v0.1.1` tags. |
| FRG-1523 | 15 | 15-10 | Complete | Release gate remediation: fixed `@forge/platform`/`@forge/docs` dependency matrix so both builds pass in release verification flow. |
| FRG-1524 | 15 | 15-10 | Complete | Published `vendor/repo-studio-extensions` updates to upstream `main` and prepared forge-agent submodule pointer update to pushed SHA. |
| FRG-1525 | 15 | 15-10 | Complete | Enforced hard desktop standalone gate for packaging (`--require-standalone` + `verify-standalone` checks + CI assertion before artifact upload). |
| FRG-1526 | 15 | 15-10 | Complete | Forge Agent release push cut complete: `main` includes desktop/guard hotfixes and `v0.1.2` release published successfully with Windows installer/portable artifacts. |
| FRG-1527 | 15 | 15-10 | Complete | Closeout artifacts sync complete: STATE/DECISIONS/ERRORS/STATUS updated with release outcomes, crash hotfix, and remaining CI rerun risk. |
| FRG-1528 | 15 | 15-10 | Complete | Desktop runtime hotfix: fixed packaged startup crash by bundling security modules and upgraded terminal PTY fallback to a real stream shell when `node-pty` is unavailable. |
| FRG-1529 | 15 | 15-10 | Complete | Semantic guard portability hardening: removed ripgrep runtime dependency by switching guard scripts to Node/git-file search fallback, fixing Windows + CI guard failures. |
| FRG-1530 | 15 | 15-10 | Complete | Phase 15 Windows desktop UX hardening complete: guided installer, visible startup crash diagnostics, packaged EXE smoke-launch gate, and next artifact version aligned to `0.1.3`. |
| FRG-1531 | 15 | 15-10 | Complete | Phase 15 desktop onboarding/debug UX completed: temporary branding/logo, splash loading window, first-run setup flow with dependency checks, `--safe-mode`, and `--verbose-startup`; validated with fresh `desktop:package:win` and portable EXE smoke launch. Code signing remains deferred pending certificate ownership. |
| FRG-1532 | 15 | 15-10 | Complete | Installer branding/path polish: NSIS attended install now normalizes legacy default install folder from `@forgerepo-studio` to `RepoStudio`, preserves custom paths, and aligns shortcut/uninstall display names. |
| FRG-1533 | 15 | 15-10 | Complete | Published RepoStudio `v0.1.4` follow-up release: desktop package bumped to `0.1.4`, Windows artifacts rebuilt, and a new GitHub release is live so the default install path fix reaches downloadable installers. |
| FRG-1534 | 15 | 15-10 | In progress | Fix post-publish desktop readiness defects: registry-based install validation + CI timeout hardening completed; this slice adds CI/release guard relaxation (workspace-semantics removed), packageManager pin verification before install, failure artifact uploads, installed-runtime readiness probe (health + runtime deps + codex CLI), and reclaim child-process lineage safety (only descendants of verified RepoStudio/Codex roots are auto-targeted). |
| FRG-1601 | 16 | 16-01 | Pending | Add submodule vendor/repo-studio → MagicbornStudios/RepoStudio; update .gitmodules. |
| FRG-1602 | 16 | 16-01 | Pending | Release workflow: init vendor/repo-studio in verify and package_windows jobs. |
| FRG-1603 | 16 | 16-01 | Pending | Verify: Repo on GitHub and pullable; document. |
| FRG-1604 | 16 | 16-01 | Pending | Verify: git submodule update --init vendor/repo-studio works from fresh clone. |
| FRG-1605 | 16 | 16-01 | Pending | Verify: With submodule present, pnpm install and Repo Studio app build succeed. |
| FRG-1606 | 16 | 16-01 | Pending | Document: Repo Studio canonical source = MagicbornStudios/RepoStudio; submodule at vendor/repo-studio. |
| FRG-1610 | 16 | 16-02 | Pending | Integrate vendor/repo-studio into pnpm workspace (or document required submodule layout). |
| FRG-1611 | 16 | 16-02 | Pending | Update next-server.mjs and build.mjs to resolve app root from submodule. |
| FRG-1612 | 16 | 16-02 | Pending | Release workflow: run desktop build from submodule. |
| FRG-1613 | 16 | 16-02 | Pending | Remove or archive apps/repo-studio and packages/repo-studio; update scripts/guards/docs. |
| FRG-1614 | 16 | 16-02 | Pending | Verification: full release path produces .exe from submodule; update STATE/DECISIONS. |
| FRG-1701 | 17 | 17-01 | Pending | Add submodule vendor/platform → RepoStudio-Platform; update .gitmodules. |
| FRG-1702 | 17 | 17-01 | Pending | Release workflow: init vendor/platform in verify job (and optionally build platform from submodule or document that platform build is in its repo). |
| FRG-1703 | 17 | 17-01 | Pending | Verify platform submodule clone and build (from submodule or from RepoStudio-Platform repo). |
| FRG-1704 | 17 | 17-02 | Pending | Docs site: Vercel-ready (build/root/framework); document Vercel project setup for docs from forge-agent. |
| FRG-1705 | 17 | 17-02 | Pending | Deploy docs app to Vercel (from forge-agent); record docs URL for env matrix. |
| FRG-1706 | 17 | 17-03 | Pending | Document platform Vercel deploy from RepoStudio-Platform repo; env NEXT_PUBLIC_DOCS_APP_URL (and related) set to docs site URL. |
| FRG-1707 | 17 | 17-03 | Pending | Remove or archive apps/platform from forge-agent once platform submodule is canonical; update release workflow and guards. |
| FRG-1708 | 17 | 17-04 | Pending | Deployment matrix doc: docs (Vercel), platform (Vercel), npm, Electron (Releases); repos and env/URL matrix; update STATE/DECISIONS. |
| FRG-1801 | 18 | 18-01 | Pending | Platform: add Open Router proxy endpoint(s); forward to Open Router with OPENROUTER_API_KEY. |
| FRG-1802 | 18 | 18-01 | Pending | Platform: gate proxy on valid desktop/platform auth. |
| FRG-1803 | 18 | 18-01 | Pending | Repo Studio: when capabilities.openRouterProxy, call platform proxy for assistant chat. |
| FRG-1804 | 18 | 18-02 | Pending | Platform: add extension-fetch endpoint; use platform-held GitHub token for RepoStudio-Extensions. |
| FRG-1805 | 18 | 18-02 | Pending | Platform: gate extension-fetch on valid desktop/platform auth. |
| FRG-1806 | 18 | 18-02 | Pending | Repo Studio: when capabilities.extensionInstallProxy and no user GitHub token, call platform extension endpoint. |
| FRG-1807 | 18 | 18-03 | Pending | Platform: add openRouterProxy and extensionInstallProxy to auth/status response capabilities. |
| FRG-1808 | 18 | 18-03 | Pending | Repo Studio: extend RepoAuthStatusResponse.capabilities type; wire to 18-01/18-02 client behavior; docs. |
| FRG-1901 | 19 | 19-01 | Pending | Server: fallback to url.searchParams for loopId, workspaceId (and optionally selectedDocId) when missing from body. |
| FRG-1902 | 19 | 19-01 | Pending | Optional: Client send loopId, workspaceId, selectedDocId in POST body; document in DECISIONS. |
| FRG-1903 | 19 | 19-02 | Pending | Implement add_task Forge tool; resolve planning root from loopId, write back. |
| FRG-1904 | 19 | 19-02 | Pending | Implement update_task_status Forge tool; parse task table, update status, write back. |
| FRG-1905 | 19 | 19-02 | Pending | Implement open_planning_doc Forge tool; client handles open/focus. Wire plan tools to contract; DECISIONS. |
| FRG-1906 | 19 | 19-03 | Pending | Add feature flag and LangGraph planning path in Repo Studio assistant-chat Forge handler. |
| FRG-1907 | 19 | 19-03 | Pending | LangGraph nodes: planning_context, route, tools, generate/stream; optional checkpoints. |
| FRG-1908 | 19 | 19-04 | Pending | Pass contract and toolsEnabled for Codex runtime (same as Forge) in AssistantPanel. |
| FRG-1909 | 19 | 19-04 | Pending | Add getToolSchemas() or toolsToRequestSchema(contract) helper; use in Forge path and startCodexTurn. |
| FRG-1910 | 19 | 19-04 | Pending | Handle event.type === 'event' in streamFromCodexTurn; forward tool/invoke as data-domain-tool-invoke. |
| FRG-1911 | 19 | 19-04 | Pending | Add useToolInvocationListener or equivalent for Codex tool execution on client. |
| FRG-1912 | 19 | 19-04 | Pending | Extend startCodexTurn to accept and pass tools param (when app-server + tools enabled). |
| FRG-1913 | 19 | 19-04 | Complete | Document ASSISTANT-RUNTIME-STRATEGY.md with full design, divergence points, and data stream evaluation. |
| FRG-2001 | 20 | 20-01 | Pending | Add DEFINITION-OF-DONE.md and HUMAN-TASKS.md to coreFiles in repo-data collectPlanningDocs; ensure snapshot includes them. |
| FRG-2002 | 20 | 20-01 | Pending | Add DoD panel (or DoD section) in Planning workspace; display DoD content / link to doc. |
| FRG-2003 | 20 | 20-01 | Pending | Add Human TODOs panel; display HUMAN-TASKS content; optional rail badge for open human task count. |
| FRG-2004 | 20 | 20-02 | Pending | Unified view: "My todos" (HUMAN-TASKS) and "Agent tasks" (TASK-REGISTRY) in one panel or tabbed section. |
| FRG-2005 | 20 | 20-02 | Pending | Correlation: show "blocked by HT-xx" on agent tasks when referenced in notes/spec. |
| FRG-2006 | 20 | 20-03 | Pending | Planning welcome default OFF; show suggested prompts to get started (no auto-send); optional setting to enable welcome. |
| FRG-2007 | 20 | 20-03 | Pending | Badges for HUMAN-TASKS open items; status strip (rotating currently running); task completion notifications; toast-type settings (settings UI/codegen). |
| FRG-2008 | 20 | 20-03 | Pending | Configurable planning scan/parse interval in settings (default ~30s; min/max in DECISIONS); use existing settings registry/codegen. |
| FRG-2009 | 20 | 20-03 | Pending | Chat contract: document and review (what server receives, prefill, suggested prompts, what appears in chat); capture decisions and open questions in DECISIONS. |
| FRG-2101 | 21 | 21-01 | Pending | Document artifact layout decisions: which artifacts in which panels/groups; viewport vs tree; align with panel discipline. |
| FRG-2102 | 21 | 21-01 | Pending | Optional: Add short artifact layout spec or DECISIONS entry for Planning workspace panel-to-artifact mapping. |
| FRG-2105 | 21 | 21-01 | Pending | Document user workflow: blocking visibility, notifications (human-blocked, execution/other loops), what appears in chat, and how layout supports it. |
| FRG-2106 | 21 | 21-01 | Pending | Document badge placement (task list, phase list, tree) and hover popup + click-to-open-doc behavior. |
| FRG-2103 | 21 | 21-02 | Pending | Document loop efficiency decisions: context, tools, cadence and human/agent handoffs; reference Phase 19, HUMAN-TASKS, DoD. |
| FRG-2104 | 21 | 21-02 | Pending | Optional: Add loop efficiency checklist or DECISIONS entry for agents and Codex. |
| FRG-2201 | 22 | 22-01 | Pending | Remove Copy @ token and Open in Assistant (or equivalent) buttons from PlanningPanel and PlanningDocumentsPanel. |
| FRG-2202 | 22 | 22-01 | Pending | Remove or deprecate onCopyMentionToken from panelContext/workspace types if unused; add DECISIONS entry for chat-in-chat. |
| FRG-2203 | 22 | 22-02 | Pending | Decide grouping approach for Planning left rail per Phase 21; document in DECISIONS. |
| FRG-2204 | 22 | 22-02 | Pending | Refactor Planning left rail: implement grouping/tabs/collapse; update layout definitions and PlanningWorkspace. |
| FRG-2205 | 22 | 22-03 | Pending | Add context menu to tree panel(s): structure actions (e.g. New file, Open) where applicable; Story and/or Planning Documents. |
| FRG-2206 | 22 | 22-03 | Pending | Optional: Story workspace — tree-based navigation instead of or in addition to table; document in DECISIONS. |
| FRG-2301 | 23 | 23-01 | Pending | Add .codex/ to .gitignore; verify pnpm gsd:install runs and populates .codex/. |
| FRG-2302 | 23 | 23-01 | Pending | Add Cursor rule: .planning source of truth, forge-loop doctor/progress/sync-legacy, phase workflow. |
| FRG-2303 | 23 | 23-01 | Pending | Document "Using Cursor with this repo" in 18-agent-artifacts-index or how-to. |
| FRG-2304 | 23 | 23-02 | Pending | Audit: list analysis folders and files; compare to ANALYSIS-LOOPS and ANALYSIS-REFERENCES; note referenced vs obsolete. |
| FRG-2305 | 23 | 23-02 | Pending | Decide model (consolidate/archive/trim); update ANALYSIS-LOOPS and ANALYSIS-REFERENCES; document in DECISIONS. |
| FRG-2306 | 23 | 23-03 | Pending | Document expected repo layout in AGENTS or 18-agent-artifacts-index; fix "app" wording in docs. |
| FRG-2307 | 23 | 23-03 | Pending | Document legacy/snapshots; .cursor/plans hygiene (note + optional archive). |
