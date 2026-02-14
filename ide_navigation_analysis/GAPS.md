# IDE Navigation Gaps

| Gap | Current | Target |
|-----|---------|--------|
| Navigator | Code workspace has file list; no tree | Navigator panel (generic); Code workspace first (IN-01) |
| File tree | File list from API; no tree UI | VSCode-like folder tree in Navigator |
| Search | None | Server-side `/api/repo/search`; include/exclude; regex (IN-02) |
| Git highlighting | Git workspace only | Changed/new badges in tree |
| Scope config | Implicit | User-configurable; no default exclude (IN-04) |
| Open files | — | Tab bar or sidebar "open editors" |
| File watchers | Polling (web) | Electron-first native watchers (IN-03) |

## Dependencies

- Repo Studio Code workspace: `/api/repo/files/tree`, `/api/repo/files/read`
- Git APIs for status
- **New API**: `/api/repo/search?q=&include=&exclude=&regex=` (server-side)
