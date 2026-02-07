# Shared module - Agent rules

## Owner

Workspace Platform Engineer: owns `packages/shared/src/shared` (editor components, styles). Other agents consume this; they do not modify shared except via documented extension points.

## Conventions

- **Editor shell**: Declarative, slot-based. See `components/editor/README.md` and `components/workspace/AGENTS.md` for slot map and how to build a mode.
- **Dock layout**: `DockLayout` is the layout primitive. It wraps the main slot in `ViewportMeta` metadata. Always provide `editorId` + `editorType` via `viewport` prop.
- **Atomic design**: shadcn atoms live in `packages/ui/src/components/ui/*`; shared editor UI composes those atoms into molecules.
- **Styles**: Single source in `packages/shared/src/shared/styles/`. Themes are data-driven (`data-theme` on `<html>` or editor root). Do not duplicate theme tokens elsewhere.
- **No cross-domain imports**: Shared should not import from app routes or domain-specific code (e.g. Dialogue, Character). UI atoms are imported from `@forge/ui`.
- **Editor UI primitives**: Use `EditorButton`, `PanelTabs`, and `EditorTooltip` for tooltip-enabled UI.
- **Media components**: Reusable `MediaCard` and `GenerateMediaModal` live under `shared/components/media` for entity media slots.
- **Assistant UI + tool UI**: Strategy editor components live under `shared/components/assistant-ui` and `shared/components/tool-ui`.

## Adding a new slot or panel

Extend the editor types and `DockLayout` (or equivalent) in `packages/shared/src/shared/components/editor/`. Document the new slot in `components/editor/README.md`. Do not add one-off layouts per domain.

## Unified editor / Copilot

- Shell-level context and actions live in `apps/studio/components/AppShell.tsx` (not in shared). Shared provides `DomainCopilotContract`, `useDomainCopilot`, and `agent-types` for per-mode and co-agent use. See root **AGENTS.md** and **docs/17-co-agents-and-multi-agent.mdx**.

## Pitfalls

- Do not duplicate theme tokens in `apps/studio/app/globals.css`; see **docs/agent-artifacts/core/errors-and-attempts.md**.
