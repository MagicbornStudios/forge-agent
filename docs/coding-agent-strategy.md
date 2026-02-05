---
created: 2026-02-04
updated: 2026-02-04
---

# Coding agent strategy

How we use agent artifacts in this codebase, and how to extend or benchmark agent workflows.

## Purpose

We maintain explicit **agent artifacts** so that:

- **Consistent behavior:** Agents (and humans) have a single source of truth for "what is true now," "what we decided," and "what not to repeat."
- **Fewer repeated mistakes:** Known failures and fixes are greppable; agents check before retrying a pattern.
- **Onboarding:** Treat the agent like a new hire—it only reads what's explicit. STATUS, decisions, errors-and-attempts, and per-area AGENTS.md give it the same context we'd give a developer.

## What we treat as agent artifacts

See **[agent-artifacts.md](agent-artifacts.md)** for the full index. In short:

- **STATUS.md** — Current state, Ralph Wiggum loop, next steps. Updated after each slice.
- **decisions.md** — Architecture decision records (persistence, data layer, boundaries). Updated when we accept or reject a significant choice.
- **errors-and-attempts.md** — Log of known failures and fixes. Do not repeat; add new entries when we fix something that cost time.
- **AGENTS.md** (root + per-package) — Rules, conventions, and loops for the area. One canonical file per critical area; no duplicate "for agents" copies elsewhere.

## How agents are expected to use them

1. **Before a slice:** Read [STATUS.md](STATUS.md) and the relevant AGENTS.md (root + shared/workspace when touching workspaces). Understand current state and next.
2. **Before retrying a failed approach:** Check [errors-and-attempts.md](errors-and-attempts.md). If the failure is documented, follow the fix instead of retrying the same pattern.
3. **When changing persistence or data layer:** Read [decisions.md](decisions.md) and [11-tech-stack.mdx](11-tech-stack.mdx); update them when making or rejecting a significant choice.
4. **After a slice:** Update STATUS (including the Ralph Wiggum loop) and any AGENTS/README that the change affects.

## Adding or changing agent artifacts

- **New AGENTS.md:** Add one when you introduce a new package or a critical area that needs its own rules (e.g. naming, boundaries, "do not"). Keep one source of truth; link from root AGENTS.md or agent-artifacts.md.
- **errors-and-attempts:** Add an entry when you fix something that wasted time (wrong API, import order, duplicate registration). Short: problem + fix; link to example code if helpful.
- **decisions:** Add (or update) when you make or reject a significant architectural choice. Format: decision, rationale, and "update this doc when X."
- **Avoid duplication:** Do not copy agent content into multiple files. Point to the canonical doc from READMEs or human-facing guides.

## Implementing your own / benchmarking

This setup supports:

- **Custom agent workflows:** Same entry points (agent-artifacts.md, AGENTS.md) every run; "stateless but iterative" loops: rehydrate with STATUS + relevant AGENTS.md + spec, then implement.
- **Benchmarking and fine-tuning:** You can measure agent accuracy and speed against "did it read STATUS first?", "did it check errors-and-attempts before retry?", "did it update STATUS after?" Use the same artifact set so runs are comparable.
- **Toolchain integration:** In Cursor/Claude/VSCode, configure rules to "always include docs/agent-artifacts.md and root AGENTS.md (plus matching domain AGENTS.md) in context." Document that in your own runbook.

For more on task structure and agent workflows (spec-first, validation scripts, checkpoints), see the strategies referenced in the repo docs and your own runbooks.
