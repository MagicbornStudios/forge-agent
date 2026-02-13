# Coding Agent Loop

Use this mode when a coding agent executes the loop with minimal human intervention.

## Required reads before mutation

1. `.planning/PROJECT.md`
2. `.planning/REQUIREMENTS.md`
3. `.planning/ROADMAP.md`
4. `.planning/STATE.md`
5. current phase plan files in `.planning/phases/<NN-slug>/`
6. `.planning/DECISIONS.md`
7. `.planning/ERRORS.md`

## Safe cadence

```bash
forge-loop progress
forge-loop discuss-phase <phase>
forge-loop plan-phase <phase>
forge-loop execute-phase <phase> --non-interactive
forge-loop verify-work <phase> --non-interactive --strict
forge-loop sync-legacy
forge-loop progress
```

## Agent operating contract

- treat `.planning/` as source of truth
- use prompt artifacts in `.planning/prompts/`
- do not bypass plan frontmatter contracts
- do not mark unresolved UAT issues as passed
- if verification fails, generate gap plans and continue same phase
