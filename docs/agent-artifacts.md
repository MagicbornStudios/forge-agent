---
created: 2026-02-04
updated: 2026-02-04
---

# Agent artifacts index

These files are maintained for AI/coding agents to read and use when modifying the codebase. Keep them accurate and greppable; avoid redundant copies.

## Global agent docs

- **[docs/STATUS.md](STATUS.md)** — Current state, Ralph Wiggum loop, next steps.
- **[docs/decisions.md](decisions.md)** — Architecture decisions and rationale.
- **[docs/errors-and-attempts.md](errors-and-attempts.md)** — Known failures and fixes (do not repeat).
- **[AGENTS.md](../AGENTS.md)** (root) — Global agent rules, loop, conventions.

## Per-package / per-area AGENTS.md

- [packages/shared/src/shared/AGENTS.md](../packages/shared/src/shared/AGENTS.md)
- [packages/shared/src/shared/components/workspace/AGENTS.md](../packages/shared/src/shared/components/workspace/AGENTS.md)
- [packages/shared/src/shared/workspace/AGENTS.md](../packages/shared/src/shared/workspace/AGENTS.md)
- [packages/ui/AGENTS.md](../packages/ui/AGENTS.md)
- [packages/agent-engine/AGENTS.md](../packages/agent-engine/AGENTS.md)

## Documentation conventions (human vs agent)

- **Agent artifacts** (this index): For AI/coding agents. Format: `.md`. No number prefix. Examples: STATUS.md, decisions.md, errors-and-attempts.md, agent-artifacts.md, coding-agent-strategy.md, root and per-package AGENTS.md.
- **Human-facing official docs:** Linked from [00-docs-index.mdx](00-docs-index.mdx). Purpose: tutorials, architecture, reference for contributors. Format: `.mdx`. Use number prefix by category (how-to 00–09, architecture 01–03, design 01–, top-level guides 10–17) so they are clearly "official" and ordered.
- **Root README / SETUP:** For GitHub and first-time readers; remain `.md`. Both humans and agents read them.
- **Rule:** If a doc is not an agent artifact and not a root-level README/SETUP for the repo, it should be `.mdx` and, if in the official index, use the number prefix. This keeps humans and agents from confusing ad-hoc docs with curated docs we maintain.

## Search strategy

For any task: (1) Grep `docs/` and relevant `AGENTS.md` first. (2) Check [errors-and-attempts.md](errors-and-attempts.md) before retrying a failed pattern. (3) See [coding-agent-strategy.md](coding-agent-strategy.md) for how we use and extend these artifacts.
