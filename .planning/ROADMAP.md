# Roadmap: Forge Agent

## Overview

Operational roadmap for the Forge Loop lifecycle, RepoStudio command center, and env tooling hardening.

## Phases

- [x] **Phase 01: Forge Loop bootstrap** - Establish lifecycle command baseline
- [ ] **Phase 02: RepoStudio command center** - Build reusable RepoOps shell + env command center

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
- [ ] 02-04: Forge Loop analytics workspace, nonstop cadence docs, and quality gates
- [x] 02-05: Build unblock + app/package runtime parity APIs + command stream controls
- [x] 02-06: Command center hardening (tabs/filter/search/allow-disable/run-stop) with local override persistence
- [x] 02-07: Codex-first assistant integration + runner-aware env gate + docs/tests hardening

## Progress

| Phase | Plans Complete | Status | Completed |
|---|---|---|---|
| 01. Forge Loop bootstrap | 2/2 | Complete | 2026-02-13 |
| 02. RepoStudio command center | 6/7 | In progress | - |
