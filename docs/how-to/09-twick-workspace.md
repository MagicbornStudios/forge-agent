# 09 - Twick video workspace

This guide shows how the Video workspace is built around a Twick-inspired timeline. It is intentionally minimal: track list, timeline surface, and AI actions to add tracks and elements. It uses the same shared workspace shell and CopilotKit wiring as Forge. The `@twick/timeline` dependency is already in the app; the UI in this slice focuses on a clean timeline surface, while deeper engine integration can follow.

## File map

- **Workspace UI**: `apps/studio/components/workspaces/VideoWorkspace.tsx`
- **Timeline UI**: `apps/studio/components/video/TwickTimeline.tsx`
- **Track list UI**: `apps/studio/components/video/TwickTrackList.tsx`
- **Domain store**: `apps/studio/lib/domains/video/store.ts`
- **Video operations**: `apps/studio/lib/domains/video/operations.ts`
- **Video types**: `apps/studio/lib/domains/video/types.ts`
- **Copilot actions**: `apps/studio/lib/domains/video/copilot/actions.ts`
- **Collection**: `apps/studio/payload/collections/video-docs.ts`

## Data model

Video docs are persisted in Payload (`video-docs`). The `doc` JSON field stores the minimal timeline payload (`VideoDocData`):

- `tracks[]`: timeline tracks with elements
- `sceneOverrides[]`: optional overrides linked to Forge nodes
- `resolution`: output size

The domain types pull from Payload-generated types (`@forge/types/payload`) to keep persisted fields consistent across app and domain code.

## Workspace layout

VideoWorkspace composes the shared shell like Forge does:

- `WorkspaceShell` (title, theme, domain)
- `WorkspaceToolbar` (File, Project, Settings)
- `WorkspaceLayoutGrid` with:
  - **left**: `TwickTrackList`
  - **main**: `TwickTimeline`
- `WorkspaceStatusBar` with selection state

The timeline is the primary surface; the track list keeps navigation and creation controls on the left.

## Timeline UI (TwickTimeline)

`TwickTimeline` renders a simple, deterministic grid:

- Horizontal time ruler (seconds)
- One row per track
- Elements as blocks sized by duration

No dragging or resizing yet - this is a foundation for later. When we introduce the Twick engine types, the `VideoDocData` can be mapped to Twick's `TrackJSON`/`ElementJSON` for more advanced editing.

## Track list UI (TwickTrackList)

The left panel lists tracks and their element counts. It provides a direct **Add track** button and lets the user select a track. This selection is used by the timeline and by the toolbar action to add elements.

## AI actions

Video actions are registered by `useVideoContract` and `useDomainCopilot`:

- `video_addTrack`
- `video_addElement`
- `video_moveElement`
- `video_setResolution`

These map to `applyOperations` in `apps/studio/lib/domains/video/operations.ts`, which keeps all edits immutable and stored in the draft state.

## Paywall example

The Export button is gated with `FeatureGate` + `CAPABILITIES.VIDEO_EXPORT`. This demonstrates how to lock features while still exposing the UI.

## What the AI can do

At this stage the AI can:

- Add tracks and text elements
- Move or resize elements
- Adjust timeline resolution
- Read the current timeline via `video_getTimeline`

**Next:** Back to [00 - Index](00-index.md) or continue with [08 - Adding AI to workspaces](08-adding-ai-to-workspaces.md).
