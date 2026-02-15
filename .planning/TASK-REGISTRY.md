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
| FRG-401 | 04 | 04-01 | In progress | Harden story parser + canonical create path and refine story workspace editing/reader flows. |
| FRG-402 | 04 | 04-02 | Planned | Enforce hard scope guard + TTL override lifecycle across codex/file/proposal workflows. |
| FRG-403 | 04 | 04-03 | Planned | Promote Story/Git/Diff to dock-parity workflows with reusable scoped diff service. |
| FRG-404 | 04 | 04-04 | Planned | Finalize story-domain runbooks and add regression tests for scope + assistant split behavior. |
| FRG-405 | 04 | 04-04 | Planned | Fix baseline strict verification blockers in `@forge/studio` (`StrategyEditor.tsx` parse break and local `canvas.node` runtime dependency) and rerun strict verify for phase closeout. |
| FRG-501 | 05 | 05-01 | Planned | Bootstrap internal Payload+SQLite settings backbone for RepoStudio runtime state. |
| FRG-502 | 05 | 05-02 | Planned | Migrate RepoStudio settings to Studio-style registry + generated defaults/IDs. |
| FRG-503 | 05 | 05-03 | Planned | Implement env target read/write APIs with mode-scoped writes and post-write readiness validation. |
| FRG-504 | 05 | 05-04 | Planned | Deliver env workspace per-key editing + paste import + target scope filtering (`package|app|vendor|root`). |
| FRG-601 | 06 | 06-01 | Planned | Add per-workspace menu contribution registry and workspace-scoped menubar behavior. |
| FRG-602 | 06 | 06-02 | Planned | Ship generic Navigator panel reusable across workspaces (Code-first rollout). |
| FRG-603 | 06 | 06-03 | Planned | Add server-side repository search API (`q|regex|include|exclude|scope`) with safe path handling. |
| FRG-604 | 06 | 06-04 | Planned | Add git status decorations in tree/open-files and align publish script parity for RepoStudio packages. |
| FRG-701 | 07 | 07-01 | Planned | Build planning parser utility with frontmatter + section extraction for structured analytics. |
| FRG-702 | 07 | 07-02 | Planned | Implement story markdown-to-blocks transformer for page publish flow. |
| FRG-703 | 07 | 07-03 | Planned | Add story publish API (`story file -> page + blocks`) with deterministic mapping. |
| FRG-704 | 07 | 07-04 | Planned | Integrate publish previews into review/diff workflows before apply. |
| FRG-801 | 08 | 08-01 | Planned | Add Electron runtime shell/startup contracts for RepoStudio desktop mode. |
| FRG-802 | 08 | 08-02 | Planned | Implement SQLite path strategy for web dev and desktop bundled/userData runtime. |
| FRG-803 | 08 | 08-03 | Planned | Add native watcher integrations for tree/search/git refresh in desktop runtime. |
| FRG-804 | 08 | 08-04 | Planned | Add desktop packaging/release scripts and operator runbooks. |
| FRG-901 | 09 | 09-01 | Planned | Extend server auth scopes for `repo-studio|desktop` and enforce access checks. |
| FRG-902 | 09 | 09-02 | Planned | Implement desktop token lifecycle and secure credential storage strategy. |
| FRG-903 | 09 | 09-03 | Planned | Add desktop connection status + remediation UX in RepoStudio. |
| FRG-904 | 09 | 09-04 | Planned | Harden security/runbooks for desktop auth + platform connection flow. |
