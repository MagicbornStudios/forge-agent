---
created: 2026-02-04
updated: 2026-02-11
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
- [Editor platform architecture](docs/architecture/05-editor-platform.mdx)
- [Design language](docs/design/03-design-language.mdx)

---

## Open source roadmap

Foundational editor components (`@forge/shared`, `@forge/ui`) will be open sourced. Repo structure and API contracts are designed for consumption.

- [Component library and registry](docs/architecture/04-component-library-and-registry.mdx)
- [Verdaccio and local registry](docs/how-to/25-verdaccio-local-registry.mdx)

---

## Ralph Wiggum loop

We use **agent artifacts** so "what is true now" and "what not to repeat" are explicit. Agents (and contributors) follow: **STATUS + AGENTS → pick one slice → implement → update STATUS (Done list) and affected docs.**

**Loop in one sentence:** Read [STATUS](docs/agent-artifacts/core/STATUS.md) and [AGENTS.md](AGENTS.md) → implement one slice → update STATUS Ralph Wiggum Done and docs.

### Snippet: STATUS Done entry

```markdown
- Done (2026-02-12): LangGraph chat infrastructure Phase 1 slice: added @forge/assistant-runtime...
- Done (2026-02-12): Panel hide reclaims space (Option B): when panel content becomes null (View > Layout > Hide Library), DockLayout effect uses Dockview API (panel.api.close()) to remove the panel from the layout...
```

### Snippet: errors-and-attempts (do not repeat)

```markdown
## Universal padding/margin reset — CRITICAL: never add to `*`

**Problem**: `* { padding: 0 }` strips default padding from buttons, labels, inputs. Caused days of debugging.

**Fix**: Do NOT add box-model resets to `*`. Use explicit tokens.
```

### Snippet: decisions ADR

```markdown
## Client boundary: Payload REST for CRUD, custom routes for app ops

**Decision:** For collection CRUD, client uses Payload SDK. For app ops (auth, settings, AI), client uses our custom Next API routes.

**Rationale:** Payload REST for full CRUD; custom routes for auth, settings, non-CRUD logic.
```

**Full artifacts:** [Agent artifacts index](docs/18-agent-artifacts-index.mdx) | [Coding agent strategy](docs/19-coding-agent-strategy.mdx)

---

## Documentation

| Section | Links |
|---------|-------|
| **Start here** | [docs/00-docs-index.mdx](docs/00-docs-index.mdx) |
| **How-to guides** | [how-to/00-index.mdx](docs/how-to/00-index.mdx) |
| **Architecture** | [architecture/README.md](docs/architecture/README.md) |
| **AI architecture** | [ai/00-index.mdx](docs/ai/00-index.mdx) |
| **Agent artifacts** | [18-agent-artifacts-index.mdx](docs/18-agent-artifacts-index.mdx) |
| **In-app** | [Docs](/docs) in Studio sidebar or http://localhost:3000/docs |

---

## Key commands

| Command | When to run |
|--------|-------------|
| `pnpm dev` | Start Studio (default from repo root). Portal opens if keys missing. |
| `pnpm build` | Build Studio (e.g. before deploy or to verify). |
| `pnpm test` | Run tests (Studio). |
| `pnpm payload:types` | After changing Payload collections. |
| `pnpm env:portal` | Web UI for env setup and Vercel sync. |
| `pnpm env:setup` | CLI env setup (manifest-driven). |
| `pnpm env:doctor` | Check env drift. |

---

## Repo structure

| Path | Purpose |
|------|---------|
| `apps/studio/` | Next.js app: App Shell, editors, Payload, Assistant UI. |
| `packages/shared/` | Editor primitives: EditorShell, DockLayout, design tokens. |
| `packages/domain-forge/` | Forge domain logic, assistant contract, tools. |
| `packages/assistant-runtime/` | LangGraph orchestrator, context assemblers, workflows, MCP adapters. |
| `packages/ui/` | Shared shadcn UI atoms. |
| `packages/types/` | Payload-generated types. |
| `packages/agent-engine/` | Workflow engine (steps + events). |
| `packages/dev-kit/` | Meta-package re-exports for consumers. |

---

## Contributing

We expect every new contributor to **build their own workspace** and **submit a PR** to add it under `packages/shared/contributor_workspaces/`.

1. Follow [05 - Building an editor](docs/how-to/05-building-a-workspace.mdx)
2. Implement your workspace (shell, slots, domain contract, optional AI actions)
3. Open a PR with a subfolder under `contributor_workspaces/`

See [CONTRIBUTING.md](CONTRIBUTING.md) and [contributor_workspaces/README.md](packages/shared/contributor_workspaces/README.md).

---

## Consumer example

```bash
pnpm --filter @forge/consumer-example dev
```

See `examples/consumer/README.md` for environment setup.
