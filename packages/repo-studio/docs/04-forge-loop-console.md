# Forge Loop Console

RepoStudio mirrors Forge Loop cadence so humans and coding agents can resume work without ambiguity.

## Mandatory cadence

1. `forge-loop progress`
2. `forge-loop discuss-phase <phase>`
3. `forge-loop plan-phase <phase>`
4. `forge-loop execute-phase <phase>`
5. `forge-loop verify-work <phase> --strict`
6. `forge-loop progress`
7. `forge-loop sync-legacy`

## Planning tab responsibilities

- show current phase/plan status from `forge-loop progress --json`
- show next command and reason
- show planning health chips:
  - summaries
  - verifications
  - open decisions/errors/tasks
- provide one-click copy for next command

## Operator pattern

1. Read `Next Action` in Planning tab.
2. Execute via CLI or Command Center allowlisted script.
3. Refresh Planning tab.
4. Continue until strict verify passes.
