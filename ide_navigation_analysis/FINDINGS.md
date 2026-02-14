# IDE Navigation Findings

## Current State

- Repo Studio has Code workspace: file list from API, Monaco for content
- Diff workspace: git status, file list, Monaco diff
- Git workspace: status, branches, log
- No unified Navigator; no search panel; no changed-file indicators in tree
- DECISIONS-WORKSPACE-PANELS: Navigator is generic panel; Code workspace first (DS-08)

## Decisions Applied

- **Navigator**: Use Navigator (IN-01); already in repo_studio DECISIONS
- **Search**: Server-side (IN-02); big repos expected
- **Electron-first**: Native file watchers (IN-03)
- **No default exclude**: User opts to exclude (IN-04)

## Comparable UIs

| Product | Search | Tree | Git Status |
|---------|--------|------|------------|
| VSCode/Cursor | ✓ Panel, regex | ✓ Explorer | ✓ Decorations |

Target: match VSCode/Cursor navigation UX.
