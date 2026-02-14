# Agent Observability Decisions

Decisions from the analysis loop. No implementation yet.

## AO-01: Codex Method Classification

**Decision**: Derive heuristics from `method` string (e.g. contains `tool`, `search`, `read`, `write`). Fallback: log sample notifications to document exact method names if heuristics insufficient.

**Rationale**: Codex protocol exact method names are TBD. Heuristics unblock implementation; logging can refine later.

## AO-02: UI Placement

**Decision**: **Dedicated Observability workspace** in Repo Studio. Own workspace; not a panel inside Codex Assistant.

**Rationale**: Full surface for metrics; distinct from assistant chat.

## AO-03: Real-Time vs Post-Turn

**Decision**: **Real-time** metrics. Compute and display live during the turn; update as events stream.

**Rationale**: User wants to see metrics as the agent runs, not only after completion.

## AO-04: Tokens / Cost

**Decision**: **In scope.** Capture and expose if Codex sends; derive cost from tokens × model rate. **Estimate OK**—don't need real numbers; approximate cost is sufficient.

**Rationale**: Cost awareness for tuning and runaway detection.
