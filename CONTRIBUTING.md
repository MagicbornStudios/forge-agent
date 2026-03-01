# Contributing

Human workflow for contributing to this repo. For agent rules and artifact index, see [AGENTS.md](AGENTS.md) and [docs/18-agent-artifacts-index.mdx](docs/18-agent-artifacts-index.mdx).

## Branch and PR expectations

- Prefer a branch per slice or feature. Open a PR when the work is ready for review.
- Fill out the [pull request template](.github/pull_request_template.md): link task/initiative, confirm tests and doc updates, note UI/screenshot if applicable. Same "Definition of Done" as in our agent strategy.

## Package manager

- pnpm is pinned via `packageManager` in root `package.json`. Use Corepack locally (`corepack enable`).
- When changing `pnpm.overrides` or adding dependencies, run `pnpm install` and commit `pnpm-lock.yaml`.

## Running tests and lint

- **Tests:** `pnpm test` (Studio). Run before claiming a slice is done.
- **Types:** `pnpm payload:types` after changing Payload collections (regenerates `packages/types/src/payload-types.ts`).
- **Dead code:** `pnpm knip` at root when cleaning up; triage with [knip-findings](docs/agent-artifacts/core/knip-findings.md).

## What docs to update when

- **After a slice:** Update [STATUS.md](docs/agent-artifacts/core/STATUS.md) (including Ralph Wiggum Done list) and any AGENTS/README the change affects. See [19-coding-agent-strategy](docs/19-coding-agent-strategy.mdx).
- **When something breaks and you fix it:** Add an entry to [errors-and-attempts](docs/agent-artifacts/core/errors-and-attempts.md) (problem + fix) so we don’t repeat it.
- **When you make or reject an architectural choice:** Update [decisions](docs/agent-artifacts/core/decisions.md).
- **When you add/remove/relocate an AGENTS.md or core artifact:** Update root [AGENTS.md](AGENTS.md) and [18-agent-artifacts-index.mdx](docs/18-agent-artifacts-index.mdx) (index integrity).

## Finding work

- **Strategy and loop:** Same as agents — [19-coding-agent-strategy](docs/19-coding-agent-strategy.mdx); [STATUS](docs/agent-artifacts/core/STATUS.md) and [task-registry](docs/agent-artifacts/core/task-registry.md) for what to do next.
- **Granular tasks:** [task-registry](docs/agent-artifacts/core/task-registry.md) and per-initiative breakdowns (e.g. [task-breakdown-platform-monetization](docs/agent-artifacts/core/task-breakdown-platform-monetization.md)). Prefer Tier 2/3 open tasks.
- **High-level next steps:** [STATUS § Next](docs/agent-artifacts/core/STATUS.md).
- **Known issues / what’s broken or locked:** [ISSUES.md](ISSUES.md).

## Capabilities and style

- **What the repo assumes:** See [SKILLS.md](SKILLS.md) (stack, testing, doc expectations).
- **Styling and UI:** [styling-and-ui-consistency](docs/agent-artifacts/core/styling-and-ui-consistency.md); optional screenshots by humans to `docs/images/`.
