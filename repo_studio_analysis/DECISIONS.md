# Repo Studio Analysis Decisions

Decisions made during the analysis loop. No implementation yet.

## DS-01: Settings Persistence

**Decision**: Adopt Studio's settings pattern with internal Payload CMS + SQLite.

**Rationale**: Same registry/section/field model as main Studio; no cloud dependency. DB lives in `.repo-studio/` for web; bundled with Electron app for desktop.

**Consequences**: Replace file-based `config.json` + `local.overrides.json` with Payload-backed settings. Internal Payload instance runs alongside Repo Studio (Next.js or Electron).

## DS-02: Story Files = Pages

**Decision**: Story files are literally Pages. Content stored as Blocks (Notion model).

**Rationale**: Align with how Notion stores page content: Page (metadata, parent) + Blocks (paragraphs, headings, lists, etc.). Existing `pages` and `blocks` collections follow this model.

**Consequences**: Publish API parses story markdown → creates/updates Page + Blocks. No separate "blocks" concept for users; blocks are storage representation.

## DS-03: Phasing

**Decision**: A (internal Payload + settings) → B (menus, DoD, publish) → C (parsers, story publish) → D (Electron) → E (desktop auth).

**Rationale**: Foundation first; menu contribution high impact; story publish builds on pages/blocks; Electron and auth are packaging/connectivity.

## DS-04: Workspace = Editor

**Decision**: "Workspace" in Repo Studio is conceptually the same as "editor" in main Studio. Per-workspace menu contribution is required.

**Rationale**: Both are domain surfaces that own panels and can contribute menus/settings. Naming differs (workspace vs editor) but pattern is identical.

## DS-05: Analysis Loop Independence

**Decision**: Repo Studio analysis loop is standalone. No sync to main Forge Loop. User handles handoff when ready.

## DS-06: Env Workspace is Canonical Env UI

**Decision**: Repo Studio Env workspace is the only env UI. No standalone forge-env portal to maintain; no embedding of the legacy portal.

**Rationale**: User wants one place to manage env; Repo Studio fully manages it; Env workspace must provide per-key editing, copy-paste, scoping.

**Consequences**: Build out Env workspace to parity with portal concepts (target editors, Save/Refresh); deprecate portal as the env UI surface.

## DS-07: Per-Workspace Menus, Shortcuts, and Settings

**Decision**: Workspaces contribute their own menus (File, View, Edit, etc.), shortcuts, and settings sections. Menu bar changes when switching workspaces (like Dialogue vs Character). Settings register and become centralized.

**Rationale**: Parity with main Studio; each workspace owns its domain.

## DS-08: Panel Registration and Modularity

**Decision**: Panels use mount/register/unregister pattern. Many panels (Terminal, diff, assistants) are modular and can appear in various workspaces. Navigator is generic; shows in Code workspace initially. Behaviors (attach/copy/refresh) only show when panel provides data; optional prop to hide.

**Rationale**: Reuse; flexibility; avoid empty buttons.

## DS-09: Workspaces as Siblings; Loop Assistant in Any Workspace

**Decision**: Multiple workspaces open like Dialogue/Character as siblings. Env is its own workspace. Loop Assistant lives in a panel, gets context from active workspace, can be in any workspace. Loops exist for story, code, planning.

**Rationale**: Composition; reuse; agent-centric workflow.

## DS-10: Review Queue Diff UX and Proposal Storage

**Decision**: Review Queue: click file → Monaco with diff, one file at a time. Same for planning docs. Proposals stored in SQLite. One queue with metadata for sub-agents. Sub-agents work independently; Ralph Wiggum loops.

**Rationale**: Clear review flow; persistence; multi-agent support.
