# Shared workspace contracts (packages/shared/src/shared/workspace)

- **Types only** - selection, focus, modal, navigation, draft, proposal, toolbar, overlays, inspector, workspace-ui-spec. No domain logic or store implementation.
- **Selection** - Discriminant union: `none` | `entity` | `textRange` | `canvasObject`. Use `toEntitySelection(kind, id)` for legacy kinds. Adapters map editor state into this shape.
- **Overlays** - `OverlaySpec[]` + `ActiveOverlay`; no registry. Workspace declares list in one place.
- **Capabilities** - `WorkspaceCapabilities` interface; workspaces implement, chat calls. No imperative UI refs.
- **Workspace UI spec** - Declarative slots: `header`, `toolbar`, `left`, `main`, `right`, `statusBar`, `bottom`, `overlays`.
- **Modal** - Legacy `ModalRoute` / `ModalRegistry`; prefer OverlaySpec + WorkspaceOverlaySurface for new code.

