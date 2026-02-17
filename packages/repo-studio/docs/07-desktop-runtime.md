# RepoStudio Desktop Runtime

RepoStudio desktop mode runs Electron with embedded RepoStudio Next runtime.

## Commands

```bash
forge-repo-studio open --desktop-runtime
forge-repo-studio status --json
forge-repo-studio stop --desktop-runtime
```

Optional development mode:

```bash
forge-repo-studio open --desktop-runtime --desktop-dev
```

## Build and Package

Prepare standalone assets:

```bash
pnpm --filter @forge/repo-studio run desktop:build
```

Package Windows artifacts (portable + installer profile):

```bash
pnpm --filter @forge/repo-studio run desktop:package:win
```

## SQLite Path Behavior

- Web/app runtime uses repo-local app data path.
- Desktop runtime uses desktop resolver path and sets `REPO_STUDIO_DATABASE_URI` before server boot.
- `forge-repo-studio doctor --json` reports `desktop.sqlitePathWritable`.

## Watcher Behavior

- Desktop runtime uses native watcher with polling fallback.
- Runtime emits:
  - `treeChanged`
  - `searchInvalidated`
  - `gitStatusInvalidated`
  - `watcherHealth`
- Renderer listens through preload bridge (`window.repoStudioDesktop.subscribeRuntimeEvents`).

## Troubleshooting

- If doctor reports missing desktop dependencies:
  - `pnpm --filter @forge/repo-studio install`
  - `pnpm --filter @forge/repo-studio run desktop:build`
- If standalone output is missing:
  - ensure `apps/repo-studio` build completes with `REPO_STUDIO_STANDALONE=1`.
- If stop fails:
  - run `forge-repo-studio status --json` and then `forge-repo-studio stop --desktop-runtime`.

