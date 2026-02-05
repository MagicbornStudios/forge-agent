---
created: 2026-02-04
updated: 2026-02-04
---

# Forge Agent

An AI-first studio for editing dialogue graphs: CopilotKit, React Flow, and a unified workspace shell. Build your own workspace, ship it, and contribute it back—we’re set up for that.

## I just cloned this repo

**Prerequisites:** Node 20+, pnpm 9+

1. **Install**
   ```bash
   pnpm install
   ```
2. **Environment** — Create `.env.local` at repo root with API keys and secrets. See [SETUP.md](SETUP.md) for the list (e.g. `OPENROUTER_API_KEY`, `OPENAI_API_KEY`, `PAYLOAD_SECRET`).
3. **Payload types** (run after any collection change):
   ```bash
   pnpm payload:types
   ```
4. **Run the app**
   ```bash
   pnpm dev
   ```
5. Open **http://localhost:3000**. You’ll see the Studio app (Forge / Video tabs) and can open **[/docs](http://localhost:3000/docs)** in the app for the full how-to series.

## Key commands

| Command | When to run |
|--------|-------------|
| `pnpm dev` | Start Studio (default from repo root). |
| `pnpm build` | Build Studio (e.g. before deploy or to verify). |
| `pnpm test` | Run tests (Studio). |
| `pnpm payload:types` | After changing Payload collections; regenerates `packages/types/src/payload-types.ts`. |

## Consumer example

Use the minimal consumer app in `examples/consumer` to verify `@forge/dev-kit` integration in a fresh Next.js app.

```bash
pnpm --filter @forge/consumer-example dev
```

See `examples/consumer/README.md` for environment setup.

## Documentation

- **Start here:** [docs/00-docs-index.mdx](docs/00-docs-index.mdx) — pick **human/contributor** or **coding agent** and follow the links.
- **Setup details:** [SETUP.md](SETUP.md).
- **How-tos (in order):** In-app [/docs](http://localhost:3000/docs) or [docs/how-to/00-index.mdx](docs/how-to/00-index.mdx) — 01 Foundation → 02 Workspace shell → 03 Styling → 04 Data and state → 05 Building a workspace → 06 ForgeWorkspace walkthrough → 07 Copilot → 08 Adding AI → 09 Twick workspace.
- **Architecture:** [docs/architecture/](docs/architecture/) — [01-unified-workspace](docs/architecture/01-unified-workspace.mdx), [02-workspace-editor-architecture](docs/architecture/02-workspace-editor-architecture.mdx), [03-copilotkit-and-agents](docs/architecture/03-copilotkit-and-agents.mdx).
- **Publishing the component library:** [docs/architecture/04-component-library-and-registry.mdx](docs/architecture/04-component-library-and-registry.mdx) (includes `@forge/dev-kit`).
- **For coding agents:** [docs/18-agent-artifacts-index.mdx](docs/18-agent-artifacts-index.mdx) (index of agent-only docs) and root [AGENTS.md](AGENTS.md).

## Contributing: build a workspace, then PR it

We expect every new contributor to **build their own workspace** and **submit a PR** to add it under **`packages/shared/contributor_workspaces/`** so we can showcase community workspaces.

1. Follow **[05 - Building a workspace](docs/how-to/05-building-a-workspace.mdx)** (and optionally [06 - ForgeWorkspace walkthrough](docs/how-to/06-forge-workspace-walkthrough.mdx) or [09 - Twick video workspace](docs/how-to/09-twick-workspace.mdx)).
2. Implement your workspace (shell, slots, domain contract, optional AI actions).
3. Open a PR that adds a subfolder under `packages/shared/contributor_workspaces/` (e.g. `my-awesome-workspace/`) with your code and a short README describing what it does and how to run it.

See [packages/shared/contributor_workspaces/README.md](packages/shared/contributor_workspaces/README.md) for the contribution rules.

## Repo structure

- **`apps/studio/`** — Next.js app: App Shell, workspaces, CopilotKit, Payload config.
- **`packages/shared/`** — Shared workspace UI kit and headless contracts.
- **`packages/dev-kit/`** — Meta-package that re-exports `@forge/ui`, `@forge/shared`, and `@forge/agent-engine` for consumers.
- **`packages/domain-forge/`** — Forge domain logic (types, store, operations, copilot wiring).
- **`packages/ui/`** — Shared shadcn UI atoms.
- **`packages/types/`** — Payload-generated types and domain aliases.
- **`packages/agent-engine/`** — Workflow engine (steps + events) for plan → patch → review over SSE.

## Notes

- Forge is the primary workspace; Video is a UI showcase.
- Payload types are the source of truth for persisted shapes; domains import from `@forge/types`.
- Patch operations are the common currency for AI proposals and draft updates.
