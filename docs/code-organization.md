# Code organization

## Layout

- **app/** - Routes, layout, globals.css.
- **components/** - App and domain components. `components/workspaces/ForgeWorkspace.tsx` is the Forge workspace (uses shared shell + CopilotKit).
- **src/shared/** - Shared app/workspace UI and styles. No app routes or domain imports.
- **lib/** - Store, CopilotKit actions, utils, OpenRouter config.
- **types/** - Graph and app types.

## Atomic design map

- **Atoms**: `components/ui/*` (shadcn primitives).
- **Molecules**: composable widgets (e.g. `components/settings/*`, `components/model-switcher/*`, `src/shared/components/workspace/*` controls).
- **Organisms**: workspace shells and larger assemblies (e.g. `components/workspaces/*`, `components/AppShell.tsx`).
- **Templates**: `app/*` layout and route composition.

## Workspace + CopilotKit

- **Shell** - `src/shared/components/workspace/`: declarative slots, shadcn-based (Button, Separator, DropdownMenu, Select, Sheet, etc.).
- **Forge workspace** - `components/workspaces/ForgeWorkspace.tsx`: composes shell, registers `useCopilotReadable` (context) and `useCopilotAction` (graph actions from `lib/domains/forge/copilot`). CopilotKit chat uses that context and those actions to edit the graph.
- **Editor** - `components/GraphEditor.tsx`: React Flow main surface; receives graph from store; mutations go through `applyOperations` which the CopilotKit actions call.

So: **context** (readable) describes the graph; **actions** (createNode, updateNode, deleteNode, createEdge, getGraph) perform edits. The agent in the chat uses both.

## Adding a new workspace

1. Add a route and a workspace component that uses `WorkspaceShell` + slots.
2. Register `useCopilotReadable` with that workspace's context.
3. Register `useCopilotAction` with domain-specific actions.
4. Put the editor in `WorkspaceLayoutGrid` `main`. Declare overlays in one place and use `WorkspaceOverlaySurface` with `activeOverlay` state (no registry).
