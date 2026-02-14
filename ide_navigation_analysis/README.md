# IDE-like Navigation Analysis Loop

Planning for Repo Studio as an IDE shell: search, file tree, regex, git status, scoped navigation.

## Goal

Repo Studio should feel like VSCode/Cursor when navigating the project: search (including regex), file/folder layout, highlighting changed and new files. Scope-aware (workspace vs. loop; exclude `.tmp`, `plans/*`).

## Relationship

- Repo Studio has Code, Diff, Git, Planning workspaces; navigation underpins all
- Complements repo_studio_analysis (workspace maturity)
- May inform Electron packaging (better file watchers vs web)

## Contents

| Document | Purpose |
|----------|---------|
| [PRD.md](PRD.md) | Vision; features; scopes |
| [GAPS.md](GAPS.md) | Current vs target |
| [DECISIONS.md](DECISIONS.md) | Key choices |
| [FINDINGS.md](FINDINGS.md) | Research; comparable UIs |

## Config

`config.json`: `{"mode":"analysis","execution":false}`

## Cross-Reference

- Repo Studio: [repo_studio_analysis/](../repo_studio_analysis/)
- Workspace audit: [WORKSPACE-AUDIT.md](../repo_studio_analysis/WORKSPACE-AUDIT.md)
