# Unified workspace (App Shell) architecture

## Overview

The app has a **Unified Workspace** implemented as an **App Shell** that owns multiple sub-workspaces (Forge, Video). Users switch between workspaces via tabs; only the active workspace is rendered. CopilotKit runs at the shell level and receives both shell context (active workspace, names) and domain context from the active workspace.

## Hierarchy

- **App Shell** (`components/AppShell.tsx`, `lib/app-shell/store.ts`)
  - State: `activeWorkspaceId`, `openWorkspaceIds`, `globalModals`, `workspaceThemes` (optional per-workspace overrides)
  - Settings: `lib/settings/store.ts` provides app/workspace/editor settings with inheritance; settings sheets live in `components/settings/*`.
  - Theme: `components/providers/AppThemeProvider.tsx` binds `ui.theme` to `<html data-theme>` via `next-themes`.
  - App layout primitives: `src/shared/components/app/*` (AppLayout, AppTabGroup, AppTab, AppContent)
  - Actions: `setActiveWorkspace`, `openWorkspace`, `closeWorkspace`
  - Shell-level CopilotKit: `useCopilotReadable` (activeWorkspaceId, workspaceNames, editorSummary), `useCopilotAction` (switchWorkspace, openWorkspace, closeWorkspace)

- **Workspaces** (Forge, Video)
  - Each workspace uses `WorkspaceShell` from `src/shared/components/workspace`
  - Domain contract: `useForgeContract` / `useVideoContract` + `useDomainCopilot` register context, actions, and suggestions only when that workspace is active (only one workspace is mounted at a time)
  - CopilotKit provider reads merged app/workspace/editor settings for instructions, agent name, and temperature; workspace/editor model overrides are sent per-request via headers.

- **Editors** (current)
  - Forge: single React Flow graph editor (main slot). Future: multiple editor windows/tabs with sessions.
  - Video: placeholder main area; timeline/Twick UI to be wrapped later.

## Route state (minimal v1)

- **AppShellRoute**: `activeWorkspaceId`, `openWorkspaceIds`, `globalModals`. In-memory only; no URL.
- **Future**: Per-workspace `WorkspaceRoute` with `editors[]`, `focusedEditorId`, `sessions` when we add multiple editor windows/tabs.

## Model routing and OpenRouter

- Model selection: **free-only** by default (`lib/model-router/registry.ts`: `FREE_ONLY`, `FREE_MODEL_REGISTRY`). Auto-switch algorithm: filter enabled + tool-capable, exclude cooldown, sort free-first, pick first; if all in cooldown, pick expiring soonest. See `lib/model-router/auto-switch.ts`.
- 429/5xx: `reportModelError(modelId)` in `app/api/copilotkit/route.ts`; next request uses next model.
- OpenRouter: API key and base URL from `lib/openrouter-config.ts`; CopilotKit route builds runtime per request with `resolveModel()`.
- Per-request overrides: workspace/editor settings can send `x-forge-model` to `/api/copilotkit`; server validates against the registry and uses the override when present.

## References

- [Workspace & editor architecture](./workspace-editor-architecture.md)
- [Co-agents and multi-agent](../co-agents-and-multi-agent.md)
- [Workspace design](../workspace-design.md)
