# IDE-like Navigation PRD

## Vision

Repo Studio as an agent-centric IDE shell where users navigate the project like VSCode/Cursor: search (plain + regex), file tree, folder layout, and clear indication of changed/new files. Scope-aware (workspace, loop; exclude `.tmp`, `plans/*`, `.planning` per agent rules).

## User Story

"I want to navigate my project folder like VSCode and Cursor. Search, regex search, file and folder layout, highlighting changed files and new ones."

## Features (Proposed)

| ID | Feature | Status |
|----|---------|--------|
| F1 | File tree / folder layout | TBD |
| F2 | Search (plain text) | TBD |
| F3 | Regex search | TBD |
| F4 | Files to include / exclude patterns | TBD |
| F5 | Git status highlighting (changed, new) | TBD |
| F6 | Scope: workspace vs loop root | TBD |
| F7 | Open files / recent | TBD |

## Scopes

| Scope | Include | Exclude (default) |
|-------|---------|-------------------|
| Workspace | Repo root | `.tmp`, `plans/*`, `node_modules`, `.git` |
| Loop | Loop dir (e.g. `.planning/phases/X`) | — |
| Code workspace | `apps`, `packages`, `docs` | per user config |

## Non-Scope (Initial)

- LSP / IntelliSense
- Full file editor (Code workspace has Monaco)
- Multi-root workspaces

## Alignment with Repo Studio Decisions

- **Navigator**: Generic panel for any workspace; shows in Code workspace first (DS-08).
- **Include/exclude**: Align with AGENTS.md (`.tmp`, `plans/*` excluded from agent search).

## Research Targets

- Cursor Codebase UI, search UX
- OpenCode, Claude Code navigation
- Windmill, Modal: how they scope file access
- Web vs Electron for file watcher performance
