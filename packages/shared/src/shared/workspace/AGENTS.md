# Shared workspace contracts (packages/shared/src/shared/workspace)

- **Internal types only** — not part of the public API. Consume via `@forge/shared` (main entry). Do not document or use a subpath `@forge/shared/workspace` for consumers.
- **Types only** - selection, focus, modal, navigation, draft, proposal, toolbar, overlays, inspector, workspace-ui-spec. No domain logic or store implementation.
- **Selection** - Discriminant union: `none` | `entity` | `textRange` | `canvasObject`. Use `toEntitySelection(kind, id)` for legacy kinds. Adapters map editor state into this shape.
- **Overlays** - `OverlaySpec[]` + `ActiveOverlay`; no registry. Editor declares list in one place.
- **Capabilities** - `WorkspaceCapabilities` interface; editors implement, chat calls. No imperative UI refs.
- **Workspace UI spec** - Declarative slots: `header`, `toolbar`, `left`, `main`, `right`, `statusBar`, `bottom`, `overlays`.
- **Modal** - Legacy `ModalRoute` / `ModalRegistry`; prefer OverlaySpec + EditorOverlaySurface for new code.
