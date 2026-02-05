# Forge Agent

Forge Agent is an AI-first studio for editing dialogue graphs using CopilotKit and React Flow. The repo is a pnpm workspace with a single app (Studio) and shared packages.

## Structure

- `apps/studio/` - Next.js app (App Shell, workspaces, CopilotKit integration, Payload config).
- `packages/shared/` - Shared workspace UI kit and headless contracts.
- `packages/domain-forge/` - Forge domain logic (types, store, operations, copilot wiring).
- `packages/ui/` - Shared shadcn UI atoms.
- `packages/types/` - Payload-generated types and domain aliases used across packages.

## Setup

1. Install dependencies:

```bash
pnpm install
```

2. Configure `.env.local` (example keys):

```env
OPENROUTER_API_KEY=sk-or-v1-...
OPENAI_API_KEY=sk-or-v1-...
PAYLOAD_SECRET=dev-secret-change-me
```

3. Generate Payload types (after any collection changes):

```bash
pnpm payload:types
```

4. Run the studio app:

```bash
pnpm dev
```

## Key commands

- `pnpm dev` - Run Studio (same as `pnpm --filter @forge/studio dev`).
- `pnpm build` - Build Studio.
- `pnpm test` - Run tests (Studio only).
- `pnpm payload:types` - Regenerate Payload types in `packages/types/src/payload-types.ts`.

## Notes

- Forge is the primary workspace. Video is a UI showcase only (not a priority).
- Payload types are the source of truth for persisted shapes. Domain packages should import from `@forge/types`.

## Documentation

- **In-app docs**: Run the app and open [/docs](http://localhost:3000/docs) for the full how-to series and sidebar.
- **How-to guides** (in order): Foundation -> Workspace shell and slots -> Styling -> Data and state -> Building a workspace -> ForgeWorkspace walkthrough -> Copilot and AI integration -> Adding AI to workspaces -> Twick video workspace. Content lives in `docs/how-to/` (00-09); each guide states what the AI can do at that stage.
- **Reference**: `docs/PROJECT-OVERVIEW.md`, `docs/STATUS.md`, `docs/architecture/copilotkit-and-agents.md`, `AGENTS.md`.
