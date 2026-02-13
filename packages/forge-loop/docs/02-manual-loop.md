# Manual Loop

Use this mode when a human is driving decisions and task execution directly.

## Recommended sequence

```bash
forge-loop progress
forge-loop discuss-phase <phase>
forge-loop plan-phase <phase>
forge-loop execute-phase <phase>
forge-loop verify-work <phase> --strict
forge-loop sync-legacy
forge-loop progress
```

## Interactive vs non-interactive

- interactive:
  - useful when you want per-task confirmation in `execute-phase`
  - useful when you want to answer UAT prompts in `verify-work`
- non-interactive:
  - use when running unattended
  - UAT statuses are written as `skipped`

## Manual quality checklist

- phase goals in `.planning/ROADMAP.md` match what was implemented
- summaries in `.planning/phases/*-SUMMARY.md` are complete and non-duplicated
- decisions and failed attempts are logged in `.planning/DECISIONS.md` and `.planning/ERRORS.md`
- strict verification passes before calling a phase complete
