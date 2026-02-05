# 04 – Data and state

Draft state (Zustand), server state (TanStack Query), and the rule: **client talks only to our Next API**.

## Draft state (Zustand)

Editable document state lives in Zustand stores (e.g. `apps/studio/lib/store.ts` for graph, `apps/studio/lib/domains/video/store.ts` for video). Actions update the draft; **Save** persists via a mutation that calls the API and invalidates queries.

## Server state (TanStack Query)

List and single-document data is fetched through Next API routes and cached with TanStack Query. Keys and hooks live in `apps/studio/lib/data/`: `keys.ts`, `studio-client.ts`, hooks like `useGraphs`, `useGraph(id)`, `useSaveGraph`. See [docs/decisions.md](../decisions.md) and [docs/tech-stack.md](../tech-stack.md).

## API boundary

The browser never calls Payload REST/GraphQL directly. All server-state goes through routes like `/api/graphs`, `/api/video-docs`, `/api/settings`. This keeps one client contract and allows adding other backends later behind the same routes.

## Loading and saving a document

- **Load**: On app load, read `lastGraphId` from localStorage (or first from list, or create empty). Call `loadGraph(id)` which fetches `GET /api/graphs/:id` and sets the graph store.
- **Save**: User clicks Save (or `forge_commit`); mutation sends draft to `PATCH /api/graphs/:id`, then invalidates `studioKeys.graph(id)` and `studioKeys.graphs()`.

Code: `apps/studio/app/page.tsx` (initial load), `apps/studio/lib/data/hooks/use-save-graph.ts` (mutation), `apps/studio/lib/store.ts` (graph store).

## What the AI can do at this stage

The agent could call APIs via tools if you exposed them; there are no workspace-specific actions yet. Once you add a domain contract (context + actions), the AI can read context and run actions that update the draft and trigger save.

**Next:** [05 – Building a workspace from scratch](05-building-a-workspace.md)
