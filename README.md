---
created: 2026-02-04
updated: 2026-02-13
---

# Forge Agent

An AI-first studio for interactive narrative: Dialogue and Character editors, clean editor primitives, and Assistant UI + LangGraph. Build your own workspace, ship it, and contribute it back—we're set up for that.

---

## Quick start

**Prerequisites:** Node 20+, pnpm 9+

```bash
pnpm install
pnpm dev
```

If env keys are missing, the **env portal** opens in your browser. Fill required values (e.g. `PAYLOAD_SECRET`, `OPENROUTER_API_KEY`), click Save, then rerun `pnpm dev`. Open **http://localhost:3000** for Studio with Dialogue and Character tabs. Local auto-login uses seeded admin (`admin@forge.local` / `admin12345`) when `NEXT_PUBLIC_LOCAL_DEV_AUTO_ADMIN=1`.

**Manual setup:** `pnpm env:portal` or `pnpm env:setup`. See [SETUP.md](SETUP.md).

---

## What to expect

- **Studio UI:** Project switcher, Dialogue/Character editors, right-rail Inspector + Chat
- **In-app docs:** [http://localhost:3000/docs](http://localhost:3000/docs) — how-tos, architecture, AI
- **Payload types:** Run `pnpm payload:types` after collection changes

---

## AI and LangGraph (in progress)

We are migrating from a single-stream chat path to **LangGraph** orchestration. Both paths coexist; feature flags control rollout.

| Flag | Purpose |
|------|---------|
| `AI_LANGGRAPH_ENABLED` | Server: enable LangGraph path in `/api/assistant-chat` |
| `NEXT_PUBLIC_AI_LANGGRAPH_ENABLED` | Client: transport metadata for LangGraph |

See [AI migration index](docs/ai/migration/00-index.mdx).

---

## Studio and editor platform

**Studio** (`apps/studio`) is the single app root: registries (editor, menu, panel, settings), declarative layout. **Editor primitives** (`packages/shared`) provide `EditorShell`, `EditorDockLayout`, `EditorDockPanel`, and design tokens.

**Opinionated design:**
- UI-first slots: `EditorDockLayout.Left` / `.Main` / `.Right` — no imperative APIs
- Domain-scoped context: `data-domain` for theming
- Compact density tokens: `--control-*`, `--panel-padding`, `--tab-height`

**Key components:**
- [EditorShell, EditorDockLayout](packages/shared/src/shared/components/editor/README.md)
- [Editor platform architecture](docs/architecture/01-editor-platform.mdx)
- [Design language](docs/design/03-design-language.mdx)

---

## Open source roadmap

Foundational editor components (`@forge/shared`, `@forge/ui`) will be open sourced. Repo structure and API contracts are designed for consumption.

- [Component library and registry](docs/architecture/02-component-library.mdx)
- [Verdaccio and local registry](docs/how-to/25-verdaccio-local-registry.mdx)

---

## Ralph Wiggum loop

We now run a `.planning`-first lifecycle with the internal `forge-loop` CLI.

**Loop in one sentence:** `new-project -> discuss-phase -> plan-phase -> execute-phase -> verify-work -> progress -> sync-legacy`
**Runtime policy:** prompt-pack only, no provider SDK/API coupling required.
**Package:** `@forge/forge-loop` (bin: `forge-loop`).

### Command chain

```bash
pnpm forge-loop:new-project -- --profile forge-agent
pnpm forge-loop:discuss-phase -- 1
pnpm forge-loop:plan-phase -- 1
pnpm forge-loop:execute-phase -- 1 --non-interactive
pnpm forge-loop:verify-work -- 1 --non-interactive --strict
pnpm forge-loop:doctor
pnpm forge-loop:progress
pnpm forge-loop:sync-legacy
```

### Source of truth and continuity

- Source of truth: `.planning/*` (PROJECT, REQUIREMENTS, ROADMAP, STATE, DECISIONS, ERRORS, TASK-REGISTRY).
- Temporary migration/refactor queue: `.planning/TEMP-REFACTOR-BACKLOG.md`.
- Legacy continuity: `docs/agent-artifacts/core/*` is snapshot-synced with generated markers.
- Legacy sections outside generated markers remain manual and untouched.

**Workflow guide:** [docs/how-to/forge-loop-workflow.mdx](docs/how-to/forge-loop-workflow.mdx)
**Artifacts index:** [docs/18-agent-artifacts-index.mdx](docs/18-agent-artifacts-index.mdx)
**Manual usage:** [docs/how-to/forge-loop-manual-usage.mdx](docs/how-to/forge-loop-manual-usage.mdx)
**Agent usage:** [docs/how-to/forge-loop-agent-usage.mdx](docs/how-to/forge-loop-agent-usage.mdx)
**Package runbooks:** [packages/forge-loop/docs/01-quickstart.md](packages/forge-loop/docs/01-quickstart.md)
**Package entrypoint:** `npx @forge/forge-loop --help` (after publish)

---

## Documentation

| Section | Links |
|---------|-------|
| **Start here** | [docs/index.mdx](docs/index.mdx) |
| **How-to guides** | [how-to/00-index.mdx](docs/how-to/00-index.mdx) |
| **Architecture** | [architecture/00-index.mdx](docs/architecture/00-index.mdx) |
| **AI architecture** | [ai/00-index.mdx](docs/ai/00-index.mdx) |
| **Agent artifacts** | [18-agent-artifacts-index.mdx](docs/18-agent-artifacts-index.mdx) |
| **In-app** | [Docs](/docs) in Studio sidebar or http://localhost:3000/docs |

---

## Key commands

| Command | When to run |
|--------|-------------|
| `pnpm dev` | Start Studio (default from repo root). Portal opens if keys missing. |
| `pnpm dev:platform` | Start Platform (customer app, landing, docs). |
| `pnpm build` | Build Studio (e.g. before deploy or to verify). |
| `pnpm test` | Run tests (Studio). |
| `pnpm payload:types` | After changing Payload collections. |
| `pnpm env:portal` | Web UI for env setup and Vercel sync. |
| `pnpm env:setup` | CLI env setup (manifest-driven). |
| `pnpm env:doctor` | Check env drift. |
| `pnpm forge-loop:progress` | Show lifecycle status and next action from `.planning`. |
| `pnpm forge-loop:doctor` | Validate planning config/artifacts/git scope/legacy markers. |
| `pnpm forge-loop:package:test` | Run package tests for `@forge/forge-loop`. |

---

## Repo structure

| Path | Purpose |
|------|---------|
| `apps/studio/` | Next.js app: App Shell, editors, Payload, Assistant UI. |
| `packages/shared/` | Editor primitives: EditorShell, EditorDockLayout, EditorDockPanel, design tokens. |
| `packages/domain-forge/` | Forge domain logic, assistant contract, tools. |
| `packages/assistant-runtime/` | LangGraph orchestrator, context assemblers, workflows, MCP adapters. |
| `packages/ui/` | Shared shadcn UI atoms. |
| `packages/types/` | Payload-generated types. |
| `packages/agent-engine/` | Workflow engine (steps + events). |
| `packages/dev-kit/` | Meta-package re-exports for consumers. |

---

## Contributing

We expect every new contributor to **build their own workspace** and **submit a PR** to add it under `packages/shared/contributor_workspaces/`.

1. Follow [05 - Building an editor](docs/how-to/05-building-an-editor.mdx)
2. Implement your workspace (shell, slots, domain contract, optional AI actions)
3. Open a PR with a subfolder under `contributor_workspaces/`

See [CONTRIBUTING.md](CONTRIBUTING.md) and [contributor_workspaces/README.md](packages/shared/contributor_workspaces/README.md).

---

## Consumer example

```bash
pnpm --filter @forge/consumer-example dev
```

See `examples/consumer/README.md` for environment setup.

