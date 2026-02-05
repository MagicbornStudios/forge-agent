# Unified workspace (App Shell) architecture

## Overview

The app has a **Unified Workspace** implemented as an **App Shell** that owns multiple sub-workspaces (Forge, Video). Users switch between workspaces via tabs; only the active workspace is rendered. CopilotKit runs at the shell level and receives both shell context (active workspace, names) and domain context from the active workspace.

## Hierarchy

- **App Shell** (`apps/studio/components/AppShell.tsx`, `apps/studio/lib/app-shell/store.ts`)
  - State: `activeWorkspaceId`, `openWorkspaceIds`, `globalModals`, `workspaceThemes` (optional per-workspace overrides)
  - Settings: `apps/studio/lib/settings/store.ts` provides app/workspace/editor settings with inheritance; settings sheets live in `apps/studio/components/settings/*`.
  - Theme: `apps/studio/components/providers/AppThemeProvider.tsx` binds `ui.theme` to `<html data-theme>` via `next-themes`.
  - App layout primitives: `packages/shared/src/shared/components/app/*` (AppLayout, AppTabGroup, AppTab, AppContent)
  - Actions: `setActiveWorkspace`, `openWorkspace`, `closeWorkspace`
  - Shell-level CopilotKit: `useCopilotReadable` (activeWorkspaceId, workspaceNames, editorSummary), `useCopilotAction` (switchWorkspace, openWorkspace, closeWorkspace)

- **Workspaces** (Forge, Video)
  - Each workspace uses `WorkspaceShell` from `packages/shared/src/shared/components/workspace`
  - Domain contract: `useForgeContract` / `useVideoContract` + `useDomainCopilot` register context, actions, and suggestions only when that workspace is active (only one workspace is mounted at a time)
  - CopilotKit provider reads merged app/workspace/editor settings for instructions, agent name, and temperature; workspace/editor model overrides are sent per-request via headers.

- **Editors** (current)
  - Forge: single React Flow graph editor (main slot). Future: multiple editor windows/tabs with sessions.
  - Video: placeholder main area; UI showcase only.

## Route state (minimal v1)

- **AppShellRoute**: `activeWorkspaceId`, `openWorkspaceIds`, `globalModals`. Restored from and persisted to `localStorage` under `forge:app-shell:v1` via `AppShellRoutePersistence`; see `apps/studio/lib/persistence/local-storage.ts`.
- **Current document ids**: `forge:lastGraphId:v1` and `forge:lastVideoDocId:v1` store the last opened graph/video doc; used on app load to open last document or first from list or create empty. Graph store and (when implemented) video flow persist the current id on load/set.
- **Draft vs server-state**: Draft edits live in Zustand (e.g. graph store, video store); save sends to the server and clears dirty. Server-state is fetched via Next API routes and cached with TanStack Query (`apps/studio/lib/data/keys.ts`, `lib/data/hooks/`). `beforeunload` warns when any draft is dirty (`DirtyBeforeUnload`).
- **Future**: Per-workspace `WorkspaceRoute` with `editors[]`, `focusedEditorId`, `sessions` when we add multiple editor windows/tabs.

## Model routing and OpenRouter

- Model selection: **free-only** by default (`apps/studio/lib/model-router/registry.ts`: `FREE_ONLY`, `FREE_MODEL_REGISTRY`). Auto-switch algorithm: filter enabled + tool-capable, exclude cooldown, sort free-first, pick first; if all in cooldown, pick expiring soonest. See `apps/studio/lib/model-router/auto-switch.ts`.
- 429/5xx: `reportModelError(modelId)` in `apps/studio/app/api/copilotkit/route.ts`; next request uses next model.
- OpenRouter: API key and base URL from `apps/studio/lib/openrouter-config.ts`; CopilotKit route builds runtime per request with `resolveModel()`.
- Per-request overrides: workspace/editor settings can send `x-forge-model` to `/api/copilotkit`; server validates against the registry and uses the override when present.

## References

- [Workspace & editor architecture](./workspace-editor-architecture.md)
- [Co-agents and multi-agent](../co-agents-and-multi-agent.md)
- [Workspace design](../workspace-design.md)
