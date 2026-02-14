# Legacy and Bad Loop Migration

Use this when existing Ralph-loop artifacts are incomplete, inconsistent, or low quality.

## Standard migration

```bash
forge-loop migrate-legacy
forge-loop doctor
forge-loop progress
```

Migration reads:

- `docs/agent-artifacts/core/STATUS.md`
- `docs/agent-artifacts/core/task-registry.md`
- `docs/agent-artifacts/core/decisions.md`
- `docs/agent-artifacts/core/errors-and-attempts.md`

## Interpret migration warnings

Check `.planning/migration-report.json` `warnings[]`.

Known warning codes:

- `STATUS_CURRENT_MISSING`
- `STATUS_NEXT_MISSING`
- `STATUS_NEXT_ITEMS_EMPTY`
- `TASK_REGISTRY_TABLE_EMPTY`

Repair by editing canonical `.planning/*` files, not legacy snapshots.

## Bad-loop recovery path

If legacy artifacts are too noisy for reliable import:

1. run `forge-loop new-project --fresh --profile forge-loop`
2. manually copy only trusted items into:
   - `.planning/PROJECT.md`
   - `.planning/REQUIREMENTS.md`
   - `.planning/ROADMAP.md`
   - `.planning/DECISIONS.md`
   - `.planning/ERRORS.md`
3. run `forge-loop doctor`
4. continue with `forge-loop progress`

## After migration

- use `.planning/` as canonical state
- use `forge-loop sync-legacy` only for one-way snapshots
