# Repo Studio Analysis Loop

Standalone analysis and planning for Repo Studio. No execution; no sync to main Forge Loop.

## Related Analysis Loops

- **Forge Env**: [forge_env_analysis/](../forge_env_analysis/) — env scoping, copy-paste. Repo Studio Env workspace is canonical; no standalone portal (DS-06).

## Contents

| Document | Purpose |
|----------|---------|
| [PRD.md](PRD.md) | Product requirements; vision; scope; features; phasing |
| [WORKSPACE-AUDIT.md](WORKSPACE-AUDIT.md) | Workspace feature matrix; Env gaps vs other workspaces |
| [DECISIONS.md](DECISIONS.md) | Key decisions (DS-01 through DS-14) |
| [FINDINGS.md](FINDINGS.md) | Current state; gaps; recommendations |
| [GAPS.md](GAPS.md) | Identified gaps by priority; workspace maturity |
| [DECISIONS-WORKSPACE-PANELS.md](DECISIONS-WORKSPACE-PANELS.md) | Menus, panels, layout, Loop Assistant, Review Queue (from planning session) |
| [PARITY-CHART.md](PARITY-CHART.md) | PRD vs current vs Studio alignment |
| [definitions-of-done/](definitions-of-done/) | UI and layout done-ness criteria |
| [loop/](loop/) | Analysis loop state, requirements, rounds |
| [IMPLEMENTATION-POINTERS.md](IMPLEMENTATION-POINTERS.md) | Where to go for each phase (agents, developers) |

## Phasing (from PRD)

A → B → C → D → E

- **A**: Internal Payload + SQLite; settings registry
- **B**: Menu contribution; UI DoD; Verdaccio publish
- **C**: Parsers; story → Pages/Blocks publish
- **D**: Electron packaging
- **E**: Desktop API key auth

## Config

`config.json`: `{"mode":"analysis","execution":false}`
