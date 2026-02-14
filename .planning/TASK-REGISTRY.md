# Task Registry

| Task ID | Phase | Plan | Status | Notes |
|---|---|---|---|---|
| FRG-201 | 02 | 02-01 | Complete | Split `forge-env` engine into modular libraries with compatibility facade. |
| FRG-202 | 02 | 02-01 | Complete | Added workspace discovery + mismatch diagnostics in env command outputs. |
| FRG-203 | 02 | 02-02 | Complete | Delivered `@forge/repo-studio` package runtime, CLI, resolver diagnostics, and command policy persistence. |
| FRG-204 | 02 | 02-02 | Complete | Implemented Env + Commands workspaces with filter/search/tabs, enable/disable toggles, and run history. |
| FRG-205 | 02 | 02-03 | Complete | Delivered Dockview panel-rail parity, persistent app-shell state, settings-only sidebar, and shared assistant/planning feature modules. |
| FRG-206 | 02 | 02-04 | In progress | Added dependency health contracts (`/api/repo/runtime/deps`, doctor deps output); remaining work is loop analytics/quality-gate docs completion. |
| FRG-207 | 02 | 02-04 | Pending | Add command resolver/assistant integration tests and package release smoke checks. |
| FRG-208 | 02 | 02-05 | Complete | Unblocked RepoStudio app builds (Dockview dependency + shared showcase typing fixes) and stabilized runtime parity surfaces. |
| FRG-209 | 02 | 02-05 | Complete | Added app runtime parity routes: command list/toggle/view, run start/stream/stop, codex status/start/stop. |
| FRG-210 | 02 | 02-06 | Complete | Hardened command center UX with tabs/filter/status sorting, allow-disable toggles, and explicit stop controls. |
| FRG-211 | 02 | 02-07 | Complete | Added Codex-first assistant flow with strict ChatGPT auth checks and CLI lifecycle commands. |
| FRG-212 | 02 | 02-07 | Complete | Added runner-aware env gate outputs (`codexCliInstalled`, `codexLoginChatgpt`, `runnerSatisfied`) and forwarded runner from Forge Loop headless flows. |
| FRG-213 | 02 | 02-07 | Complete | Updated package runbooks/docs and extended verification coverage for Codex readiness and runner-aware gating paths. |
