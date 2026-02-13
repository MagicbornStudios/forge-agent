# Shared module - Agent rules

## Owner

Workspace Platform Engineer: owns `packages/shared/src/shared` (editor components, styles). Other agents consume this; they do not modify shared except via documented extension points.

## Conventions

- **Public API:** Use **Editor\*** components only (`EditorShell`, `DockLayout`, `EditorToolbar`, etc.). **Workspace\*** UI components have been removed; Editor* + DockLayout are the only shell. Types (Selection, ToolbarGroup, InspectorSection, OverlaySpec, etc.) live in `shared/workspace` and are re-exported for editor and copilot use.

## Workspace (internal types only)

- **Not part of public API.** Consume via `@forge/shared` (main entry). Do not document or use subpath `@forge/shared/workspace` for consumers.
- **Types only** — selection, focus, modal, navigation, draft, proposal, toolbar, overlays, inspector, workspace-ui-spec. No domain logic or store implementation.
- **Selection** — Discriminant union: `none` | `entity` | `textRange` | `canvasObject`. Use `toEntitySelection(kind, id)` for legacy kinds. Adapters map editor state into this shape.
- **Overlays** — `OverlaySpec[]` + `ActiveOverlay`; no registry. Editor declares list in one place.
- **Capabilities** — `WorkspaceCapabilities` interface; editors implement, chat calls. No imperative UI refs.
- **Workspace UI spec** — Declarative slots: `header`, `toolbar`, `left`, `main`, `right`, `statusBar`, `bottom`, `overlays`.
- **Modal** — Legacy `ModalRoute` / `ModalRegistry`; prefer OverlaySpec + EditorOverlaySurface for new code.
- **Editor shell**: Declarative, slot-based. Recommended: use `EditorShell.Header`, `.Toolbar`, `.Layout`, `.StatusBar`, `.Overlay`, `.Settings` so anatomy is explicit; raw children (legacy) remain supported. See `components/editor/README.md` for slot map and how to build an editor.
- **Dock layout (rails)**: Left, main, right, bottom are **rails**; each rail can have multiple **panel tabs**. **UI-first:** Use `EditorDockLayout.Left`/`.Main`/`.Right`/`.Bottom` with `EditorDockLayout.Panel` children (`id`, `title`, `icon?`). Pass icon as `React.ReactNode`. No store-driven registration. **EditorLayoutProvider** provides `editorId` only; **EditorRail**, **EditorPanel**, **EditorLayout** are deprecated. Config-driven `leftPanels`/`mainPanels`/etc. and legacy props remain for backward compat. See `components/editor/README.md`. Always provide `viewportId` + `viewportType` via the `viewport` prop.
- **Atomic design**: shadcn atoms live in `packages/ui/src/components/ui/*`; shared editor UI composes those atoms into molecules.
- **Styles**: Single source in `packages/shared/src/shared/styles/`. Themes are data-driven (`data-theme` on `<html>` or editor root). Do not duplicate theme tokens elsewhere.
- **Density**: Editor UI is compact by default. Use tokenized spacing (`--control-*`, `--panel-padding`, `--tab-height`) and set `data-density` on `EditorShell` for overrides.
- **No cross-domain imports**: Shared should not import from app routes or domain-specific code (e.g. Dialogue, Character). UI atoms are imported from `@forge/ui`.
- **Editor UI primitives**: Use `EditorButton`, `PanelTabs`, and `EditorTooltip` for tooltip-enabled UI.
- **Media components**: Reusable `MediaCard` and `GenerateMediaModal` live under `shared/components/media` for entity media slots.
- **Assistant UI + tool UI**: Strategy editor components live under `shared/components/assistant-ui` and `shared/components/tool-ui`.

## Adding a new slot or panel

Recommended composition is slot-based (`EditorShell.*`, `EditorApp.Tabs.Menubar`/`.Actions`, `EditorDockLayout.*`); raw children and prop-based APIs remain supported for backward compatibility. Follow the "Recommended editor scaffold" in `components/editor/README.md` (and dev-kit docs when present). Extend the editor types and `DockLayout` (or equivalent) in `packages/shared/src/shared/components/editor/`. Document the new slot in `components/editor/README.md`. Do not add one-off layouts per domain.

## Unified editor / Assistant

- Shell-level context and actions live in `apps/studio/components/AppShell.tsx` (not in shared). Shared provides `DomainAssistantContract`, `useDomainAssistant`, and domain contract types for per-editor and assistant use. See root **AGENTS.md** and **docs/how-to/07-assistant-and-ai.mdx**.

## Pitfalls

- Do not duplicate theme tokens in `apps/studio/app/globals.css`; see **docs/agent-artifacts/core/errors-and-attempts.md**.
- Vendored dependencies (e.g. Twick) live under `vendor/`; follow [How-to 24](../../../../docs/how-to/24-vendoring-third-party-code.mdx) for version alignment, submodule updates, and Verdaccio publishing.
- Forge publish flow: `registry:forge:build` + `registry:forge:publish:local`.
- Twick publish flow: `vendor:twick:build` + `vendor:twick:publish:local`.
- Verdaccio login is optional; 409 conflict fix is documented in [How-to 25 - Verdaccio](../../../../docs/how-to/25-verdaccio-local-registry.mdx).
