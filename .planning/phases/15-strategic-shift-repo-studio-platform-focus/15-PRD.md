# Phase 15 — Product intent: Repo Studio + Platform focus

## Vision

**We ship Repo Studio as the primary product, backed by the platform.** Legacy Studio app (Character, Dialogue workspaces) is archived. Forge graphs and Yarn Spinner dialogue are deprecated. Consumer-studio and Dialogue become extensions (in another repo or submodule). The only main apps we actively develop are **Repo Studio** and the **platform** that supports it.

## Goals

1. **Archive the Studio app** — The app in `apps/studio` (Character workspace, Dialogue workspace) is archived. No new feature work there; it is preserved for reference or extraction only.
2. **Move Character workspace to extensions** — Character workspace is extracted and moved to an **extensions submodule** (or separate repo) and consumed as an extension; it is no longer part of the main monorepo apps.
3. **Move Dialogue workspace out of main apps** — Dialogue workspace lives in the **other repo** (extensions), not in `apps/studio` or any main app. Same extension/submodule pattern as Character.
4. **Deprecate forge graphs and Yarn Spinner dialogue on platform** — Platform data and APIs that “still work well” are kept. **Forge graphs** are deprecated; we will not work on graph support for a long time. **Yarn Spinner dialogue support** is deprecated. Platform roadmap prioritizes **support for Repo Studio** (e.g. desktop auth, API keys, OpenRouter proxy, connection validation). Platform product details and gateway roadmap are in [.planning/PLATFORM-PRD.md](../../PLATFORM-PRD.md); human setup is in [.planning/HUMAN-TASKS.md](../../HUMAN-TASKS.md).
5. **Consumer-studio as extension** — `apps/consumer-studio` is not a main app. It is turned into a **bare-bones extension** (e.g. in the extensions repo) that people can use as a reference to build their own studios. Same pattern as other community extensions.
6. **Single focus** — All product and platform effort is aligned to **Repo Studio** and **platform**. No parallel investment in Studio app, consumer-studio as a first-class app, or graph/dialogue platform features.

## Out of scope (for this phase’s intent)

- Rebuilding Character or Dialogue as full in-repo apps.
- New forge graph or Yarn Spinner dialogue features on the platform.
- Keeping `apps/studio` as an actively developed product.

## Success criteria (Ralph Wiggum style)

- **Decisions** — All strategic choices (archive Studio, deprecate graphs/dialogue, platform supports Repo Studio, extension moves) are recorded in `.planning/DECISIONS.md`.
- **Tasks** — Phase 15 tasks exist in `.planning/TASK-REGISTRY.md` and are traceable to plans (15-01, 15-02, …).
- **Plans** — A master plan (15-01) and, as needed, follow-on plans document scope, order, and acceptance so that discussion loops and execution are clear.
- **PRD/roadmap** — ROADMAP and REQUIREMENTS reflect Phase 15 and any new requirements; PROJECT or PRD text reflects “Repo Studio + platform focus” and archived/deprecated areas.
- **Loop usage** — Work proceeds via discuss → plan → execute → verify; `forge-loop sync-legacy` is run after loop output to keep legacy snapshots updated.

## Stakeholders

- Product/engineering: alignment on Repo Studio as primary product and platform as backend.
- Agents and humans: use `.planning` as source of truth; no reliance on legacy docs for “what we are building next.”
