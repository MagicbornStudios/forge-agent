# SKILLS — Capabilities contract

Defines what agents and contributors may safely assume about this repository.

For behavior and workflow rules, see [AGENTS.md](AGENTS.md) and [CONTRIBUTING.md](CONTRIBUTING.md).

If guidance conflicts: follow **SKILLS.md** unless [AGENTS.md](AGENTS.md) explicitly overrides it.

---

## You can assume

### Stack and architecture
- TypeScript, React, Next.js (App Router)
- Payload CMS backend
- pnpm monorepo: `apps/studio`, `apps/marketing`, `packages/*`
- Zustand state, TanStack Query data fetching
- Tailwind CSS + shadcn-style UI via `@forge/ui`

### Editor platform
- Shared editor system lives in `@forge/shared`
- Single application shell controls project context
- DockLayout + slots are extension points  
See: [packages/shared/src/shared/AGENTS.md](packages/shared/src/shared/AGENTS.md)

### API boundary (important)
- Components **never call `/api/*` directly**
- Always use client modules in `lib/api-client/`
- Payload access happens only through API routes or SDK helpers  
See root [AGENTS.md](AGENTS.md) § Persistence and data layer

### Testing expectations
- Studio uses Jest
- Run `pnpm test` before claiming work complete
- `"N/A"` only allowed for docs/config/build-only changes (state reason in PR)

---

## You must NOT assume

- Direct Payload REST or GraphQL calls from the browser
- Creating per-app UI atoms instead of using `@forge/ui`
- Manual plan checks instead of `FeatureGate` + CAPABILITIES
- Implementing backlog items marked `proposed`  
  (human must mark `accepted`)  
  → [enhanced-features-backlog](docs/agent-artifacts/core/enhanced-features-backlog.md) § Process
- Editing `.tmp/`, downloaded, or generated reference files

---

## Work completion expectations

After finishing a slice:

1. Update **STATUS → Ralph Wiggum Done**  
   (or explain in PR why no update is needed)
2. Update affected AGENTS/README if behavior changed
3. Record time-wasting fixes in  
   [errors-and-attempts](docs/agent-artifacts/core/errors-and-attempts.md)
4. If AGENTS or core artifacts moved/added:  
   update [18-agent-artifacts-index](docs/18-agent-artifacts-index.mdx) and root [AGENTS.md](AGENTS.md)

---

## Navigation and style expectations

- Prefer **rg/grep**, **list_dir/LS**, **Read**  
  → [tool-usage](docs/agent-artifacts/core/tool-usage.md)
- Follow UI conventions  
  → [styling-and-ui-consistency](docs/agent-artifacts/core/styling-and-ui-consistency.md)
- Screenshots optional (humans) → `docs/images/`

---

## References

- **Agent strategy and loop:** [19-coding-agent-strategy](docs/19-coding-agent-strategy.mdx) and [18-agent-artifacts-index](docs/18-agent-artifacts-index.mdx).
- [Tool usage](docs/agent-artifacts/core/tool-usage.md) — how to search and navigate
- [Decisions](docs/agent-artifacts/core/decisions.md) — architecture rules
- [Errors and attempts](docs/agent-artifacts/core/errors-and-attempts.md) — avoid repeated mistakes
