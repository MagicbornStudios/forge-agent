# Agent-Centric IDE Decisions

## AO-01: Trust Scope for Auto-Approve

**Decision**: Support trust scopes—certain loops/domains can be configured for auto-approve. Proposals in trusted scope apply automatically; no Review Queue prompt.

**Rationale**: User runs with "full access" when desired; overnight and sub-agent runs need to proceed without human approval.

**Scopes**: Loop-level (planning vs code), domain-level (story vs code), or global override (auto-approve all).

## Proposed Topics

- "Agent-centric IDE" vs "orchestration shell" vs "loop runner"
- How much to lean on Inngest comparison (event-driven vs loop-driven)
- Codegen priority: what to add next (env manifest, command policy, descriptors)
