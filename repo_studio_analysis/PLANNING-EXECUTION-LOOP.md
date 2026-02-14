# Planning → Execution Loop

GSD-style planning before coding; Repomirror-style execution loops. Repo Studio orchestrates.

## Overview

| Phase | Model | Purpose |
|-------|-------|---------|
| **Planning** | GSD | Discuss → plan → verify. Specialized agents (research, planner, verifier). Produces plan. |
| **Execution** | Repomirror | Many parallel loops. Each = single agent in a while loop until done. Engineering-team scale. |
| **Sequence** | Alternating | Planning → Execution (many agents) → Planning → Execution → … |

## Planning (GSD-style)

- **Source**: [get-shit-done](https://github.com/gsd-build/get-shit-done)
- **Flow**: Discuss → Plan → Execute → Verify
- **Agents**: Orchestrator spawns specialized sub-agents (researchers, planners, executors, verifiers)
- **Output**: Plan (tasks, slices, context) that execution loops consume
- **When**: Before coding; between execution phases when re-planning needed

GSD = "stuff to do before coding." Planning phase produces a plan document/spec that execution loops use.

## Execution (Repomirror-style)

- **Source**: [repomirror](https://github.com/MagicbornStudios/repomirror) (Ralph Wiggum pattern)
- **Model**: Single agent in `while :; do cat prompt | claude -p --dangerously-skip-permissions; done`
- **No subagents**: Each loop = one agent iterating until done. "Many agents" = many parallel loops.
- **Scaling**: Repo Studio orchestrator spawns N loops, each with a slice of the plan (task, scope, files)
- **Trust**: `--dangerously-skip-permissions` or global trust so no approval prompts; proposals auto-applied
- **Commit**: One commit per file edit
- **Termination**: Agent can self-terminate (pkill) when done or stuck

Repomirror does not have subagents during execution. It's one agent in a loop. To get "engineering teams," spawn many parallel loops, each = one "engineer" with its slice.

## Orchestrator

**Repo Studio process** orchestrates both phases:

1. **Planning phase**: Spawn GSD-style agents; collect plan
2. **Execution phase**: Spawn N Repomirror-style loops; each gets prompt + scope from plan
3. **Review Queue**: Proposals from all loops → single queue (separate + aggregate views)
4. **Trust**: Global setting; auto-approve all vs require approval
5. **Back to planning**: When execution done (or stuck), re-run planning

## Cross-Reference

- [DECISIONS-WORKSPACE-PANELS.md](DECISIONS-WORKSPACE-PANELS.md) — Trust, queue, orchestrator
- [DECISIONS.md](DECISIONS.md) — DS-10, DS-11
- [agent_centric_ide_analysis/](../agent_centric_ide_analysis/) — Trust scope, sub-agents
