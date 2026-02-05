# Agent engine - Agent rules

## Owner

Agent Engine Engineer: owns `packages/agent-engine` workflow runtime and registry (domain workflows live in domain packages or apps).

## Loop

Read `docs/agent-artifacts/core/STATUS.md` and root `AGENTS.md`. Implement one vertical slice, then update STATUS and any relevant AGENTS.

## Rules

- No UI components in this package.
- Workflows emit events (plan, patch, review) and never commit data directly.
- Use shared patch envelope types from `@forge/shared/copilot/workflows`.
- Domain-specific types live in domain packages; this runtime stays domain-agnostic.
- Streaming happens over SSE in app routes; engine only emits events.
