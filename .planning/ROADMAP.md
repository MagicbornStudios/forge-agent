# Roadmap: Forge Agent

## Overview

Operational roadmap for Forge Loop lifecycle delivery, RepoStudio control-plane parity, and multi-loop repository operations.

## Phases

- [x] **Phase 01: Forge Loop bootstrap** - Establish lifecycle command baseline
- [x] **Phase 02: RepoStudio command center** - Build reusable RepoOps shell + env/assistant/verification command center
- [ ] **Phase 03: Multi-loop orchestration and dual-assistant editors** - Run many loop tracks from one Studio-grade RepoStudio surface

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
**Plans:** 3 plans

Plans:
- [ ] 03-01: Multi-loop artifact model + CLI loop selection + RepoStudio loop switch APIs
- [ ] 03-02: Dual assistant editor routing with Codex app-server primary and explicit fallback controls
- [ ] 03-03: Monaco diff read-first panel, assistant attach flow, and release-hardening docs/tests

## Progress

| Phase | Plans Complete | Status | Completed |
|---|---|---|---|
| 01. Forge Loop bootstrap | 2/2 | Complete | 2026-02-13 |
| 02. RepoStudio command center | 7/7 | Complete | 2026-02-14 |
| 03. Multi-loop orchestration and dual-assistant editors | 0/3 | In progress | - |

