# Phase 16: Repo Studio canonical submodule and monorepo shape

## Purpose

Repo Studio app source of truth lives in a separate GitHub repo ([MagicbornStudios/RepoStudio](https://github.com/MagicbornStudios/RepoStudio)). This phase adds that repo as a **submodule** in forge-agent and, after verification, switches the monorepo to **build from the submodule** (canonical). The monorepo becomes: **shared packages for everyone + platform (exposed) + Repo Studio app via submodule**.

## Source of truth

- **`.planning/`** — PRIMARY. STATE, ROADMAP, DECISIONS, TASK-REGISTRY, and this phase folder.
- Repo Studio app canonical source: **MagicbornStudios/RepoStudio** (separate repo).

## Key documents

- **16-01-PLAN.md** — Phase 1: Add submodule; verify it is in the GitHub repo, can be pulled down, and builds in the monorepo.
- **16-02-PLAN.md** — Phase 2: Switch to canonical build from submodule (update workflow and build scripts; remove or repoint in-repo app/package as needed).
- **DECISIONS.md** — Decision: Repo Studio app is canonical in the other repo; included as submodule; we switch after Phase 1 verification.

## Current understanding

1. **Repo Studio repo** — [MagicbornStudios/RepoStudio](https://github.com/MagicbornStudios/RepoStudio). Initial commits are in progress there. Codex is working on Electron release (e.g. .tmp gitlinks fix, Windows symlink copy) for v0.1.1.
2. **forge-agent** — Stays public. Contains shared packages, **docs site** (apps/docs; Vercel deploy from here), and will include Repo Studio app via **submodule** at `vendor/repo-studio`. **Platform** is in its own repo (RepoStudio-Platform) and included as submodule at `vendor/platform` from Phase 17; platform deploys to Vercel from that repo.
3. **Canonical** — The submodule is canonical. We **switch** to building from the submodule only after we confirm: (a) the repo is on GitHub and can be pulled, (b) it builds in the monorepo.
4. **Phases** — Phase 1: add submodule + verify (in repo, pull, build). Phase 2: switch to canonical (build from submodule; adjust workflow and paths).
5. **Public install** — Electron release (tag `v*`, GitHub Release with .exe) can remain on forge-agent; the workflow builds from the submodule once Phase 2 is done.

## Dependencies

- Phase 15 release cut (FRG-1526/1527) and Codex’s release fixes (workflow/Windows build) are in progress.
- RepoStudio repo exists on GitHub with initial structure; we add it as submodule and verify before switching.

## References

- [.planning/STATE.md](../../STATE.md), [.planning/ROADMAP.md](../../ROADMAP.md), [.planning/DECISIONS.md](../../DECISIONS.md).
- Release workflow: [.github/workflows/release-repo-studio-desktop.yml](../../../.github/workflows/release-repo-studio-desktop.yml).
- Desktop build: [packages/repo-studio/src/desktop/build.mjs](../../../packages/repo-studio/src/desktop/build.mjs), [next-server.mjs](../../../packages/repo-studio/src/desktop/next-server.mjs).
