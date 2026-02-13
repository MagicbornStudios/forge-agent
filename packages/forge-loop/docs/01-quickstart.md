# Quickstart

Use this file if you need the fastest path from zero to one completed loop.

## Prerequisites

- Node.js 20+
- `git` installed
- repository root as current working directory

## Fresh repository path

```bash
forge-loop new-project --fresh --profile generic
forge-loop discuss-phase 1
forge-loop plan-phase 1
forge-loop execute-phase 1 --non-interactive
forge-loop verify-work 1 --non-interactive --strict
forge-loop progress
```

## What gets created

- `.planning/PROJECT.md`
- `.planning/REQUIREMENTS.md`
- `.planning/ROADMAP.md`
- `.planning/STATE.md`
- `.planning/DECISIONS.md`
- `.planning/ERRORS.md`
- `.planning/TASK-REGISTRY.md`
- `.planning/config.json`
- `.planning/phases/<NN-slug>/*`
- `.planning/prompts/*`

## Validate setup

```bash
forge-loop doctor
```

If doctor passes, continue using `forge-loop progress` for next action routing.
