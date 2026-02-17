# Repo Studio Product Requirements Document

## Vision

Repo Studio as official platform desktop app—same data, Electron-packaged, downloadable. A standalone analysis and development surface for repository operations that shares platform data and editor patterns with the main Studio. Has its own internal Payload + SQLite for settings and local state; when packaged as Electron, the DB is bundled with the app.

**Status (2026-02):** Phases A-D complete (05-08); Phase E (desktop auth) is the only remaining deliverable.

## Terminology

| Term | Meaning | Notes |
|------|---------|-------|
| **Workspace** | Domain surface (Planning, Env, Commands, Story, etc.) | Same as "editor" in main Studio |
| **Workspace contribution** | Workspace registers panels, menu items, settings sections | Per-workspace menu contribution is required |
| **Page** | Notion-style document; story file content becomes a Page | Content stored as Blocks (Notion model) |

## Scope

- **Workspaces**: Planning, Env, Commands, Story, Docs, Assistants (Loop + Codex), Diff, Code, Git, Review Queue, Terminal
- **Story files**: In-repo markdown at `content/story/` (act/chapter/page); saved to disk
- **Publish-to-pages**: Story files → Payload Pages; page content stored as Blocks (Notion-style)
- **Settings**: Internal Payload + SQLite; same registry/section/field pattern as main Studio
- **Desktop distribution**: Electron-packaged app with bundled SQLite DB

## Non-Scope

- Not replacing the main Studio
- Sync to main Forge Loop is out of scope; user handles when ready
- Direct Payload REST from browser; use API routes

## Features

| ID | Feature | Status | Phase |
|----|---------|--------|-------|
| F1 | Structured file parsers (planning, story) | Done | C |
| F2 | Publish story files as project Pages (content → Blocks) | Done | C |
| F3 | Electron desktop packaging | Done | D |
| F4 | API key auth for desktop app (platform connection) | Planned | E |
| F5 | Package publishability (Verdaccio + npm) | Done | B |
| F6 | Definitions of done for UI/layout | Done | B |
| F7 | Studio/editor parity (looks, patterns) | Done | A |
| F8 | Internal Payload + SQLite for settings | Done | A |
| F9 | Settings registry (section/field) + right sidebar | Done | A |
| F10 | Per-workspace menu contribution | Done | B |

## Phasing

| Phase | Focus | Deliverables |
|-------|-------|--------------|
| **A** | Foundation | Internal Payload + SQLite; settings registry; migrate from file-based config |
| **B** | Parity and contribution | Menu contribution per workspace; UI/layout DoD; Verdaccio publish |
| **C** | Story and publish | Structured parsers; story → Pages/Blocks publish API |
| **D** | Electron | Desktop packaging; bundled SQLite |
| **E** | Desktop auth | API key scope + client flow when connecting to platform |

**Order**: A → B → C → D → E

## Dependencies

- Payload CMS (internal instance with SQLite adapter)
- Shared editor primitives (`@forge/shared`, `@forge/ui`)
- Forge-env for environment handling (see [forge_env_analysis/](../forge_env_analysis/) for env-specific analysis)
- Repo-studio CLI for command center
- Main Studio `pages` + `blocks` collections (Notion model)

## Traceability

- Main loop: `.planning/REQUIREMENTS.md`, `.planning/ROADMAP.md`
- Phase 04 (Story): REQ-13 through REQ-16
