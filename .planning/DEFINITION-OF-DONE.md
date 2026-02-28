# Definition of Done (stage and artifact)

Single place that defines when each **stage** is done. Use it to close phases, run verify, and avoid ambiguity. Agents and humans should reference this to determine when a stage is complete.

## Stage: Planning (done)

- Loop has a PRD (or equivalent) with scope and goals.
- Phases and tasks are broken down and reflected in ROADMAP and TASK-REGISTRY for that loop.
- Human has committed planning artifacts.
- Status or checklist marks "ready for execution" (or equivalent).
- No execution work starts until planning stage is done for that scope.

## Stage: Execution (done)

- All tasks for the chosen scope are Complete in TASK-REGISTRY.
- Each plan's Done criteria are met.
- Phase Success criteria (if defined for that phase) are met.

## Stage: Review (done)

- Verification/UAT run as required.
- DECISIONS and ERRORS updated as needed.
- STATE and ROADMAP (and legacy snapshots if applicable) updated.
- Phase or release can be marked closed.

## PRD / scope (done for a release or phase)

- Scope for this release or phase is frozen and agreed (PRD or equivalent updated and committed).
- The product may evolve later; "PRD done" here means scope is stable for this slice of work.

## Artifact-level reminder

- **Task done** = status Complete in TASK-REGISTRY.
- **Plan done** = plan's Done criteria (in the plan doc) are met.
- **Phase done** = phase Success criteria (see phase PRD or CONTEXT) are met.

---

## PRD per loop

- Each loop has a **planning root**: default = `.planning/`, others = `.planning/loops/<loopId>/`.
- Each planning root may contain `PRD.md` (or a named PRD, e.g. `PLATFORM-PRD.md`). When a loop is a product or feature area, put a PRD in that root so scope and goals are explicit.
- Repo Studio and repo-data already load core files (including PRD.md) per planning root; no code change required.
