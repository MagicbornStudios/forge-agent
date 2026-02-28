# Phase 23: Repo review and cleanup — GSD/Cursor setup, analysis consolidation, layout and legacy

## Purpose

Single phase to align tooling (GSD + Cursor), consolidate or clarify analysis artifacts, and document repo layout. Reduces confusion and tech debt: Cursor agents follow the same phase workflow as Codex; analysis folders and ANALYSIS-LOOPS/ANALYSIS-REFERENCES match reality; expected repo structure (apps, packages, vendor, docs, legacy) is written down so future work stays aligned.

## Current gaps

- GSD installs into `.codex/` (Codex-only); Cursor has no explicit rule to use .planning and forge-loop the same way.
- Multiple analysis folders (repo_studio_analysis, forge_env_analysis, ide_navigation_analysis, etc.) and ANALYSIS-LOOPS list six loops; some folders may be missing or redundant; no single "why it was like that" and what the single loop is.
- Repo layout (app vs apps, vendor vs submodules, extensions, platform, docs vs apps/docs, legacy) is implied in docs but not one place; .cursor/plans has many ad-hoc plans that can conflict with .planning phases.

## Source of truth

- **`.planning/`** — PRIMARY. STATE, ROADMAP, TASK-REGISTRY, DECISIONS, and this phase folder.
- [AGENTS.md](../../../AGENTS.md), [docs/18-agent-artifacts-index.mdx](../../../docs/18-agent-artifacts-index.mdx), [ANALYSIS-LOOPS.md](../../../ANALYSIS-LOOPS.md), [.planning/ANALYSIS-REFERENCES.md](../../ANALYSIS-REFERENCES.md).

## Key documents

- **23-01-PLAN.md** — GSD install and Cursor alignment: verify pnpm gsd:install, .gitignore .codex, Cursor rule/skill, "Cursor with this repo" doc.
- **23-02-PLAN.md** — Analysis consolidation: audit folders, decide model (consolidate/archive/trim), update ANALYSIS-LOOPS and ANALYSIS-REFERENCES, document.
- **23-03-PLAN.md** — Repo layout and legacy cleanup: expected layout doc, app vs apps wording, legacy/snapshots, .cursor/plans hygiene.

## Dependencies

- Phase 23 can run in parallel with 19–22; no hard dependency. Recommended after Phase 22 so cleanup follows UX refactor.

## References

- [vendor/get-shit-done/FORGE-FORK.md](../../../vendor/get-shit-done/FORGE-FORK.md), [scripts/gsd-install.mjs](../../../scripts/gsd-install.mjs), [docs/how-to/24-vendoring-third-party-code.mdx](../../../docs/how-to/24-vendoring-third-party-code.mdx).
