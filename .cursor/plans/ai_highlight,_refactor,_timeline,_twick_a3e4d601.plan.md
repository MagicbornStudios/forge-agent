---
name: AI highlight, refactor, timeline, Twick
overview: Add highlighting for AI-created/edited nodes and edges, refactor and document the AI integration for clarity and per-domain extensibility, implement a workspace timeline that shows the graph as a sequence using Twick under the hood, and keep the chat as the primary UI driver.
todos: []
isProject: false
---

# AI highlight, refactor, timeline (Twick sequence), and docs

## 1. Highlight AI-created and AI-edited elements

**Goal:** Nodes and edges created or edited by the Copilot agent are visually highlighted so the user sees what the AI changed.

**Approach:**

- **Track AI-origin state** in a small, separate store or in the existing graph store so it does not pollute the persisted graph. Options:
  - **Option A (recommended):** New Zustand slice or React state in Workspace: `aiHighlightIds: { nodeIds: string[]; edgeIds: string[] }`. When any CopilotKit action handler runs (createNode, createEdge, updateNode), it reports the affected ids (e.g. via a callback `onAIChange({ nodeIds?, edgeIds? })`). Workspace adds those ids to `aiHighlightIds` and clears them after a timeout (e.g. 5–8 s) or on next user-driven change.
  - **Option B:** Extend graph store with a non-persisted `lastChangedByAI: { nodeIds, edgeIds }` that action handlers set and the store clears after a delay.
- **Apply highlight in the canvas:** In [components/GraphEditor.tsx](components/GraphEditor.tsx), when building `nodes` and `edges` for React Flow, add a visual cue for ids in `aiHighlightIds`:
  - **Nodes:** Add `className` (e.g. `ring-2 ring-amber-400 ring-offset-2`) or `data-highlight="ai"` to the node object for React Flow; custom node components ([CharacterNode](components/nodes/CharacterNode.tsx), [PlayerNode](components/nodes/PlayerNode.tsx), [ConditionalNode](components/nodes/ConditionalNode.tsx)) read `data.aiHighlight` or the node’s `className` and optionally strengthen the style (e.g. subtle pulse or border).
  - **Edges:** React Flow edges support `className`; add a highlight class for edges in `aiHighlightIds.edgeIds`.
- **Wiring:** Workspace holds `aiHighlightIds` (and optional timeout ref), passes `onAIChange` to the action factory or to handlers. In [lib/copilot-actions.ts](lib/copilot-actions.ts), extend `GraphEditorActions` with `onAIChange?: (payload: { nodeIds?: string[]; edgeIds?: string[] }) => void` and call it from createNode (new node id), createEdge (new edge id), updateNode (updated node id). Workspace passes this into the action factory and merges reported ids into `aiHighlightIds`, then passes `aiHighlightIds` into GraphEditor so it can add classNames.

**Files to touch:** [lib/store.ts](lib/store.ts) or new `lib/ai-highlight-store.ts`, [lib/copilot-actions.ts](lib/copilot-actions.ts), [components/Workspace.tsx](components/Workspace.tsx), [components/GraphEditor.tsx](components/GraphEditor.tsx), custom node components and edge styling.

---

## 2. Refactor AI integration for clarity and per-domain docs

**Goal:** Make the chat-first, AI-operated UI easy to follow and document how to add features (create nodes, link, etc.) per domain.

**Refactor:**

- **Single place for “AI → workspace” wiring:** In Workspace, keep one clear block: (1) context for the agent (`useCopilotReadable`), (2) registration of all CopilotKit actions (Forge actions + openCreateNodeModal + revealSelection), (3) optional `onAIChange` for highlights. Consider extracting a hook, e.g. `useForgeCopilotActions({ graph, applyOperations, openOverlay, revealSelection, onAIChange })`, that returns the array of action configs so Workspace stays readable and the same pattern can be reused for other domains (Writer, etc.).
- **Documentation to add or update:**
  - `**docs/ai-workspace-integration.md**` (new or replace [docs/copilotkit-workspace-integration.md](docs/copilotkit-workspace-integration.md)): Describe the flow: context (what the agent sees), actions (what the agent can do), and how to add new actions in a domain (e.g. “add createNode for Forge” vs “add insertText for Writer”). Include a short “Per-domain action checklist” (create entity, link/connect, edit, delete, get state, open overlay, reveal selection).
  - `**docs/adding-domain-actions.md**` (new): Step-by-step for adding a new workspace/domain: implement capability contract (getSelection, getContextSnapshot, revealSelection), define domain actions (create, update, delete, link), register them with CopilotKit when that workspace is active, and expose domain-specific context. Reference [lib/copilot-actions.ts](lib/copilot-actions.ts) and the shared [WorkspaceCapabilities](src/shared/workspace/capabilities.ts) contract.
  - Update [docs/architecture/workspace-editor-architecture.md](docs/architecture/workspace-editor-architecture.md) to mention “AI-first: chat operates the UI” and point to the new docs.

**No change to CopilotKit runtime or API routes** unless you later add agent-side instructions; keep refactor limited to structure and docs.

---

## 3. Workspace timeline component (sequence view of the graph)

**Goal:** A real timeline surface that shows the Forge graph as a **sequence** (nodes as blocks in order), not just an empty chrome.

**Approach:**

- **Ordering:** Derive a linear order from the graph (e.g. topological sort from a root, or “main path” from the first node). If the graph has multiple branches, decide a simple rule: e.g. one track per branch, or flatten with a single topological order. Implement a small util, e.g. `lib/graph-to-sequence.ts`, that takes `ForgeGraphDoc` and returns `{ orderedNodeIds: string[], tracks?: string[][] }` so the timeline can render blocks in order.
- **Timeline UI:** Use the **bottom** slot of [WorkspacePanels](src/shared/components/workspace/panels/WorkspacePanels.tsx) (today it uses `WorkspaceBottomPanel`; the content is still “whatever you pass”). Build a **ForgeTimeline** (or **GraphSequenceTimeline**) component that:
  - Consumes `graph` (and optionally `selection`, `onSelectNode`) from Workspace.
  - Uses the sequence util to get ordered nodes (and optionally tracks).
  - Renders a horizontal strip of “blocks” (one per node) with label and optional duration placeholder, and highlights the selected node. This can be a custom div-based strip first (no Twick dependency) so the data flow is correct.
- **Where it lives:** Either under `components/forge/` (e.g. `ForgeTimeline.tsx`) or a dedicated `components/forge/timeline/` that can later host the Twick adapter. Workspace passes the timeline as the `bottom` slot content when `graph` exists.

**Files:** New `lib/graph-to-sequence.ts`, new `components/forge/ForgeTimeline.tsx` (or similar), [components/Workspace.tsx](components/Workspace.tsx) (pass timeline into `WorkspacePanels` bottom).

---

## 4. Install Twick and map graph to Twick timeline model

**Goal:** Use Twick under the hood so the timeline is driven by a model that Twick’s timeline can understand; the graph is translated into that model.

**Steps:**

- **Install Twick packages:** Add the minimal set needed for a timeline view, e.g. `@twick/timeline` (core timeline management). Check Twick docs for the exact package names and peer deps (e.g. React version). If the public API is monorepo-only or not on npm, document the intended mapping and keep the custom sequence strip from step 3 as the UI until Twick is available.
- **Translation layer:** Define an adapter **graph → Twick timeline model** (or a “sequence timeline” model that matches Twick’s expectations). Twick typically has tracks and elements with start/end or duration. Map:
  - Each ordered node → one “element” or “clip” with a synthetic duration (e.g. 1 unit or derived from content length).
  - Optionally one track for the main path, or multiple tracks for branches. Implement in `lib/forge-to-timeline.ts` (or `lib/adapters/graph-to-twick.ts`) that takes `ForgeGraphDoc` and returns the structure Twick’s timeline expects (see Twick’s types/docs for track and element shape).
- **Use Twick in the timeline component:** Replace or wrap the custom strip in [ForgeTimeline](components/forge/ForgeTimeline.tsx) with Twick’s timeline component (if it’s a React component that accepts tracks/elements). Feed it the translated data; keep selection and “click to select node” in sync with the graph (e.g. on element click, call `onSelectNode(id)` so Workspace/React Flow selection updates). If Twick’s timeline is not a drop-in (e.g. it’s built for video time only), keep the custom sequence strip and use Twick for a future “video export” or “preview” feature; document the mapping for that.

**Files:** `package.json` (Twick deps), new `lib/forge-to-timeline.ts` (or `lib/adapters/graph-to-twick.ts`), [components/forge/ForgeTimeline.tsx](components/forge/ForgeTimeline.tsx) (or equivalent), and a short `docs/timeline-and-twick.md` describing the mapping and how to extend it.

---

## 5. Definition of done

- **Highlight:** Any node/edge created or updated by CopilotKit actions is visually highlighted for a few seconds (or until next user action); implementation is minimal and does not persist to the graph payload.
- **Refactor and docs:** One clear place for action registration; at least one doc that explains context + actions and how to add per-domain features (create nodes, link, edit); architecture doc updated for AI-first.
- **Timeline:** A visible timeline in the workspace bottom slot that shows the graph as an ordered sequence of nodes (custom or Twick-backed); selection in timeline can sync with graph selection.
- **Twick:** Twick packages installed; adapter from Forge graph to Twick-compatible timeline model implemented and documented; timeline component uses that adapter (or doc states how to plug it in when using Twick’s React timeline component).

---

## 6. Order of implementation

1. **AI highlight** — Store/callback + wiring in actions and GraphEditor + node/edge className.
2. **Refactor + docs** — Hook and docs (ai-workspace-integration, adding-domain-actions, architecture update).
3. **Sequence util + ForgeTimeline** — `graph-to-sequence.ts`, `ForgeTimeline.tsx`, wire bottom slot in Workspace.
4. **Twick** — Install, adapter (`forge-to-timeline.ts`), integrate into ForgeTimeline or document; `docs/timeline-and-twick.md`.

