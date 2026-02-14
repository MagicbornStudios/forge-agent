# @forge/forge-loop

Artifact-first lifecycle CLI for repeatable human + coding-agent delivery loops.

Forge Loop treats `.planning/` as canonical state and helps you run:
`new-project -> discuss-phase -> plan-phase -> execute-phase -> verify-work -> progress -> sync-legacy`

## Start here

### New repository

```bash
forge-loop new-project --fresh --profile forge-loop
forge-loop discuss-phase 1
forge-loop plan-phase 1
forge-loop execute-phase 1 --non-interactive
forge-loop verify-work 1 --non-interactive --strict
forge-loop progress
```

### Existing repository (no legacy Ralph artifacts)

```bash
forge-loop new-project --fresh --profile forge-loop
forge-loop doctor
forge-loop progress
```

### Existing repository with legacy Ralph artifacts

```bash
forge-loop new-project
forge-loop doctor
forge-loop progress
```

## Install and run

### In this monorepo

```bash
pnpm forge-loop --help
```

### After publish

```bash
npx @forge/forge-loop --help
```

## Command reference

| Command | Purpose |
|---|---|
| `forge-loop new-project [--fresh] [--profile forge-agent\|forge-loop\|custom]` | Initialize `.planning/` or auto-migrate legacy artifacts. |
| `forge-loop migrate-legacy` | Run one-time import from legacy docs into `.planning/`. |
| `forge-loop discuss-phase <phase> [--loop <id>]` | Capture phase boundary decisions and context for selected loop. |
| `forge-loop plan-phase <phase> [--skip-research] [--gaps] [--loop <id>]` | Generate/refresh plan files and optional gap plans. |
| `forge-loop execute-phase <phase> [--gaps-only] [--non-interactive] [--loop <id>]` | Execute plan workflow and write idempotent summaries. |
| `forge-loop verify-work <phase> [--non-interactive] [--strict] [--loop <id>]` | Run verification checks and UAT reporting. |
| `forge-loop progress [--loop <id>]` | Show lifecycle state and exact next action for selected loop. |
| `forge-loop sync-legacy [--loop <id>]` | Snapshot selected loop `.planning` state into legacy marker blocks. |
| `forge-loop doctor [--loop <id>]` | Validate config/artifacts/git safety/marker integrity. |
| `forge-loop loop:list` | List available loops from `.planning/LOOPS.json`. |
| `forge-loop loop:new <loop-id> [--name ...] [--scope ...] [--profile ...] [--runner ...]` | Create a new loop root under `.planning/loops/<loop-id>`. |
| `forge-loop loop:use <loop-id>` | Set active loop in `.planning/LOOPS.json`. |

## Operating contract

- `.planning/` is canonical source of truth.
- `runtime` is `prompt-pack` only.
- auto-commit defaults to scoped planning paths.
- non-interactive UAT records `skipped`, not `pass`.
- strict verification (`--strict` or config default) exits non-zero on failures/issues.

## Headless and manual modes

- Manual human flow: `docs/02-manual-loop.md`
- Coding-agent flow: `docs/03-agent-loop.md`
- Headless runner convention (external agent runner): `docs/04-headless-runbook.md`
- Env readiness gate for headless runs: `pnpm forge-env:doctor -- --mode headless --strict`
- Optional explicit runner: `pnpm forge-env:doctor -- --mode headless --runner <runner> --strict`
- GUI remediation path: `pnpm forge-repo-studio open --view env --mode headless`

## Multi-loop quickstart

```bash
forge-loop loop:new pkg-platform --scope apps/platform --profile forge-agent --runner custom
forge-loop loop:use pkg-platform
forge-loop progress --json
```

## Package runbooks

1. `docs/01-quickstart.md`
2. `docs/02-manual-loop.md`
3. `docs/03-agent-loop.md`
4. `docs/04-headless-runbook.md`
5. `docs/05-existing-project-onboarding.md`
6. `docs/06-legacy-and-bad-loop-migration.md`
7. `docs/07-artifact-contracts.md`
8. `docs/08-troubleshooting.md`
