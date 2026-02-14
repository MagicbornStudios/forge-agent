# Agent Observability Findings

## Current Repo Studio State

- `codex-session.ts` parses JSON-RPC from Codex stdin.
- `handleNotification` receives all notifications; emits `type: 'event'` with `method`, `params`, `ts`.
- Turn events stored in `turn.events`; streamed via SSE `/api/repo/codex/turn/stream`.
- No aggregation; no metrics extraction.
- `extractFilesFromUnknown` / `extractDiffFromUnknown` already exist for params (path, filePath, diff, etc.).

## Codex Protocol (inferred)

- Notifications: `method` + `params`. Examples to confirm: tool invocations, search, turn/completed, turn/failed.
- Server requests: `requestApproval` (handled). Others may exist.
- Need to log sample notifications to document exact method names.

## Implementation Pointer

- Extend `handleNotification` or add post-processing: when `event.type === 'event'`, classify `event.method` via heuristics (method contains `tool`, `search`, `read`, `write`), extract paths from params via `extractFilesFromUnknown`, increment counters.
- Maintain `turn.metrics` in real time; emit updates on each classified event for live UI.
- Store aggregated metrics on turn: `{ toolCalls, searches, pathsExplored, tokens?, cost? }`.
- If Codex sends usage: capture input/output tokens; derive cost estimate from tokens × model rate.
