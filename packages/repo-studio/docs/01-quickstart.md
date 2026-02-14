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

## 3) Run one complete slice

1. `Planning` tab: copy next command from `Next Action`.
2. `Env` tab: run `Doctor` (and `Reconcile` when needed).
3. `Commands` tab: run allowlisted lifecycle scripts with confirmation.
4. `Planning` tab: refresh and confirm next action changed.
5. `Docs` tab: open runbooks while executing.

Runtime controls:

- `forge-repo-studio status`
- `forge-repo-studio stop`

## 4) Optional fallback UI

Use only for emergency compatibility:

```bash
forge-repo-studio open --legacy-ui
```
