---
name: Replace Dockview docking library
overview: "Address Dockview pain (context, containerApi, lost panels). User requires drag-to-reorder, floating panels, add/remove at runtime, and drag-tabs-to-group. Plan: add Reset layout to recover lost panels; fix containerApi leak; then either fix Dockview context or replace with a full-featured alternative (FlexLayout / Golden Layout)."
todos: []
isProject: false
---

# Replace or fix Dockview (docking library)

## Current problems

1. **useTimelineContext / React context**
  Panel content is rendered in a way that breaks React context (panels disconnected from parent tree; layout restore compounds it). The `panelContentWrapper` fix did not resolve it. Root cause: Dockview's panel rendering model.
2. **containerApi on DOM**
  [DockviewSlotTab.tsx](packages/shared/src/shared/components/editor/DockviewSlotTab.tsx) spreads `...rest` onto a `<div>`; Dockview passes `containerApi` and other non-DOM props, causing React warnings. **Fix**: Omit known library props before spreading onto the DOM.
3. **Lost panels**
  Users can end up with an empty content area (all panels gone or not restored). There is no in-app way to recover; clearing `localStorage['dockview-{layoutId}']` and reloading would restore default layout but is undiscoverable.

## Required features (user)


| Feature                                                                                                   | Required                                    |
| --------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| **Drag to reorder** tabs/panels                                                                           | Yes                                         |
| **Floating / detached panels**                                                                            | Yes                                         |
| **Add / remove panels at runtime**                                                                        | Yes (or planned)                            |
| **Drag tabs together to group** (stack tabs)                                                              | Yes — user enjoys this and wants to keep it |
| Resize splits, persistence, tab bar (icon/title/close), viewport metadata, React context in panel content | Yes (existing)                              |


Any replacement must support the above. Fixed-structure resize-only libraries do **not** meet the bar.

## Features we use today (summary)

Slots: optional left, required main, optional right, optional bottom. Resize between panels. Persistence via `layoutId` to `localStorage['dockview-{layoutId}']`. Custom tab component (DockviewSlotTab). React context must reach panel content (e.g. Twick).

## Option A: Fix and keep Dockview

- **Pros**: Already has drag-reorder, float, tab grouping, add/remove; we keep the UX you like.
- **Actions**:
  1. **Recover lost panels**: Add a **Reset layout** / **Restore default layout** control (e.g. in editor toolbar or settings) that clears the stored layout for the active editor's `layoutId` and rebuilds the default layout (or remounts so `onReady` runs again without saved state). Document in UI and in [errors-and-attempts.md](docs/agent-artifacts/core/errors-and-attempts.md).
  2. **containerApi**: In [DockviewSlotTab.tsx](packages/shared/src/shared/components/editor/DockviewSlotTab.tsx), destructure and omit `containerApi` (and any other non-DOM props from Dockview) before spreading onto the `<div>`.
  3. **Context**: Investigate why `panelContentWrapper` fails when layout is restored (e.g. does Dockview render restored panels in a different tree or before our wrapper is set?). Consider: inject context via panel params, or ensure the wrapper is always the direct parent of slot content at render time. If we cannot fix context reliably, document and consider Option B.

## Option B: Replace with a full-featured alternative

**react-resizable-panels is insufficient** — no drag-reorder, no floating panels, no drag-tabs-to-group. Do not use it as the primary replacement if we need those features.

**Candidates that support drag, float, and tab behavior**:

- **FlexLayout (flexlayout-react)**: Tabs, drag/order, dock to edges, popout to new windows, theming, TypeScript, actively maintained. Verify React 18 and that panel content receives React context (or has a documented pattern for it).
- **Golden Layout**: Multi-window, drag-and-drop, React integration; state persistence. Last updated 3+ years ago — maintenance and React 18 compatibility need verification.

**Spike**: For the chosen library, implement a thin DockLayout-style wrapper (same slot concepts, persistence by layoutId), wire one editor (e.g. Dialogue), and validate: context in panel content, persistence, drag-reorder, floating, drag-tabs-to-group. Then decide full migration vs. staying on Dockview.

## Recommended direction

1. **Immediate (both paths)**
  - Add **Reset layout** so users can recover from lost panels (clear storage for current editor layoutId and rebuild default).  
  - Fix **containerApi** (and any other Dockview-only props) in DockviewSlotTab so they are not spread onto the DOM.  
  - Document in errors-and-attempts: lost panels + reset procedure; Dockview context/containerApi issues; required features (drag, float, add/remove, drag-tabs-to-group).
2. **Then choose**
  - **Path A**: Fix Dockview context (investigate restore path and wrapper usage; implement fix or document limitation). Keep Dockview.  
  - **Path B**: Spike FlexLayout (or Golden Layout if FlexLayout fails); if spike succeeds, plan migration and keep Reset layout for transition.

## Implementation outline (after approval)

- **Phase 1 (immediate)**  
  - Add **Reset layout** control (toolbar or settings) that clears `localStorage['dockview-{layoutId}']` for the active editor and triggers default layout (e.g. remount or api.clear + buildDefaultLayout).  
  - In DockviewSlotTab, omit `containerApi` (and other known non-DOM props) from the props spread onto the `<div>`.  
  - Update [errors-and-attempts.md](docs/agent-artifacts/core/errors-and-attempts.md): lost panels (reset layout), context and containerApi, required features for any replacement.
- **Phase 2 (Dockview context)**  
  - Debug why panelContentWrapper does not fix TimelineProvider on restore (e.g. render order, second root, params).  
  - Implement a reliable context fix or document that Video editor requires a workaround (and consider Path B).
- **Phase 3 (optional replacement)**  
  - If replacing: spike FlexLayout (or alternative) with one editor; validate context, persistence, drag, float, tab grouping.  
  - If adopting: implement DockLayout on top of chosen library and migrate editors; remove Dockview; keep Reset layout for the new engine if needed.

