# Timeline and Twick

## Overview

The workspace bottom panel shows a sequence timeline of the Forge graph: nodes in topological order as blocks. This gives a linear view of the story flow alongside the main graph editor.

- **Current UI:** A custom horizontal strip (`ForgeTimeline`) that renders one block per node; selection in the timeline syncs with graph selection.
- **Data flow:** `graphToSequence(graph)` -> ordered node ids -> blocks. Optionally, `forgeGraphToTimelineModel(graph)` produces a Twick-compatible timeline model (tracks + elements with start/end) for use with Twick's timeline component or future video export.

## Mapping: Forge graph -> timeline model

Implemented in `apps/studio/lib/forge-to-timeline.ts`:

- **Order:** Same as the sequence util: topological sort of nodes (roots first, then dependencies). See `apps/studio/lib/graph-to-sequence.ts`.
- **Tracks:** One track (`main`) containing all nodes in that order. Multiple tracks (e.g. one per branch) can be added later.
- **Elements:** Each node becomes one TimelineElement:
  - `id`: synthetic (e.g. `el-{nodeId}`)
  - `start` / `end`: abstract time (1 unit per node by default)
  - `label`: node label
  - `meta.nodeId`: original graph node id (for selection sync and future Twick integration)

So the Forge graph is translated into a track + elements with start/end model that matches what timeline libraries (e.g. Twick) expect.

## Using the adapter

- **Custom strip (current):** `ForgeTimeline` uses `graphToSequence` and renders blocks itself; it does not use the Twick timeline component.
- **With Twick:** When you want to use Twick's timeline UI:
  1. Install `@twick/timeline` (and any peer deps; see Twick docs).
  2. Call `forgeGraphToTimelineModel(graph)` to get `ForgeTimelineModel` (tracks + elements).
  3. Map that into the shape Twick's API expects (same idea: tracks, elements with time range). Twick's types may use different property names (e.g. `startTime`/`duration`); adapt in a thin layer.
  4. On element click in Twick, read `element.meta.nodeId` and call `onSelectNode(nodeId)` so Workspace/React Flow selection stays in sync.

If Twick's timeline is built for video time only (e.g. seconds), you can still use the same mapping: treat each node's `start`/`end` as abstract units and scale to seconds when feeding Twick, or keep the custom strip for the "sequence view" and use Twick only for a future "video preview" or "export" feature.

## Extending the mapping

- **Duration:** Today every node has a fixed duration (1 unit). You could derive duration from node content length or type (e.g. dialogue vs choice).
- **Tracks:** For branching stories, `graphToSequence` could be extended to return `tracks: string[][]` (one track per branch). The adapter would then fill one track per branch with elements and optional gaps.
- **Video export:** The same timeline model can drive an export pipeline: each element's time range and `meta.nodeId` identify which node to render in that segment.

## Files

- **Sequence order:** `apps/studio/lib/graph-to-sequence.ts`
- **Graph -> timeline model:** `apps/studio/lib/forge-to-timeline.ts`
- **Timeline UI:** `apps/studio/components/forge/ForgeTimeline.tsx`
- **Wiring:** `apps/studio/components/workspaces/ForgeWorkspace.tsx` passes `bottom={timelineContent}` to `WorkspaceLayoutGrid`.
