# Forge Env Analysis Loop

Standalone analysis and planning for forge-env. No execution; no sync to main Forge Loop.

## Relationship to Repo Studio

- Repo Studio Env workspace is the canonical env UI (DS-06).
- Legacy forge-env portal is not used; Env workspace provides full management.
- This analysis covers: scoping, copy-paste, per-key editing; Doppler/dotenv-vault parity (aspirational).

## Contents

| Document | Purpose |
|----------|---------|
| [PRD.md](PRD.md) | Product requirements; vision; scope; features |
| [DECISIONS.md](DECISIONS.md) | Key decisions |
| [FINDINGS.md](FINDINGS.md) | Current state; gaps; recommendations |
| [GAPS.md](GAPS.md) | Identified gaps |
| [PARITY-CHART.md](PARITY-CHART.md) | PRD vs current |
| [definitions-of-done/](definitions-of-done/) | UI and scoping criteria |
| [loop/](loop/) | Analysis loop state, requirements, rounds |
| [IMPLEMENTATION-POINTERS.md](IMPLEMENTATION-POINTERS.md) | Where to go for implementation |

## Phasing (from PRD)

- **A**: Per-key editing in Env workspace; copy-paste; vendor scope; scope + mode in UI

## Config

`config.json`: `{"mode":"analysis","execution":false}`

## Cross-Reference

- Repo Studio analysis: [repo_studio_analysis/](../repo_studio_analysis/)
- forge-env package: [packages/forge-env/](../packages/forge-env/)
