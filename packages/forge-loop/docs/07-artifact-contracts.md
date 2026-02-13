# Artifact Contracts

## Canonical planning files

- `.planning/PROJECT.md`
- `.planning/REQUIREMENTS.md`
- `.planning/ROADMAP.md`
- `.planning/STATE.md`
- `.planning/DECISIONS.md`
- `.planning/ERRORS.md`
- `.planning/TASK-REGISTRY.md`
- `.planning/TEMP-REFACTOR-BACKLOG.md`
- `.planning/config.json`
- `.planning/migration-report.json`

## Phase artifact naming

Under `.planning/phases/<NN-slug>/`:

- `<NN>-CONTEXT.md`
- `<NN>-RESEARCH.md`
- `<NN>-<PP>-PLAN.md`
- `<NN>-<PP>-SUMMARY.md`
- `<NN>-UAT.md`
- `<NN>-VERIFICATION.md`

## Plan frontmatter required fields

- `phase`
- `plan`
- `wave`
- `depends_on`
- `files_modified`
- `autonomous`
- `must_haves`

`must_haves` requires:

- `truths` (non-empty list)
- `artifacts` (non-empty list with required object keys)
- `key_links` (non-empty list with required object keys)

## Commit scope contract

Default auto-commit scope:

- `.planning/**`
- `docs/agent-artifacts/core/**`

Auto-commit fails when:

- requested commit files are outside scope
- staged files outside scope are present

## Legacy sync marker contract

Legacy snapshots are updated only inside generated markers:

- `<!-- forge-loop:generated:start -->`
- `<!-- forge-loop:generated:end -->`

Manual content outside markers is not overwritten.
