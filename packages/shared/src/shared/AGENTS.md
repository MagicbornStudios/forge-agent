# Shared module - Agent rules

## Owner

Workspace Platform Engineer: owns `packages/shared/src/shared` (editor components, styles). Other agents consume this; they do not modify shared except via documented extension points.

## Conventions

- **Public API:** Use **Editor\*** components only (`EditorShell`, `DockLayout`, `EditorToolbar`, etc.). **Workspace\*** UI components have been removed; Editor* + DockLayout are the only shell. Types (Selection, ToolbarGroup, InspectorSection, OverlaySpec, etc.) live in `shared/workspace` and are re-exported for editor and copilot use.
- **Editor shell**: Declarative, slot-based. See `components/editor/README.md` for slot map and how to build an editor.
- **Dock layout**: `DockLayout` is the layout primitive. It wraps the main slot in `ViewportMeta` metadata. Always provide `viewportId` + `viewportType` via the `viewport` prop.
- **Atomic design**: shadcn atoms live in `packages/ui/src/components/ui/*`; shared editor UI composes those atoms into molecules.
- **Styles**: Single source in `packages/shared/src/shared/styles/`. Themes are data-driven (`data-theme` on `<html>` or editor root). Do not duplicate theme tokens elsewhere.
- **Density**: Editor UI is compact by default. Use tokenized spacing (`--control-*`, `--panel-padding`, `--tab-height`) and set `data-density` on `EditorShell` for overrides.
- **No cross-domain imports**: Shared should not import from app routes or domain-specific code (e.g. Dialogue, Character). UI atoms are imported from `@forge/ui`.
- **Editor UI primitives**: Use `EditorButton`, `PanelTabs`, and `EditorTooltip` for tooltip-enabled UI.
- **Media components**: Reusable `MediaCard` and `GenerateMediaModal` live under `shared/components/media` for entity media slots.
- **Assistant UI + tool UI**: Strategy editor components live under `shared/components/assistant-ui` and `shared/components/tool-ui`.

## Adding a new slot or panel

Extend the editor types and `DockLayout` (or equivalent) in `packages/shared/src/shared/components/editor/`. Document the new slot in `components/editor/README.md`. Do not add one-off layouts per domain.

## Unified editor / Copilot

- Shell-level context and actions live in `apps/studio/components/AppShell.tsx` (not in shared). Shared provides `DomainCopilotContract`, `useDomainCopilot`, and `agent-types` for per-editor and co-agent use. See root **AGENTS.md** and **docs/17-co-agents-and-multi-agent.mdx**.

## Pitfalls

- Do not duplicate theme tokens in `apps/studio/app/globals.css`; see **docs/agent-artifacts/core/errors-and-attempts.md**.
- Vendored dependencies (e.g. Twick) live under `vendor/`; follow [How-to 24](../../../../docs/how-to/24-vendoring-third-party-code.mdx) for version alignment, submodule updates, and Verdaccio publishing.
- Forge publish flow: `registry:forge:build` + `registry:forge:publish:local`.
- Twick publish flow: `vendor:twick:build` + `vendor:twick:publish:local`.
- Verdaccio login is optional; 409 conflict fix is documented in [How-to 25](../../../../docs/how-to/25-verdaccio-local-registry.mdx).
