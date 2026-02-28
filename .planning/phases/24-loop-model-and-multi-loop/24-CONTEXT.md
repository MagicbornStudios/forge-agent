# Phase 24: Loop model and multi-loop

## Purpose

Document and implement **loop hierarchy** (new scope = new loop; when scope grows, that loop can become a **child** of a bigger "meta" loop), **fixed naming conventions** for loop and planning docs, **max doc size** with contextual summarize/archive, and how Repo Studio and coding agents **discover** loop docs. Extends or aligns with Phase 21 (artifact layout and loop efficiency).

## Key decisions (from discussion)

- **New product/scope = new loop.** When scope gets bigger, the original loop can become a **child** of a meta loop (e.g. monorepo PRD at root, original app/game as child).
- **Fixed naming conventions** for GRD/PRD and loop-related docs so agents and UI can reliably find them.
- **Max size** for key planning docs with **contextual summarize and archive** (something like this may already be planned; wire or document).
- **Sub-loops:** Multiple planning efforts with **separate loop IDs**; child loops can belong to a meta loop (e.g. monorepo PRD childing a Next.js app loop).

## Source of truth

- **`.planning/`** — PRIMARY. STATE, ROADMAP, LOOPS.json, TASK-REGISTRY, and this phase folder.
- **`apps/repo-studio/src/lib/repo-data.ts`** — planning root per loop, `loadLoopIndex`, `loadRepoStudioSnapshot`; loop resolution (e.g. lines 106, 140–163, 401–406).

## Key documents

- **24-01-PLAN.md** — Loop hierarchy and naming: when to create child loops; fixed naming conventions; LOOPS.json and `.planning/loops/<loopId>/` discoverability.
- **24-02-PLAN.md** — Max doc size and summarize/archive: define max size for key docs; contextual summarize and archive; wire or document existing mechanisms.

## Dependencies

- **Phase 21** (Artifact layout and loop efficiency) recommended first. Can run in parallel with Phase 22–23.

## References

- [.planning/STATE.md](../../STATE.md), [.planning/ROADMAP.md](../../ROADMAP.md), [.planning/phases/21-artifact-layout-and-loop-efficiency/](../21-artifact-layout-and-loop-efficiency/).
- Multi-loop: `LOOPS.json`, `.planning/loops/<loopId>/`, `repo-data.ts` (planning root per loop, activeLoopId).
