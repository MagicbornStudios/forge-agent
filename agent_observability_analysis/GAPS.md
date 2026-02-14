# Agent Observability Gaps

| Gap | Current | Target |
|-----|---------|--------|
| Event classification | Raw method + params stored | Classify via heuristics (method contains tool/search/read/write) |
| Per-turn aggregation | Events only | Counters: toolCalls, searches; set: pathsExplored; real-time |
| Metrics API | None | GET turn metrics (aggregated); stream updates |
| Observability UI | None | Dedicated Observability workspace |
| Tokens/cost | Unknown if Codex sends | Capture if available; estimate OK; cost = tokens × rate |

## Codex Protocol (to verify)

- Notification methods: use heuristics; log samples to refine if needed.
- Completion payload: usage (input_tokens, output_tokens)? Capture if sent.
