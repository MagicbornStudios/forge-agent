# Agent artifacts archive

This folder holds **compacted chunks** of living agent artifacts. When a section (e.g. STATUS "Ralph Wiggum" Done list, or old errors-and-attempts entries) grows too long, we summarize it in the main doc and move the full content here.

- **Naming:** e.g. `STATUS-done-2026-02.md`, `errors-and-attempts-2026-01.md`.
- **Usage:** Main artifacts in `../core/` keep a one-line pointer to the archive file. Agents read the main artifact first; open archive only when tracing history.

See [../core/compacting-and-archiving.md](../core/compacting-and-archiving.md) for the full process.
