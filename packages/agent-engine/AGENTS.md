# Agent engine - Agent rules

## Owner

Agent Engine Engineer: owns `packages/agent-engine` workflow runtime, registry, and domain workflow implementations.

## Loop

Read `docs/STATUS.md` and root `AGENTS.md`. Implement one vertical slice, then update STATUS and any relevant AGENTS.

## Rules

- No UI components in this package.
- Workflows emit events (plan, patch, review) and never commit data directly.
- Use shared patch envelope types from `@forge/shared/copilot/workflows`.
- Domain-specific types come from `@forge/types` or domain packages; do not import app code.
- Streaming happens over SSE in app routes; engine only emits events.
