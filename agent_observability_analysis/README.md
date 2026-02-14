# Agent Observability Analysis Loop

Planning for full Codex observability: tool invocations, searches, exploration breadth, latency, tokens, cost.

## Goal

Track agent activity metrics during turns—how many tools, searches, places explored—for understanding behavior, spotting runaway loops, tuning, and cost awareness.

## Relationship

- Repo Studio codex-session.ts receives Codex JSON-RPC (notifications with method + params).
- Turn events are already captured (type: 'event', method, params); we need to classify and aggregate.
- Feeds: metrics API, observability UI, logs.

## Contents

| Document | Purpose |
|----------|---------|
| [PRD.md](PRD.md) | Metrics to capture; data sources; expose |
| [DECISIONS.md](DECISIONS.md) | AO-01 through AO-04: method heuristics, dedicated workspace, real-time, tokens/cost |
| [GAPS.md](GAPS.md) | Current vs target |
| [FINDINGS.md](FINDINGS.md) | Codex protocol; event structure |

## Config

`config.json`: `{"mode":"analysis","execution":false}`
