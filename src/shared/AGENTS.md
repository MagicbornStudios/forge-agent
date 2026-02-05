# Shared module - Agent rules

## Owner

Workspace Platform Engineer: owns `src/shared` (workspace components, styles). Other agents consume this; they do not modify shared except via documented extension points.

## Conventions

- **Workspace shell**: Declarative, slot-based. See `components/workspace/AGENTS.md` for slot map and how to build a workspace.
- **Layout grid**: `WorkspaceLayoutGrid` is the layout primitive. It wraps the main slot in `WorkspaceEditor` metadata. Always provide `editorId` + `editorType`.
- **Atomic design**: shadcn atoms live in `components/ui/*`; shared workspace UI composes those atoms into molecules.
- **Styles**: Single source in `src/shared/styles/`. Themes are data-driven (`data-theme` on `<html>` or workspace root). Do not duplicate theme tokens elsewhere.
- **No cross-domain imports**: Shared must not import from app routes or domain-specific code (e.g. Forge, Writer). Domains import from `@/shared/*`.
- **Workspace UI primitives**: Use `WorkspaceButton`, `WorkspaceTabGroup`, `WorkspaceTab`, and `WorkspaceTooltip` for tooltip-enabled UI.

## Adding a new slot or panel

Extend the workspace types and `WorkspaceLayoutGrid` (or equivalent) in `src/shared/components/workspace/`. Document the new slot in `components/workspace/AGENTS.md`. Do not add one-off layouts per domain.

## Unified workspace / Copilot

- Shell-level context and actions live in `components/AppShell.tsx` (not in shared). Shared provides `DomainCopilotContract`, `useDomainCopilot`, and `agent-types` for per-workspace and co-agent use. See root **AGENTS.md** and **docs/co-agents-and-multi-agent.md**.

## Pitfalls

- Do not duplicate theme tokens in `app/globals.css`; see **docs/errors-and-attempts.md**.
