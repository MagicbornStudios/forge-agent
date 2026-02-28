# Phase 25: Concept simulation workspace

## Purpose

Build a **concept simulation workspace** as an **extension workspace** for **concept discovery** — finding tech/features to build by simulating as if they exist. **Fully replaces and deprecates the Story workspace extension.** Planning and Code workspaces are for committed projects, tasks, and production-ready work. Concept simulation is for **PoCs and discovery** not tied to major tech. **Docs-only simulation:** agent reads concept docs, simulates in text, records discoveries. Output: **DISCOVERED-FEATURES.md**. **First-class concept types:** **game** and **story** (like a book) are primary types; **software** (small PoC) as additional. Type is **fixed at creation** — cannot change after initial set. **Extension location:** Concept workspace lives in **repo-studio-extensions** (extensions repo); **src downloadable into user project** so users can extend it for their needs. Simulation content in **`.concept`**. Reference: `.tmp/dungeonbreak-docs-reference/` (run `pnpm reference:copy-dungeonbreak`).

## Key decisions (from discussion)

- **Name:** "Concept simulation workspace". **First-class concept types:** game, story (book), software (small PoC).
- **Type immutable:** Concept type is set at creation; cannot change afterward.
- **Deprecate Story extension:** Concept workspace replaces Story. Story becomes a concept type (story) within concept simulation.
- **Extension in extensions repo:** Concept workspace is an extension in `vendor/repo-studio-extensions` (repo-studio-extensions repo); not built-in.
- **Src downloadable:** Extension src can be downloaded into user's project (e.g. `.repo-studio/extensions/concept-workspace/`) so users can extend it.
- **Simulation scope:** Codex during simulation sees only the docs in this workspace (e.g. `.concept`); no concept of rest of repo.
- **Docs-only simulation:** Agent reads concept docs, simulates as if tech/features exist. No MCP by default. Output: DISCOVERED-FEATURES.md.
- **Two loops:** (1) Concept/simulation loop — GRD, .concept, simulation entry point. (2) Software/PRD loop — implementation. Handoff: discoveries → planning.
- **One concept loop + one PRD** per concept simulation workspace.
- **Fixed naming conventions** for concept loop and docs (Phase 24).
- **Workspace roles:** Planning = planning loop (committed projects). Concept = discovery loop (PoCs, simulate as if exists). Code = implementation loop (production).

## Source of truth

- **`.planning/phases/25-game-simulation-workspace/`** — This phase folder.
- **Extension in repo-studio-extensions:** `vendor/repo-studio-extensions/extensions/concept-workspace/` (or similar). Host adapter in `packages/repo-studio-extension-adapters` (e.g. ConceptExtensionWorkspaceAdapter).
- **Reference:** `.tmp/dungeonbreak-docs-reference/` (scratch, AGENTS.md, planning, concept) — for structure and naming only; not part of forge-agent .planning.

## Key documents

- **25-01-PLAN.md** — Concept workspace extension (extensions repo); first-class types (game, story, software); type fixed at creation; deprecate Story; src downloadable; parser, tree, viewport, `.concept`, entry point, DISCOVERED-FEATURES.
- **25-02-PLAN.md** — Two-loop handoff and scoping: concept vs PRD loop; assistant scoped to workspace docs only; handoff from simulation to PRD.

## Dependencies

- **Phase 24** (Loop model and multi-loop) recommended for naming and loop hierarchy.
- Existing extension workspace pattern (Story, workspace catalog, Repo Studio extensions).

## References

- [.planning/phases/24-loop-model-and-multi-loop/](../24-loop-model-and-multi-loop/), [.planning/phases/27-repo-studio-documentation/](../27-repo-studio-documentation/), [docs/repo-studio-extensions.md](../../../docs/repo-studio-extensions.md).
- Story workspace (to be deprecated): `packages/repo-studio-extension-adapters/src/StoryExtensionWorkspaceAdapter.tsx`; concept workspace will replace it.
