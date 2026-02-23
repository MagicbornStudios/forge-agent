# RepoStudio Quickstart

RepoStudio is loop-first. Start with Forge Loop status, then open RepoStudio.

## 1) Check loop position

```bash
forge-loop progress
```

## 2) Launch RepoStudio

```bash
forge-repo-studio open --view planning --mode local --profile forge-loop
```

For this monorepo:

```bash
pnpm forge-repo-studio open --view planning --mode local --profile forge-agent
```

When starting with root script, RepoStudio now runs a doctor precheck first:

```bash
pnpm dev:repo-studio
```

If precheck fails, remediate in this order:

```bash
pnpm install
pnpm forge-repo-studio doctor --json
pnpm --filter @forge/repo-studio-app build
```

Precheck still fails for dependency/runtime health issues, but missing Codex login no longer blocks startup.

If startup fails with `EADDRINUSE` (for example port `3010`), reclaim orphaned RepoStudio/Codex processes manually:

```bash
pnpm forge-repo-studio:processes
pnpm forge-repo-studio:reclaim -- --dry-run
pnpm forge-repo-studio:reclaim
pnpm dev:repo-studio
```

For explicit repo-wide cleanup (destructive):

```bash
pnpm forge-repo-studio:reclaim -- --scope repo --dry-run
pnpm forge-repo-studio:reclaim:all
```

## 3) Run one complete slice

1. `Planning` tab: copy next command from `Next Action`.
2. `Env` tab: run `Doctor` (and `Reconcile` when needed).
3. `Commands` tab: run allowlisted lifecycle scripts with confirmation.
4. `Planning` tab: refresh and confirm next action changed.
5. `Docs` tab: open runbooks while executing.

Runtime controls:

- `forge-repo-studio status`
- `forge-repo-studio stop`
- `forge-repo-studio processes`
- `forge-repo-studio reclaim`

Desktop controls:

- `forge-repo-studio open --desktop-runtime`
- `forge-repo-studio stop --desktop-runtime`
- `pnpm --filter @forge/repo-studio run desktop:build`

## 4) Optional fallback UI

Use only for emergency compatibility:

```bash
forge-repo-studio open --legacy-ui
```
