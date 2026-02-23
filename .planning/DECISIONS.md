# Decisions

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
