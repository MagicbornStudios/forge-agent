# Agent Observability PRD

## Vision

Full observability of Codex: how many tools it calls, how many searches, what places (files, paths) it explores. Latency per step, total tokens, cost. Enables understanding agent behavior, spotting runaway/repetitive loops, tuning, and cost efficiency.

## Metrics to Capture

| Metric | Description | Source |
|--------|-------------|--------|
| Tool invocations | Count of tool calls per turn | Codex notifications (method matches tool/tool_use) |
| Searches | Count of search operations | Codex notifications (method matches search) |
| Exploration breadth | Unique files/paths touched | Aggregate from tool params (path, filePath, etc.) |
| Step latency | Time between events | Event timestamps |
| Total tokens | Input + output tokens | If Codex sends in completion/usage |
| Cost | Derived from tokens × model rate | If tokens available |

## Data Flow

1. **Codex session** receives JSON-RPC lines; `handleNotification` emits `type: 'event'` with `method`, `params`, `ts`.
2. **Event classifier** maps `method` to category: tool, search, read_file, write, etc.
3. **Turn aggregator** maintains per-turn counters and sets (tools, searches, paths).
4. **Expose**: API endpoint, UI panel, optional log stream.

## Deliverables

| Phase | Focus |
|-------|-------|
| A | Classify events (heuristics on method); aggregate per turn; real-time |
| B | Metrics API (`GET /api/repo/codex/turns/:turnId/metrics` or similar) |
| C | Observability workspace in Repo Studio (dedicated) |
| D | Tokens/cost—capture if Codex sends; estimate OK; derive cost from tokens × rate |

## Decisions (see DECISIONS.md)

- AO-01: Method classification via heuristics (method contains tool/search/read/write)
- AO-02: Dedicated Observability workspace
- AO-03: Real-time streaming metrics
- AO-04: Tokens/cost in scope; estimate sufficient

## Non-Scope

- Modifying Codex CLI itself
