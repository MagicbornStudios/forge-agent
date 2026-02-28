# Phase 25: Game simulation workspace

## Purpose

Build a **game simulation workspace** as an **extension workspace** (like Story). It has its own **parser** and **write path** for docs, looks and behaves like the Planning workspace (tree + viewport, parse/create files), and uses a **fixed naming** convention. Simulation content lives in a project folder (e.g. **`.concept`**). **DM-style simulation:** an entry point (e.g. `agent.md`) points Codex at the simulation; the assistant is **scoped only to this workspace's docs** during simulation—no other repo context. **Two-loop handoff:** concept/simulation loop (GRD, .concept) vs software/PRD loop; workspace cares about **one game loop + one PRD**. Reference copy of external game docs: `.tmp/dungeonbreak-docs-reference/` (run `pnpm reference:copy-dungeonbreak`).

## Key decisions (from discussion)

- **Name:** "Game simulation workspace" (not "game planning"), though it does planning/simulation.
- **Extension workspace:** New workspace (separate from Planning); own parser and ways to write docs for display.
- **Simulation scope:** Codex during simulation sees only the docs in the game simulation workspace (e.g. `.concept`); no concept of rest of repo.
- **Two loops:** (1) Concept/simulation loop — GRD, .concept, simulation entry point. (2) Software/PRD loop — implementation. Clear **handoff** from simulation to PRD.
- **One game loop + one PRD** per game simulation workspace.
- **Fixed naming conventions** for game loop and docs (Phase 24).

## Source of truth

- **`.planning/phases/25-game-simulation-workspace/`** — This phase folder.
- **Extension workspace pattern:** e.g. `packages/repo-studio-extension-adapters` (StoryExtensionWorkspaceAdapter); workspace catalog and extensions in Repo Studio.
- **Reference:** `.tmp/dungeonbreak-docs-reference/` (scratch, AGENTS.md, planning, concept) — for structure and naming only; not part of forge-agent .planning.

## Key documents

- **25-01-PLAN.md** — Game simulation workspace extension: register workspace; own parser and write path; tree + viewport; fixed naming; `.concept`; simulation entry point for Codex.
- **25-02-PLAN.md** — Two-loop handoff and scoping: concept vs PRD loop; assistant scoped to workspace docs only; handoff from simulation to PRD.

## Dependencies

- **Phase 24** (Loop model and multi-loop) recommended for naming and loop hierarchy.
- Existing extension workspace pattern (Story, workspace catalog, Repo Studio extensions).

## References

- [.planning/phases/24-loop-model-and-multi-loop/](../24-loop-model-and-multi-loop/), [docs/repo-studio-extensions.md](../../../docs/repo-studio-extensions.md).
- Story workspace: `packages/repo-studio-extension-adapters/src/StoryExtensionWorkspaceAdapter.tsx`; Planning workspace in repo-studio-app for tree/viewport/parser patterns.
