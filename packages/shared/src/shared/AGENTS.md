# Shared module - Agent rules

## Owner

Workspace Platform Engineer: owns `packages/shared/src/shared` (editor components, styles). Other agents consume this; they do not modify shared except via documented extension points.

## Conventions

- **Public layout API:** Use `WorkspaceLayout` + `WorkspacePanel` for docked panel composition.
- **Workspace semantics:** Workspace = tab/root surface. Panel = content unit inside workspace rails.
- **Assistant semantics:** shared `AssistantPanel` (`shared/components/assistant-ui/AssistantPanel.tsx`) is canonical for runtime wiring.
- **Assistant runtime model contract:** model switcher options must be runtime-scoped/API-backed (no hardcoded app-local model arrays in assistant panels).

## Workspace (internal types only)

- **Not part of public API.** Consume via `@forge/shared` (main entry). Do not document or use subpath `@forge/shared/workspace` for consumers.
- **Types only** — selection, focus, modal, navigation, draft, proposal, toolbar, overlays, inspector, workspace-ui-spec. No domain logic or store implementation.
- **Selection** — Discriminant union: `none` | `entity` | `textRange` | `canvasObject`. Use `toEntitySelection(kind, id)` for legacy kinds. Adapters map editor state into this shape.
- **Overlays** — `OverlaySpec[]` + `ActiveOverlay`; no registry. Editor declares list in one place.
- **Capabilities** — `WorkspaceCapabilities` interface; editors implement, chat calls. No imperative UI refs.
- **Workspace UI spec** — Declarative slots: `header`, `toolbar`, `left`, `main`, `right`, `statusBar`, `bottom`, `overlays`.
- **Modal** — Legacy `ModalRoute` / `ModalRegistry`; prefer OverlaySpec + WorkspaceOverlaySurface for new code.
- **Editor shell**: Declarative, slot-based. Recommended: use `WorkspaceShell.Header`, `.Toolbar`, `.Layout`, `.StatusBar`, `.Overlay`, `.Settings` so anatomy is explicit.
- **Workspace layout (rails)**: Left, main, right, bottom are rails. Use inline `WorkspaceLayout.Left`/`.Main`/`.Right`/`.Bottom` with `WorkspaceLayout.Panel` children (`id`, `title`, `icon?`). **Left** and **Right** support optional **`hideTabBar`** for static rails (no Dockview tab strip). The main area can host a **viewport** (viewport panels: files/Monaco, previews, graphs).
- **Deprecated registration primitives**: `WorkspaceRail`, `WorkspaceRailPanel`, `PanelRegistrationContext` are legacy and should not be introduced in new work.
- **No render-helper panel factories**: compose workspace panels inline where the workspace is defined.
- **Atomic design**: shadcn atoms live in `packages/ui/src/components/ui/*`; shared editor UI composes those atoms into molecules.
- **Styles**: Single source in `packages/shared/src/shared/styles/`. Themes are data-driven (`data-theme` on `<html>` or editor root). Do not duplicate theme tokens elsewhere.
- **Density**: Editor UI is compact by default. Use tokenized spacing (`--control-*`, `--panel-padding`, `--tab-height`) and set `data-density` on `WorkspaceShell` for overrides.
- **No cross-domain imports**: Shared should not import from app routes or domain-specific code (e.g. Dialogue, Character). UI atoms are imported from `@forge/ui`.
- **Editor UI primitives**: Use `WorkspaceButton`, `PanelTabs`, and `WorkspaceTooltip` for tooltip-enabled UI.
- **Media components**: Reusable `MediaCard` and `GenerateMediaModal` live under `shared/components/media` for entity media slots.
- **Assistant UI + tool UI**: runtime wiring belongs in `shared/components/assistant-ui/AssistantPanel.tsx`; tool surfaces live under `shared/components/tool-ui`.

## Adding a new slot or panel

Recommended composition is slot-based (`WorkspaceShell.*`, `WorkspaceApp.Tabs.Menubar`/`.Actions`, `WorkspaceLayout.*`); raw children and prop-based APIs remain supported for backward compatibility. Follow the "Recommended editor scaffold" in `components/workspace/README.md` (and dev-kit docs when present). Extend the editor types and `DockLayout` (or equivalent) in `packages/shared/src/shared/components/workspace/`. Document the new slot in `components/workspace/README.md`. Do not add one-off layouts per domain.

## Unified editor / Assistant

- Shell-level context and actions live in `apps/studio/components/AppShell.tsx` (not in shared). Shared provides `DomainAssistantContract`, `useDomainAssistant`, and domain contract types for per-editor and assistant use. See root **AGENTS.md** and **docs/how-to/07-assistant-and-ai.mdx**.

## Pitfalls

- Do not duplicate theme tokens in `apps/studio/app/globals.css`; see **docs/agent-artifacts/core/errors-and-attempts.md**.
- Vendored dependencies (e.g. GSD) live under `vendor/`; follow [How-to 24](../../../../docs/how-to/24-vendoring-third-party-code.mdx) for version alignment, submodule updates, and Verdaccio publishing.
- Forge publish flow: `registry:forge:build` + `registry:forge:publish:local`.
- Verdaccio login is optional; 409 conflict fix is documented in [How-to 25 - Verdaccio](../../../../docs/how-to/25-verdaccio-local-registry.mdx).
