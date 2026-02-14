# IDE Navigation Gaps

| Gap | Current | Target |
|-----|---------|--------|
| File tree | Code workspace has file list from API; no tree UI | VSCode-like folder tree |
| Search | None in Repo Studio | Search panel with include/exclude |
| Regex search | — | Toggle for regex mode |
| Git highlighting | Git workspace shows status; not in file tree | Changed/new badges in tree |
| Scope config | Implicit | Explicit include/exclude patterns |
| Open files | — | Tab bar or sidebar "open editors" |

## Dependencies

- Repo Studio Code workspace: `/api/repo/files/tree`, `/api/repo/files/read`
- Git APIs for status
- May need new API: `/api/repo/search?q=&include=&exclude=&regex=`
