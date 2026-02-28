# Decisions

## 2026-02-28

- [x] pnpm version is pinned via `packageManager` in root package.json; local dev uses Corepack; CI uses same version via pnpm/action-setup (reads from package.json).
- [x] Desktop release smoke uses Node `smoke-install.mjs` in CI; registry-based install-location detection on Windows; health poll 6 min for low-RAM runners.
- [x] `guard:workspace-semantics` is removed from CI/release gating (manual/local guard only) to prioritize desktop release reliability while keeping `guard:assistant-canonical` enforced.
- [x] CI/release workflows now explicitly verify `pnpm --version` matches root `packageManager` before `pnpm install --frozen-lockfile`.
- [x] Desktop release flow now captures downloadable failure diagnostics (`repostudio-smoke-result*.json`, runtime probe output, and desktop startup logs) and adds a post-install runtime-readiness probe (`/api/repo/health`, `/api/repo/runtime/deps`, `/api/repo/codex/session/status`).
- [x] Process reclaim safety now uses process lineage: child processes are reclaimed only when they descend from verified RepoStudio/Codex root processes (tracked PID + safe-port/ownership checks), preventing broad kill-by-name behavior against unrelated user terminals/services.

## 2026-02-13

- [x] RepoStudio remains package-first with CLI/runtime (`forge-repo-studio open|doctor|run`) and keeps `--legacy-ui` as fallback.
- [x] RepoStudio command execution uses allowlist + confirm + per-command local disable overrides (`.repo-studio/local.overrides.json`).
- [x] Forge Loop workspace in RepoStudio consumes `forge-loop progress --json` and `.planning` analytics for next-action routing.
- [x] Studio-grade app parity (dock layouts, settings/codegen parity, shared assistant panel reuse) is tracked and delivered through Phase 02 Plan 03.

## 2026-02-14

- [x] RepoStudio runtime lifecycle is controlled by `.repo-studio/runtime.json` plus `forge-repo-studio status|stop`, with port-based recovery for stale/untracked processes.
- [x] `forge-env portal` delegates to `forge-repo-studio open --view env --reuse` and reports URL/PID/runtime mode.
- [x] RepoStudio app runtime defaults to planning-first workspace with manual planning-doc attachment context for assistant conversations.
- [x] RepoStudio codex mode is hybrid CLI + SDK-style adapter and enforces `chatgpt-strict` auth policy before codex execution.
- [x] Forge Loop remains agent-agnostic while Forge Env/RepoStudio carry runner-specific readiness and codex-first operational guidance.
- [x] Dockview/style dependency checks are now first-class health contracts (`/api/repo/runtime/deps` and `forge-repo-studio doctor --json`) with shared `editor-surface.css` imports across Studio + RepoStudio.
- [x] Forge Loop multi-loop model is hybrid index + loop dirs (`.planning/LOOPS.json` + `.planning/loops/<loop-id>`), with lifecycle loop selection via `--loop`.
- [x] RepoStudio assistant model is dual-editor (`loop-assistant`, `codex-assistant`) with editor-targeted routing and codex app-server-first readiness checks.
- [x] RepoStudio diff tooling is read-first (Monaco diff + attach-to-assistant context) with write/apply still approval-gated and CLI-led.
- [x] RepoStudio codex assistant route now streams AI SDK UI message events and maps codex approval requests into a persisted review queue (`.repo-studio/proposals.json`) before any apply action.
- [x] RepoStudio code editing path stays manual-write by default with explicit approval flag (`approved=true`) and separate assistant proposal apply/reject actions.
- [x] Package runtime exposes codex session/turn/proposal/file contract endpoints for compatibility, while app runtime remains the full-parity primary path.
- [x] Loop assistant and Codex assistant are hard-separated by `editorTarget`; loop assistant never auto-falls into codex mode.
- [x] RepoStudio now provides a local shared-runtime loop-assistant fallback for repo-only operation when no external proxy endpoint is configured.
- [x] Story domain defaults are locked to `content/story` with hard scope policy and explicit TTL scope override tokens.
- [x] Story and Git workflows are first-class dock panels in RepoStudio and remain approval-gated for assistant-generated writes.

## 2026-02-15

- [x] Analysis ingestion is now a first-class planning input, with source traceability captured in `.planning/ANALYSIS-REFERENCES.md` instead of copying full analysis content into `.planning`.
- [x] Roadmap history remains intact; future direction is appended as new phases 05-09 (A-E mapping) after Phase 04.
- [x] Phase 04 is an execution gate: no Phase 05 implementation begins until 04-01 through 04-04 are complete and strict verification closes.
- [x] Strict verification policy remains unchanged; baseline failures are fixed at source (`@forge/studio` build/test blockers) rather than bypassed.

## 2026-02-16

- [x] Plan frontmatter validation now accepts YAML block arrays for `depends_on` and `files_modified`; inline-only parsing is no longer required.
- [x] `@forge/studio` build stability uses robust config hardening (`optimization.realContentHash = false`) to prevent intermittent webpack hash crashes from undefined asset sources.
- [x] Phase 04 is closed after strict verification pass; Phase 05 becomes the active execution gate.
- [x] RepoStudio Phase 05 settings persistence is app-runtime hard-cutover: app settings now persist through Payload+SQLite APIs (`snapshot|upsert|reset|export`) with no local-overrides file dependency.
- [x] RepoStudio settings sidebar now uses a declarative registry/provider flow with deterministic generated defaults verification (`test:settings-codegen`).
- [x] Forge Env now exposes target-scoped read/write commands (`target-read`, `target-write`) and enforces deterministic headless write blocking with actionable error payloads.
- [x] RepoStudio Env workspace is now editor-first (target/mode/scope controls, per-key editing, paste import, changed-file summary, post-save readiness cards), while raw output remains debug-only.
- [x] Phase 05 is closed after strict verification pass; next execution gate advances to Phase 06.
- [x] Phase 06 UI networking now routes through typed API clients/services; component-level direct `fetch` calls are removed from migrated RepoStudio workspaces/hooks.
- [x] RepoStudio search baseline uses `GET /api/repo/search` with validated `q|regex|include|exclude|scope` inputs and ripgrep-backed server execution (no default exclude policy).
- [x] Phase 06 is closed after strict verification pass; next execution gate advances to Phase 07.
- [x] Phase 07 parser foundation is shared in `@forge/repo-studio` core modules (`packages/repo-studio/src/core/parsers`) and consumed by app runtime adapters/routes.
- [x] Story publish target for Phase 07 is RepoStudio-local Payload+SQLite collections (`repo-pages`, `repo-blocks`) with hash-aware idempotent apply.
- [x] Story publish flow is approval-gated (`preview -> queue -> apply`) and integrates with existing review queue semantics (`kind=story-publish`) instead of bypassing proposal controls.
- [x] RepoStudio lint is now non-interactive with local ESLint config, while retaining strict warning/error reporting in CI-style runs.
- [x] Phase 07 is closed after `forge-loop verify-work 07 --strict`; next execution gate advances to Phase 08.

## 2026-02-17

- [x] Phase 08 desktop runtime mode is embedded Next server + Electron host, implemented inside `@forge/repo-studio` (`src/desktop/*`) and launched through `forge-repo-studio open --desktop-runtime`.
- [x] Runtime lifecycle contract is extended to `mode=desktop` with tracked `serverPid` and `electronPid` metadata in `.repo-studio/runtime.json`; `status` and `stop` now handle desktop mode natively.
- [x] SQLite runtime strategy is split by mode: repo-local path for web/app/package runtime and Electron `userData` path for desktop runtime via shared resolver module.
- [x] Desktop watcher strategy is native-first (`chokidar`) with automatic polling fallback and typed invalidation events (`treeChanged`, `searchInvalidated`, `gitStatusInvalidated`, `watcherHealth`).
- [x] Desktop packaging is Windows-first via `electron-builder`, with cross-platform scaffolding retained and operator scripts/docs added under `@forge/repo-studio`.
- [x] Doctor readiness treats `nextStandalonePresent` as diagnostic (not a hard blocker) so desktop dev-fallback remains operable on Windows environments where standalone artifact linking fails.
- [x] Phase 10 adopts path-based verification gating: `forge-loop verify-work` runs `pnpm --filter @forge/repo-studio-app build` only when `apps/repo-studio/**` or `packages/repo-studio/**` changed.
- [x] RepoStudio dependency health now treats `tw-animate-css` and `tailwindcss-animate` resolvability as first-class checks (`cssPackagesResolved`, `cssPackageStatus`) across package doctor and app runtime deps API.
- [x] Local RepoStudio dev startup is fail-fast by default via root `predev:repo-studio` (`pnpm forge-repo-studio doctor`) before `dev:repo-studio`.
- [x] Minimal CI baseline is now mandatory (`.github/workflows/ci.yml`) for install + RepoStudio build/lint + Forge Loop/Env/RepoStudio package tests.
- [x] Phase 11 starts with app-runtime-first Review Queue hardening: proposals migrate to Payload+SQLite (`repo-proposals`) as canonical source, with one-time JSON import and read-only JSON fallback.
- [x] Review Queue trust policy default remains `require-approval`; `auto-approve-all` is supported and performs full auto-apply while still enforcing hard scope guard.
- [x] Review Queue diff UX target for Phase 11 is one-file-at-a-time Monaco patch inspection backed by typed proposal diff APIs (`/api/repo/proposals/diff-files`, `/api/repo/proposals/diff-file`).
- [x] Proposal queue list responses are now loop-scoped (`loopId` query) and include trust metadata (`trustMode`, `autoApplyEnabled`, `lastAutoApplyAt`) for UI policy visibility.
- [x] Auto-approve pipelines are implemented at proposal ingestion boundaries (Codex approval requests and story publish queue), not as a background poller, to keep scope enforcement and approval transitions deterministic.
- [x] Phase 12 is opened as an additive CLI extension: keep existing `forge-loop` command surface and prompt-pack behavior, and layer codex-interactive runner support behind provider abstraction and explicit runner selection.
- [x] Phase 12 codex runtime transport is CLI app-server JSON-RPC first with explicit readiness evaluation (`cli/login/app-server`) and no SDK coupling in this phase.
- [x] Interactive terminal UX for Forge Loop Phase 12 uses Ink with JSON mode fallback, so the same command can support human TUI operation and automation (`--json`).
- [x] Stage command defaults remain prompt-pack safe; codex runner execution is opt-in via `--runner` or explicit runtime mode override.

## 2026-02-22

- [x] RepoStudio Codex runtime now treats `@openai/codex` as a bundled dependency and prefers bundled invocation by default (`assistant.codex.cliCommand` default path).
- [x] RepoStudio doctor keeps Codex CLI installation as a hard readiness gate, but Codex login is non-blocking in default mode so `pnpm dev:repo-studio` can start while logged out.
- [x] Strict auth-gated workflows use explicit doctor opt-in (`--require-codex-login`) instead of default predev blocking.
- [x] RepoStudio Codex authentication is surfaced in-app (Codex Assistant setup card + `POST /api/repo/codex/login`) so sign-in can be started from UI without terminal-only onboarding.

## 2026-02-23

- [x] Repo Studio process cleanup policy is manual-only: `pnpm dev:repo-studio` remains non-destructive and does not auto-kill port owners.
- [x] Cleanup is safe-by-default with explicit escalation: `reclaim` defaults to `repo-studio` scope; repo-wide cleanup requires `--scope repo --force` (dry-run allowed without force).
- [x] Untracked port-owner termination in `stop` is ownership-gated: foreign processes are never killed implicitly; operators are directed to explicit reclaim commands for intentional destructive cleanup.
- [x] Repo Studio CLI default output should be ANSI-rich for human readability, with deterministic `--json` and `--plain` modes for automation and no-color environments.
- [x] Repo Studio runtime dependency semantics are diagnostic-first: missing desktop standalone artifacts do not hard-fail `/api/repo/runtime/deps`; route returns HTTP `200` with additive readiness flags (`desktopRuntimeReady`, `desktopStandaloneReady`) and `severity`.
- [x] Repo Studio doctor treats `runtime: stopped` as expected predev state and always prints explicit quick actions (start commands, stop command when running, reclaim flow when listeners are detected).
- [x] Terminal hyperlinks (OSC8) are enabled by default only in rich TTY mode and can be disabled explicitly with `forge-repo-studio doctor --no-links`; plain/json/no-color outputs remain link-free.
- [x] Repo Studio style pipeline readiness is a hard startup gate: missing PostCSS/Tailwind compiler wiring (`postcss.config.*` or `@tailwindcss/postcss`) must fail doctor/predev until remediated.
- [x] Repo Studio workspace model is preset-driven with focused tabs per workspace (Dockview retained) instead of global always-visible panel density.
- [x] Assistant context model is `system prompt + @mentions` (v1 mentions scoped to planning docs); panel-level attach-context actions are removed.
- [x] Codex setup/actions move to compact app-bar controls (sign-in/refresh/session toggle) and are no longer presented as a large assistant-panel setup card.
- [x] Repo Studio terminal panel is an interactive repo-root shell session (`xterm` + server-side PTY session APIs), replacing static run-output rendering.
- [x] Repo Studio Next build on Node 24 forces `output.hashFunction = 'sha256'` in app webpack config to avoid webpack `WasmHash` runtime crashes during `next build`.
- [x] Terminal session startup is fail-soft: if `node-pty` spawn fails, API returns a degraded fallback session instead of `500`, preserving panel usability and test stability.

## 2026-02-24

- [x] Repo Studio workspace model is now `workspace = layout`: each workspace tab mounts its own `EditorDockLayout` instead of one global layout with preset filtering.
- [x] Naming contract is now unambiguous: tab-level containers use `*Layout`; panel content exports use `*Panel` (with temporary `*Workspace` aliases retained for compatibility during migration).
- [x] Workspace visibility remains per-workspace show/hide + restore, but presets are removed; hidden-panel state is sanitized per workspace definition and never allows all main panels to be hidden.
- [x] Layout persistence is now per-workspace (`repo-<workspaceId>`) with migration from legacy single key `repo-studio-main` into the active workspace layout.
- [x] Shared `EditorDockLayout` keeps array props for compatibility, but slot children are canonical and now take precedence when both are provided.
- [x] Semantic hard-cut follow-up completed: shared layout primitives are now `WorkspaceLayout` + `WorkspacePanel`, strategy surface is `CodebaseAgentStrategyWorkspace`, and Studio root export is `StudioRoot` (legacy names removed from active code paths).
- [x] Assistant runtime/request contracts are workspace-first: transport header is `x-forge-ai-workspace-id`, session locator/runtime metadata use `workspaceId`, and payload session field is `workspace`.
- [x] Settings scope is workspace-first end-to-end: `'workspace'` replaced `'editor'` in store/UI/API/schema flows, with migration script coverage for historical records.
- [x] Payload type generation resolves Payload adapters from the Studio workspace package root (not root-level direct imports), preventing module/export resolution failures during `pnpm payload:types`.
- [x] AI/chat-first hard-cut: assistant runtime wiring is canonicalized in shared `AssistantPanel`; app-local AssistantRuntimeProvider wrappers are not allowed in `apps/*`.
- [x] Repo Studio assistant routing contract is `assistantTarget` end-to-end (query/body/session/proposal/schema); `editorTarget` is retired from active contracts.
- [x] Repo Studio workspace panel composition is inline JSX per workspace root (`*Workspace.tsx`), with no `render*DockPanel` helper indirection.
- [x] Consumer reference surface is now app-level `apps/consumer-studio` (chat-only, companion runtime driven); `examples/consumer` is removed from workspace packages.
- [x] AI/chat semantic guardrails are enforced in automation (`guard-assistant-canonical`, `guard-workspace-semantics`) and wired into root lint + CI.

## 2026-02-25

- [x] Repo Studio assistant surface is hard-cut to one panel/workspace (`assistant`) with runtime switching (`forge` or `codex`) inside the panel; split runtime panels are migration-only and not primary UX.
- [x] Repo Studio model routing is runtime-scoped and API-backed (`/api/repo/models`, `/api/repo/models/selection`): Forge models come from OpenRouter catalog semantics, Codex models come from codex app-server `model/list` with cache+warn fallback.
- [x] Codex manual play/stop controls are removed from app bar; Codex session lifecycle is on-demand (first codex model load or codex message).
- [x] GitHub auth in Repo Studio is OAuth device-flow based (in-app start/poll/logout routes backed by encrypted token persistence), not CLI-presence gated.
- [x] Repo Studio git/files/diff/search operations resolve against active project root when configured; fallback remains workspace root only when no active project exists.

## 2026-02-26

- [x] Story is no longer a built-in generated workspace id; Story is extension-backed from `.repo-studio/extensions/story/manifest.json` and host-rendered via `workspaceKind: "story"`.
- [x] Repo Studio extension model in this slice is manifest-only host rendering (no arbitrary extension JS execution from extension folders).
- [x] Forge extension tools are composed only for the active workspace. Story proof tool contract is `forge_open_about_workspace` with About Workspace modal payload from manifest metadata.
- [x] Planning and Story loop switcher UI is removed; `activeLoopId` remains runtime state for scope/API/viewport keys.
- [x] Repo Studio built-in workspaces are hard-cut to `planning`, `env`, `database`, `git`, `code`; removed built-in workspace ids are `assistant`, `diff`, `commands`, `review-queue`.
- [x] Assistant is a global right-rail panel in every built-in workspace and is toggled globally (not a standalone workspace tab).
- [x] Terminal is a global bottom dock with multi-session profiles launched from File menu (`New Terminal`, `Launch Codex CLI`, `Launch Claude Code CLI`).
- [x] Planning is PRD-first with canonical `.planning/PRD.md` surfaced in dedicated PRD/status/decisions/regression panels.
- [x] Git command execution resolves through a shared executable contract (`REPO_STUDIO_GIT_PATH` -> bundled Windows candidate -> system `git`) rather than hardcoded `git`.
- [x] Extension layout contract is single-source and priority-ordered: discovered extension `layout` payload -> generated in-app extension layout definitions -> generic fallback only (no story-specific catalog hardcode).
- [x] Story extension is optional per project; Repo Studio does not require local `.repo-studio/extensions/story` and instead surfaces a non-blocking install prompt when registry has Story but the active project does not.
- [x] Extension registry source is host-submodule-backed (`vendor/repo-studio-extensions/extensions`), not direct runtime GitHub fetch; install actions copy into active project `.repo-studio/extensions/<id>`.
- [x] Repo Studio built-in workspace set now includes `extensions` as the extension marketplace/management surface while extension rendering remains host-kind adapter based (no arbitrary extension JS execution).

## 2026-02-23 (AI runtimes and companion mode)

- [x] **Two distinct AI routes (no merging):** (1) **Open Router assistant** — tools, general chat, dialogue nodes, domain tools; uses Open Router (streamText, model registry, persistence). (2) **Codex** — coding agent; works on files via Codex SDK; never uses Open Router. Codex is implemented only in Repo Studio (`editorTarget=codex-assistant`); Open Router path is in Studio and will be shareable. No code path shall mix Codex with Open Router.
- [x] Studios may use Codex for mass/file work (e.g. create folder, point Codex at it) without requiring a full git repo; Codex is exposed as a reusable capability (Repo Studio hosts it; other studios call Repo Studio when using it as runtime).
- [x] Repo Studio as optional runtime: detection via a health/readiness endpoint; opt-in toggle (hidden until detected); shared hook/component for ping + "useRemoteRuntime" state so any studio can reuse the runtime.
- [x] Companion mode: when request is from a detected companion (allowed origin/localhost), Repo Studio does not perform Payload user auth; trusted caller. Sessions and AI-related data when companion live in Repo Studio's internal DB (agent-sessions + repo-settings-overrides for model persistence).
- [x] Database workspace in Repo Studio: SQL-capable viewer (Drizzle Studio style) for Payload SQLite; run SQL in a dedicated workspace tab.
- [x] 401 fix for Dialogue assistant: ensure transport sends credentials; LocalDevAuthGate ready before first assistant request; optional local-dev bypass (synthetic admin auth when `NEXT_PUBLIC_LOCAL_DEV_AUTO_ADMIN=1`).
- [x] AI runtimes and Database workspace work are tracked under **Phase 13** (forge-loop); similar work must use discuss → plan → execute → verify → sync-legacy. Database workspace in Repo Studio uses embedded Drizzle Studio (Payload-recommended); custom SQL runner and better-sqlite3 removed.

## 2026-02-26 (Phase 15 — Strategic shift: Repo Studio + Platform focus)

- [ ] **Studio app archived:** The application in `apps/studio` (Character workspace, Dialogue workspace) is archived. No new feature work; preserved for reference or extraction only. Character and Dialogue are moved to an extensions repo/submodule before any deletion of Studio app code.
- [ ] **Character workspace → extensions:** Character workspace is extracted and moved to an extensions submodule (or separate repo) and consumed as an extension; it is no longer part of the main monorepo apps.
- [ ] **Dialogue workspace → extensions:** Dialogue workspace lives in the other repo (extensions), not in main apps. Yarn Spinner dialogue support on the platform is deprecated.
- [ ] **Consumer-studio as extension:** `apps/consumer-studio` is not a main app. It is turned into a bare-bones extension (in the extensions repo) that people can use as a reference to build their own studios.
- [ ] **Platform: forge graphs and Yarn Spinner deprecated.** Forge graphs are deprecated; we will not work on graph support for a long time. Yarn Spinner dialogue support is deprecated. Platform roadmap prioritizes support for Repo Studio (desktop auth, API keys, OpenRouter proxy, connection validation).
- [ ] **Primary product focus:** We are working on Repo Studio and the platform behind it. All strategic planning and loop work use .planning (phases, tasks, decisions, PRD); discussion loops are discuss → plan → execute → verify.

## 2026-02-26 (Phase 15 execution cut - extension registry and examples)

- [x] Installable registry entries are only sourced from `vendor/repo-studio-extensions/extensions/*`.
- [x] Studio/consumer migrations are represented as browse-only examples under `vendor/repo-studio-extensions/examples/studios/*`.
- [x] Example ids are non-installable and rejected by install API (installables only).
- [x] Repo Studio Extensions workspace is split into `Installable Extensions` and `Studio Examples` sections.
- [x] Story-specific install prompt logic is removed from root shell; extension discovery/install is workspace-driven.
- [x] Local `.repo-studio/extensions/story` remains installed in this monorepo for Repo Studio development baseline.

## 2026-02-27

- [x] Repo Studio Story/Env workspace ownership is extension-only in app runtime; app-local Story/Env workspace implementations are removed and extension kinds are rendered via `@forge/repo-studio-extension-adapters`.
- [x] Repo Studio built-in workspace set is hard-cut to `planning`, `extensions`, `database`, `git`, `code`; legacy built-in `env` is removed and migrated via alias (`env` -> installed `env-workspace` when present, otherwise `planning`).
- [x] Repo Studio extension layout resolution is payload-first (`extension.layout`) with one generic fallback path; no story/env-specific panel hardcoding in catalog.
- [x] Studio and consumer-studio are moved out of active monorepo apps to `legacy/studio-apps/*`; root scripts and verification flows are Repo Studio-first.
- [x] `@forge/dev-kit` / `@forge/shared` is the canonical extension authoring UI surface; extension code must not depend on host app aliases (for example `@/`).
- [x] `WorkspaceViewport` is promoted to shared workspace primitives (`@forge/shared`) so extensions and adapters can use the same viewport contract as host workspaces.
- [x] Project-scoped extension iteration is install-once/edit-in-place under `<activeProject>/.repo-studio/extensions/<id>`; runtime should reload extensions without requiring reinstall.
- [x] Extension discovery/readiness hardening is no-store and fail-safe: `/api/repo/extensions` and `/api/repo/extensions/registry` responses disable caching, client fetches use `cache: "no-store"`, and root refresh keeps installed extension state on transient refresh failures.
- [x] Repo Studio root now refreshes extension/project/auth state on app focus and `visibilitychange` (in addition to interval/event refresh) so in-place edits under project `.repo-studio/extensions` are recognized quickly.
- [x] First Electron packaging cut is accepted for this loop: Windows installer and portable artifacts are generated from `packages/repo-studio/dist/desktop` while standalone asset bundling remains a follow-up hardening task.
- [x] Electron packaging config is constrained for current Windows environments: `electron` is treated as a `devDependency` for electron-builder compatibility and `win.signAndEditExecutable` is disabled to avoid blocking code-sign helper extraction paths.

## 2026-02-27 (Phase 15 release cut `v0.1.1`)

- [x] GitHub desktop distribution is tag-driven: push tag `v*` triggers `release-repo-studio-desktop.yml` (`verify` -> `package_windows` -> `release`) and publishes Windows artifacts to GitHub Releases.
- [x] Desktop packaging is now strict for release: `desktop:package:win` requires standalone bundle availability (`node src/desktop/build.mjs --require-standalone`) and blocks fallback-manifest packaging.
- [x] Standalone release bundle contract is enforced before upload: `.desktop-build/next/BUILD_ID`, `.desktop-build/next/static`, and standalone server entry (`server.js` candidate) must be present.
- [x] Release verification now includes `@forge/platform` and `@forge/docs` builds in addition to Repo Studio app/guards.
- [x] Extension registry source-of-truth for release is pinned submodule SHA: `vendor/repo-studio-extensions` must reference a pushed upstream commit containing installables (`story`, `env-workspace`) and required examples.
- [x] Release-verify gate split policy: core correctness gates remain blocking (`codegen`, `check:codegen`, extension registry health, platform build, workspace guard), while Linux-only docs/hydration checks run as non-blocking smoke checks to keep Windows artifact publication flow moving.
- [x] Release package job runs as explicit step chain (`build.mjs --require-standalone` -> standalone verifier -> `electron-builder`) to isolate hard-gate failures and avoid opaque nested script failures.
- [x] Desktop package file allowlist must include runtime-imported security modules (`src/security/**`) and supporting library modules (`src/lib/**`); excluding them can crash packaged startup with `ERR_MODULE_NOT_FOUND`.
- [x] Terminal degraded mode contract is a real shell fallback: when `node-pty` is unavailable, spawn a stream shell process (PowerShell/login shell) and reserve echo-only behavior as final emergency fallback only.
- [x] Semantic guard scripts must not depend on external `rg` binaries; guard checks are now Node/git-file based so local Windows shells and CI runners pass without extra ripgrep installation.
- [x] Desktop distribution remains strictly tag-driven; hotfixes on `main` are not downloadable until a new release tag is pushed.
- [x] Release artifact upload/publish paths must be tag/version-agnostic (wildcards + dynamic checksum filename) so future tags (for example `v0.1.2+`) do not fail on fixed `v0.1.1` paths.

## 2026-02-27 (Phase 15 desktop UX closeout)

- [x] Windows-first desktop distribution must be explicit for operators: use guided NSIS install (not silent one-click), allow install-directory changes, create shortcuts, and offer run-after-finish.
- [x] Packaged Repo Studio startup failures must never fail silently: write a deterministic startup log and show a dialog that points to that log when Electron main-process boot fails.
- [x] The desktop release gate now includes a packaged portable-EXE smoke launch on Windows CI before artifact upload, so "installs/builds but does not visibly start" regressions are caught pre-release.

## 2026-02-27 (Phase 15 desktop onboarding and debug ergonomics)

- [x] First-run onboarding is part of the desktop product surface: Repo Studio should greet first-time desktop users in-app with a setup flow that explains the product, shows dependency readiness, and directs them into opening a project folder.
- [x] Desktop startup should feel intentional: show a branded splash/loading window while the embedded runtime boots, then hand off to the main app window.
- [x] Debug-first launch modes are first-class CLI contracts: `--safe-mode` disables nonessential desktop background services (starting with watchers) and `--verbose-startup` writes step-by-step startup progress to the desktop startup log.
- [x] Code signing is not auto-implemented by agents in this slice; it remains a human-owned release concern until a Windows signing certificate and signing workflow are available.

## 2026-02-28 (Phase 15 desktop artifact retention)

- [x] Local desktop packaging must auto-clean after itself: `desktop:package:win` resets stale `dist/desktop` output before packaging, then prunes `win-unpacked`, builder scratch files, prior-version installers, and known Repo Studio temp smoke artifacts after packaging so repeated Windows builds do not accumulate large local disk usage.

## 2026-02-27 (Phase 16: Repo Studio canonical submodule)

- [x] Repo Studio app canonical source is [MagicbornStudios/RepoStudio](https://github.com/MagicbornStudios/RepoStudio); forge-agent includes it as a submodule at `vendor/repo-studio` for build and reference.
- [x] We switch to building from the submodule (canonical) only after Phase 16-01 verification: repo is on GitHub, can be pulled down, and the monorepo builds with the submodule present.
- [x] Phase 16-01: add submodule, update release workflow to init it, verify pull and build; Phase 16-02: integrate submodule into workspace and build/next-server paths, then remove or archive in-repo `apps/repo-studio` and `packages/repo-studio`.
- [x] Monorepo identity after switch: shared packages for everyone + platform (exposed) + Repo Studio app via submodule; public Electron install remains from forge-agent GitHub Release (tag `v*`).

## 2026-02-27 (Phase 17: Platform submodule and docs deploy)

- [x] Platform app canonical source is [MagicbornStudios/RepoStudio-Platform](https://github.com/MagicbornStudios/RepoStudio-Platform); forge-agent includes it as a submodule at `vendor/platform` for reference and optional verify build.
- [x] Platform deploys to Vercel from its own repo (RepoStudio-Platform); docs site lives in forge-agent (apps/docs) and deploys to Vercel from forge-agent.
- [x] Platform Vercel env: `NEXT_PUBLIC_DOCS_APP_URL` points to the deployed docs site URL (from forge-agent); `NEXT_PUBLIC_STUDIO_APP_URL` if used.
- [x] Deployment matrix: forge-agent = docs (Vercel), shared packages (npm), Electron (GitHub Releases), submodules (repo-studio, repo-studio-extensions, platform); RepoStudio-Platform = platform (Vercel). See Phase 17 plans and deployment matrix doc.

## 2026-02-26 (Phase 18: Platform integration gateway)

- [x] Platform as integration gateway (BFF): credentials and proxy APIs live on platform; Repo Studio uses capability flags in auth response to choose platform proxy vs local (Open Router proxy, extension install proxy). Human setup (secrets, repos, Vercel, npm, OAuth) is tracked in [.planning/HUMAN-TASKS.md](.planning/HUMAN-TASKS.md); agents check there before blocking.

## 2026-02-26 (Planning artifact reconciliation and release execution)

- [x] Planning artifact updates (Phases 16–18, PLATFORM-PRD, HUMAN-TASKS, ROADMAP, TASK-REGISTRY, 15-PRD, agent index) are intentional. When release execution sees uncommitted planning changes, commit them in a separate commit first or include them in the release commit; do not hard-stop—follow STATE "Release execution when planning docs are modified."
- [x] Phase 19 (Planning assistant context and tools) adds assistant context fix (loopId/workspaceId/selectedDocId), plan-specific Forge tools (add task, update status, open planning doc), and optional LangGraph planning orchestration; see STATE and [.planning/phases/19-planning-assistant-context-and-tools/](.planning/phases/19-planning-assistant-context-and-tools/).

## 2026-02-26 (PRD per loop and stage Definition of Done)

- [x] PRD per loop is the convention; each planning root may contain PRD.md. Definition of done for stages (Planning, Execution, Review, PRD scope) is in [.planning/DEFINITION-OF-DONE.md](.planning/DEFINITION-OF-DONE.md); use it to close phases and mark stages complete.

## 2026-02-26 (Phase 20: Planning artifacts first-class in Repo Studio)

- [x] Phase 20 (Planning artifacts first-class — DoD, HUMAN-TASKS, panels, unified todos) adds DoD and HUMAN-TASKS to the Planning workspace: (1) both artifacts in planning snapshot (coreFiles) and DoD + Human TODOs panels; (2) unified "My todos | Agent tasks" view with correlation (e.g. blocked by HT-xx); (3) planning welcome, notifications, status strip, chat contract. See [.planning/phases/20-planning-artifacts-and-todos-in-repo-studio/](.planning/phases/20-planning-artifacts-and-todos-in-repo-studio/). Depends on Phase 19 recommended first; can overlap with 16–18.
- [ ] **Planning UX (20-03):** Planning welcome **default OFF**; show suggested prompts. Status strip in toolbar (rotating "currently running"); task completion toasts; configurable toast types (task done, phase done, human-blocked, errors only). Scan/parse interval configurable (default ~30s). Badges on task list, phase list, tree; hover = popup with more info; click = open doc in viewport + navigate to section. **Chat contract** decided — see "Phase 20 chat contract and session scope" below.

## 2026-02-26 (Phase 21 and 22: Artifact layout, loop efficiency, workspace design refactor)

- [x] Phase 21 (Artifact layout and loop efficiency — planning) is planning/design-only: document how artifacts are laid out for users in Repo Studio and how loops stay efficient (context, tools, cadence, handoffs). Output informs Phase 20 panel design and Phase 22 refactor. See [.planning/phases/21-artifact-layout-and-loop-efficiency/](.planning/phases/21-artifact-layout-and-loop-efficiency/).
- [x] Phase 22 (Workspace and panel design refactor — composition, chat-in-chat, fewer rails) executes UX constraints from [docs/agent-artifacts/core/styling-and-ui-consistency.md](docs/agent-artifacts/core/styling-and-ui-consistency.md) § Workspace and panel composition: remove Copy @ from panels, reduce Planning left rail, tree + context menu for structure actions. See [.planning/phases/22-workspace-and-panel-design-refactor/](.planning/phases/22-workspace-and-panel-design-refactor/). Phase 21 recommended first.

## 2026-02-26 (Phase 23: Repo review and cleanup)

- [x] Phase 23 (Repo review and cleanup — GSD/Cursor setup, analysis consolidation, layout and legacy) aligns tooling (GSD install for Codex, Cursor rule for .planning + forge-loop), consolidates or clarifies analysis (ANALYSIS-LOOPS, ANALYSIS-REFERENCES), and documents repo layout and .cursor/plans hygiene. See [.planning/phases/23-repo-review-and-cleanup/](.planning/phases/23-repo-review-and-cleanup/). Can run in parallel with 19–22.

**Analysis and loops (Phase 23):** Analysis folders (repo_studio_analysis, forge_env_analysis, ide_navigation_analysis, agent_centric_ide_analysis) are **reference only**; one focus per loop. docs_codegen_analysis and agent_observability_analysis are listed in ANALYSIS-LOOPS but folders are not present at repo root (planned). Single Forge Loop: `.planning` + GSD/Codex + Repo Studio; analysis feeds requirements and phase context into .planning, no separate execution track.

## 2026-02-26 (Phase 20 chat contract and session scope)

- [x] **selectedDocId:** Doc reference for initial context or when user says "this" / current file. **Reference only** — not required; used for context when provided.
- [x] **Suggested prompts:** Shown as **chips** (clickable). User **must select** one — not in input, not in chat, not automatic. Chips disappear after selection.
- [x] **Codex display:** Chat shows tools being used, tasks being worked, different text coloring for tool calls, summary; special formatting for agent workflow. Sometimes asks questions; all Codex workflows.
- [x] **Multi-loop inspect:** While agent works in one loop, user can inspect other loops and work at the same time.
- [x] **Session scope:** Each workspace can work on its own loop: Planning = planning loop; Concept simulation = concept loop; Code = implementation loop. System prompts per workspace define behavior and scope; can get context from workspace files and related loops.
- [x] **Workspace roles:** Planning workspace = planning only (same techniques as dev). Concept simulation workspace = simulate product/game/software as if it exists and build upon it. Code workspace = custom UI for Codex implementation; planning docs from Planning workspace feed agents here. Agents can bypass Code workspace via codex/claude code CLIs.
- [x] **Skills visibility:** Show skills installed to project and available from get-shit-done (or custom version). If custom, version it in our forked repo.

## 2026-02-26 (Autonomous execution and overnight mode)

- [x] **Default to recommended:** Agents act as staff-level engineers; always push forward with recommended action. No approval gates for autonomous runs.
- [x] **Overnight mode = continuous execution:** Execute constantly with recommended action; not literally overnight. User can intervene anytime, pick back up later, or steer. Same behavior for extended unattended runs.
- [x] **Docs-first progress:** Agents update planning docs (STATE, TASK-REGISTRY, phase docs, STATUS) as they go. User wakes to **final summary + diffs**; then reviews docs more thoroughly. Granular review comes from the updated docs.
- [x] **Context compaction:** Compact and summarize context; dump the rest. Suggested prompts ("what's next", "what can we improve", "let's plan the most underplanned phase") stay stable.
- [x] **Fully autonomous for now:** All execution autonomous. Agents make constant builds. If feedback goes to another agent, no approval — default to recommended.
- [x] **Planning ↔ Code is human handoff:** No automatic handoff from Planning workspace to Code. Planning is a phase before execution; human decides when to execute. Code workspace + Codex can plan, update tasks, and do everything (skills, planning docs) during implementation. Codex can work with a planning agent in background to update docs and execute again.
- [x] **Phase pivots:** During execution, if errors or pivot needed, agents can extend phases (add tasks, update plans). Expected in overnight mode.
- [x] **Rollback:** Git revert. Codex and other agents use git.
- [x] **Scope:** Phase/task boundaries already constrain scope creep.
- [x] **Parallelism:** Multiple loops (Planning, Code, Concept simulation) can run in parallel.
- [x] **Persistence:** Session state (SQLite or file-based) for resume; can pick back up from last turn/task.
- [x] **Headless CLI:** Direct codex/claude code CLI users are advanced; no hand-holding. Assume drift risk. Must still work with our loops and planning docs.

## 2026-02-26 (Agent output UX and linkification)

- [x] **Presentation over actions:** Codex extension has review cards with files and line diffing; we fall short there. User cares about **how we present text and formatting**, not Undo/Review buttons. Focus: **linkification** — links to executables, files in repo, web URLs. Rich text and formatting in agent output.
- [x] **Codebase vector indexing:** In scope. Doc ingestion (URLs) deferred. See "Codebase indexing and exclusion policy" below.

## 2026-02-26 (Context budget and compaction)

- [x] **Target: 128k tokens per request.** 2026 baseline: 128k–200k common (GPT, Claude Sonnet); 1M available for some models. We target 128k so we run on all supported models with headroom.
- [x] **Chat and tool results:** Summarized when they exceed the recent window. Older turns and long tool outputs are compacted into a short "run summary"; raw content is dropped. Recent window: last ~15 turns or ~40k tokens of chat+tools; beyond that, summarize.
- [x] **Session state = summarize and recent only.** No separate retention policy. We keep: (1) run summary of older context, (2) recent N turns (raw). On resume, inject summary + recent. Most long-lived context lives in documents (planning docs), not chat history.
- [x] **Planning context:** Fixed list always included — STATE, active phase/plan, HUMAN-TASKS, relevant core files. Additional context pulled on demand from codebase, URLs, etc. (Codex/Cursor-style retrieval). Not everything in every request.

## 2026-02-26 (Codebase indexing and exclusion policy)

- [x] **Default exclusion: .gitignore.** Everything in .gitignore is excluded from indexing. Single source of truth; user already maintains it. Covers node_modules, dist, .next, __pycache__, build outputs, secrets, etc.
- [x] **vendor/ excluded by default.** Even when not in .gitignore (often committed), vendor/ is excluded to avoid index bloat and retrieval noise. Opt-in via project config when indexing vendored code is desired.
- [x] **Additional exclusions: .cursorignore.** Support .cursorignore for extra exclusions beyond .gitignore (e.g. huge checked-in datasets, paths user wants excluded from indexing).
- [x] **Opt-in vendor:** Project config (e.g. `.repo-studio/index-config.yaml` or `index.vendor: true`) allows indexing vendor/ when needed.
- [x] **Project-type agnostic:** Indexing adapts to project layout (monorepo, Unreal, Unity, generic); not hardcoded to apps/packages structure.
- [x] **Index scope:** .planning, scripts, packages, apps, docs, templates; root configs. Excludes per .gitignore + vendor/ + .cursorignore.
- [x] **Chunk-level indexing:** ~500–800 token chunks with overlap; semantic retrieval returns top-K chunks per query for relevance and token savings.

## 2026-02-26 (Vector stack: sqlite-vss, embeddings, model distribution)

- [x] **Vector store: sqlite-vss.** Reuse existing SQLite stack. Extension loads into Repo Studio DB or a dedicated index DB. Works with better-sqlite3. Note: sqlite-vss npm lists macOS/Linux; Windows support to be verified in Phase 26 (build from source or platform-specific).
- [x] **Embedding model: downloaded during installation.** Installer step fetches the model before install completes. If download fails, install fails — no first-launch surprises; user knows space requirements upfront. Model never in repo.
- [x] **Embedding library:** Transformers.js (@xenova/transformers) + all-MiniLM-L6-v2 (~23MB). Fastest, smallest, easiest with Node/Electron/TypeScript — pure JS/ONNX, no native build. Alternative: fastembed (npm) for higher speed if needed later.
- [x] **Model storage:** App data dir (e.g. Electron `userData/models/`), not in repo. Installer downloads from HuggingFace/CDN into that location. Same pattern for other large assets (runtimes, indices) — downloaded with installer or on demand, never committed.

## 2026-02-26 (Concept simulation: first-class types, deprecate Story, extensions repo)

- [x] **First-class concept types:** game, story (like a book), software (small PoC). Not just suggestions — primary types.
- [x] **Type immutable:** Concept type is set at creation; cannot change afterward.
- [x] **Deprecate Story extension:** Concept workspace replaces Story. Story becomes concept type "story" within concept simulation.
- [x] **Extension in repo-studio-extensions:** Concept workspace lives in extensions repo (vendor/repo-studio-extensions); not built-in.
- [x] **Src downloadable:** Extension src can be downloaded into user project (`.repo-studio/extensions/concept-workspace/`) so users can extend it (edit-in-place).
- [x] **Discovery purpose:** Concept simulation finds tech/features to build by simulating as if they exist. Output: DISCOVERED-FEATURES.md.

## 2026-02-26 (Phase 27: Repo Studio documentation)

- [x] **Dedicated docs phase:** Phase 27 is for comprehensive Repo Studio documentation — docs site as hub, Repo Studio downloadable, packages, install, what it does, how to extend.

## 2026-02-26 (Desktop packaging: icon, code-signing deferred)

- [x] **Windows .ico:** `repo_studio.ico` placed at `packages/repo-studio/build/repo-studio.ico`; electron-builder and BrowserWindow use it. HT-10 done.
- [x] **Code-signing deferred:** Windows code-signing certificate (HT-09) deferred until 50k funding/revenue. Currently at 0.
- [x] **Monetization iteration doc:** [.planning/MONETIZATION-STRATEGY.md](.planning/MONETIZATION-STRATEGY.md) — iterate on revenue model, platform entitlements, extension gating, license. Desktop subscription and extension gating are acceptable; license TBD (not MIT).

## 2026-02-26 (Assistant runtime unification — Phase 19-04)

- [x] **Forge vs Codex tool parity:** Both runtimes should expose tools the same way from the UI. Today Forge gets contract + toolsEnabled; Codex gets neither. Unify: pass contract for both; add Codex tool bridge.
- [x] **Contract as source of truth:** Add getToolSchemas() (or equivalent) so contract produces schema for both Forge (body.tools) and Codex (turn/start when supported).
- [x] **Codex tool events:** Route forwards `event.type === 'event'` when method is `tool/invoke` as `data-domain-tool-invoke`; client executes domain tools. Codex app-server must emit tool/invoke (or we wait on Codex support).
- [x] **Domain-agnostic event:** Use `data-domain-tool-invoke` with `{ domain, name, args }`; not forge-specific.
- [x] **Data Stream protocol:** assistant-ui Data Stream ([docs](https://www.assistant-ui.com/docs/runtimes/data-stream)) is a candidate for unified backend contract longer-term. Implement bridge in current architecture first (19-04); evaluate useDataStreamRuntime when we need multi-client or single-backend contract.
- [x] **LangGraph:** Not for tool unification. Use for planning orchestration, multi-step workflows, checkpoints (19-03). Tool parity is transport/event mapping.
