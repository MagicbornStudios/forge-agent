# Status

## Current

- **App Shell**: Unified workspace with tabs (Forge | Video). `lib/app-shell/store.ts`; `components/AppShell.tsx`. Shell-level CopilotKit context (activeWorkspaceId, workspaceNames, editorSummary) and actions (switchWorkspace, openWorkspace, closeWorkspace). Workspace tabs use `WorkspaceTabGroup`/`WorkspaceTab` with tooltip support. App-level settings are accessible from the tab bar.
- **Workspaces**: Forge (`components/workspaces/ForgeWorkspace.tsx`) and Video (`components/workspaces/VideoWorkspace.tsx`). Only active workspace is rendered. Each uses `WorkspaceShell`, `WorkspaceLayoutGrid`, domain contract, and a standard toolbar (Menubar: File/Edit/View, Project combobox, Settings). Editors are wrapped with required `WorkspaceEditor` metadata via the layout grid. Workspaces can override `theme` (Video currently uses `darcula`).
- **Settings**: Settings store with app -> workspace -> editor inheritance (`lib/settings/store.ts`) and sheets/panels for app, workspace, editor scopes (`components/settings/*`). AI settings drive CopilotKit instructions/agent name/temperature, and app `ui.theme` drives `AppThemeProvider` (`next-themes`) for `<html data-theme>`.
- **Model routing**: Free-only by default (`FREE_MODEL_REGISTRY`). Auto-switch (cooldown, free-first); 429/5xx -> reportModelError. GET/POST `/api/model-settings`; CopilotKit route uses `resolveModel()` with optional per-request overrides via `x-forge-model`. App AI model setting syncs with the router.
- **Workspace UI kit**: Header, Toolbar (Left/Center/Right + Menubar/File/Edit/View and Project combobox), LayoutGrid, StatusBar, Overlays, plus `WorkspaceButton`, `WorkspaceTabGroup`, `WorkspaceTab`, `WorkspaceTooltip`, and `WorkspaceEditor`. See `src/shared/components/workspace/` and `docs/architecture/workspace-editor-architecture.md`.
- **Styling**: Single source of truth in themes.css; globals.css does not override semantic tokens. Themes apply to any `[data-theme]`. Default theme: `data-theme="dark-fantasy"`. Design guidance in `docs/design/styling-and-theming.md`.
- **Shadcn UI**: Expanded shadcn atom inventory (`components/ui/*`) including field/item, command/combobox, context-menu, menubar, sonner, etc. Settings panels now use Field/Item atoms.
- **Toasts**: Sonner mounted in `AppShell` and gated by `ui.toastsEnabled` (app settings); graph saves/loads emit success/error toasts.

## Ralph Wiggum loop

- Done (2026-02-04): Added shadcn Field/Item atoms, refactored settings to use them, converted ProjectSelect to combobox (Popover + Command), added Menubar (File/Edit/View) and GraphEditor context menu, and wired Sonner toasts with app-level toggle.
- In progress: None.
- Other agents: None reported.
- Next: Add workspace-specific agent conversations (co-agents) and richer AI controls per editor.

## Next

1. Co-agent implementation (e.g. Forge editor co-agent) if needed.
2. Full editor/session model (multiple editor windows per workspace) when required.
3. Persist App Shell route (e.g. localStorage).

## What changed (recent)

- Workspace layout is now declarative via `WorkspaceLayoutGrid` (no WorkspacePanels/Canvas/Timeline).
- Added settings store with inheritance and Settings sheets for app/workspace/editor scopes; CopilotKit reads settings for instructions/agent name/temperature.
- Standard toolbar primitives now use Menubar (File/Edit/View) and Project combobox; Graph editor has a context menu for add/fit/clear.
- Sonner toasts added with app-level enable/disable.
- New design guidance doc for Spotify/Photoshop-inspired shadcn UI; app theme now updates from settings; atomic design documented.
