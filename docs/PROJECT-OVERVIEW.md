# Forge Agent — Project overview

## Project summary

**Forge Agent** is a proof-of-concept AI-powered application that provides:

- **Unified workspace (App Shell)** with multiple sub-workspaces (Forge, Video) and state-managed routing (no URL).
- **Forge workspace**: React Flow graph editor for dialogue/story graphs (nodes: Character, Player, Conditional, Start/End); natural-language editing via CopilotKit (create/update/delete nodes and edges).
- **Video workspace**: Timeline/video document workspace (VideoDoc, tracks, elements); placeholder for future Twick Studio integration; CopilotKit domain contract for AI actions.
- **AI integration**: CopilotKit at the shell level (context + actions for workspace switching) and per-workspace domain contracts (context, actions, suggestions). OpenRouter for models; free-only model routing with auto-switch and cooldown on 429/5xx.
- **Settings**: App → workspace → editor inheritance; AI settings (instructions, agent name, temperature) and theme; settings sheets for each scope.
- **Backend**: Payload CMS (SQLite) for graph storage; REST API for graphs; Next.js API routes for CopilotKit, model-settings, and graphs.

**Tech stack**: Next.js 15 (Turbopack), React 19, Zustand, CopilotKit (react-core, react-ui, runtime), OpenRouter (AI SDK + OpenAI provider), React Flow, Payload CMS, Tailwind CSS 4, shadcn/ui (Radix), TypeScript 5.

---

## Architecture (high level)

- **App Shell** (`components/AppShell.tsx`, `lib/app-shell/store.ts`): Owns `activeWorkspaceId`, `openWorkspaceIds`, `globalModals`, `workspaceThemes`. Renders workspace tabs (AppTabGroup/AppTab) and the active workspace. Registers shell-level CopilotKit context and actions (switchWorkspace, openWorkspace, closeWorkspace).
- **Workspaces**: Forge and Video. Only the active one is mounted. Each uses `WorkspaceShell` from `src/shared/components/workspace`, `WorkspaceLayoutGrid`, domain store, and `useDomainCopilot(contract)` to register context/actions/suggestions.
- **Shared**: `src/shared` contains workspace UI kit (shell, layout, header, toolbar, panels, tabs, status, overlays), CopilotKit integration (useDomainCopilot, contract types, generative UI), styles (themes.css as single source of truth), and headless workspace contracts (selection, capabilities, overlays).
- **Domains**: `lib/domains/forge` and `lib/domains/video` — types, stores, operations, and copilot contracts (actions, context, suggestions) per domain.
- **Model routing**: `lib/model-router` — registry (free-only), auto-switch, server-state (cooldown), store; CopilotKit API route uses `resolveModel()` and reports errors for rotation.

---

## Codebase layout (what each folder does)

| Path | Purpose |
|------|--------|
| **app/** | Next.js App Router: root layout, page, globals.css; API routes (copilotkit, graphs, model-settings). |
| **app/api/** | API route handlers: CopilotKit runtime, CRUD for graphs (Payload), model-settings GET/POST. |
| **components/** | App-level React components: AppShell, Workspace wrapper, Forge (GraphEditor, nodes, timeline, inspector), settings, providers, shadcn UI. Not shared across apps. |
| **components/forge/** | Forge-specific UI: FlowBackground, FlowControls, FlowMiniMap, FlowPanel, ForgeInspectorSections, ForgeTimeline, index. |
| **components/model-switcher/** | Model selection dropdown (Auto/Manual, free models, health); used in workspace toolbars. |
| **components/nodes/** | React Flow custom nodes: CharacterNode, PlayerNode, ConditionalNode. |
| **components/providers/** | AppThemeProvider (next-themes → data-theme), CopilotKitProvider, TooltipProvider. |
| **components/settings/** | Settings store UI: AppSettingsPanel, WorkspaceSettingsPanel, EditorSettingsPanel, SettingsMenu, SettingsSheet, SettingsPanel, ai-settings, types. |
| **components/ui/** | shadcn/ui primitives (button, card, dialog, dropdown-menu, input, select, sheet, tabs, tooltip, etc.). |
| **components/workspaces/** | Workspace entry components: ForgeWorkspace, VideoWorkspace, index. |
| **collections/** | Payload CMS collection config (e.g. forge-graphs). |
| **lib/** | Application and domain logic: app-shell store, domains (forge, video), model-router, settings store, graph store/operations, OpenRouter config, utils. |
| **lib/app-shell/** | App shell state (Zustand): route (activeWorkspaceId, openWorkspaceIds, globalModals), workspaceThemes, actions. Plus workspace-metadata (labels, editor ids). |
| **lib/domains/forge/** | Forge domain: types, store, operations, scene, and copilot (actions, context, suggestions, generative-ui, index). |
| **lib/domains/video/** | Video domain: types, store, operations, scene-overrides, and copilot (actions, context, suggestions, index). |
| **lib/model-router/** | Model registry (free-only), auto-switch algorithm, server-state (cooldown), client store, types. |
| **lib/settings/** | Settings store with app → workspace → editor inheritance. |
| **src/shared/** | Shared code: workspace components, copilot hooks/types, styles, headless workspace contracts. No app or domain-specific imports. |
| **src/shared/components/app/** | App-level layout primitives: AppLayout, AppTabGroup, AppTab, AppContent, index. |
| **src/shared/components/workspace/** | Workspace shell and slots: WorkspaceShell, WorkspaceLayout, WorkspaceLayoutGrid, Header, Toolbar (with FileMenu, ProjectSelect), panels (Left, Main, Inspector, Bottom, etc.), StatusBar, OverlaySurface, tabs, controls, tooltip, types. |
| **src/shared/copilot/** | CopilotKit integration: agent-types, types, useDomainCopilot (and -context, -actions, -suggestions), useAIHighlight, generative-ui (ConfirmationCard, DiffPreview). |
| **src/shared/styles/** | CSS: themes.css (semantic tokens, theme variants), contexts.css, graph.css, scrollbar.css, README. |
| **src/shared/workspace/** | Headless workspace contracts: capabilities, selection, inspector, overlays, modal, navigation, draft, focus, proposal, toolbar types, workspace-ui-spec, index. |
| **types/** | Global TypeScript types (e.g. graph types used by Forge and API). |
| **docs/** | Documentation: STATUS, architecture (unified-workspace, workspace-editor), design (styling-and-theming), guides (adding-domain-actions, workspace-design, co-agents, code-organization, errors-and-attempts, timeline-and-twick, etc.). |
| **__tests__/** | Jest tests: app-shell store, forge contract, graph-operations, model-router (auto-switch, server-state). |
| **__mocks__/** | Jest mocks (e.g. server-only). |
| **.cursor/plans/** | Cursor/plan files (architecture and feature plans). |

---

## Full file list

```
.env
.gitignore
AGENTS.md
README.md
SETUP.md
components.json
jest.config.js
jest.setup.js
next.config.ts
package.json
package-lock.json
payload.config.ts
postcss.config.mjs
tailwind.config.ts
tsconfig.json

__mocks__/
  server-only.js

__tests__/
  app-shell-store.test.ts
  graph-operations.test.ts
  domains/
    forge-contract.test.tsx
  model-router/
    auto-switch.test.ts
    server-state.test.ts

app/
  globals.css
  layout.tsx
  page.tsx
  api/
    copilotkit/
      route.ts
    graphs/
      route.ts
      [id]/
        route.ts
    model-settings/
      route.ts

collections/
  forge-graphs.ts

components/
  AppShell.tsx
  CreateNodeModal.tsx
  GraphEditor.tsx
  Workspace.tsx
  forge/
    FlowBackground.tsx
    FlowControls.tsx
    FlowMiniMap.tsx
    FlowPanel.tsx
    ForgeInspectorSections.tsx
    ForgeTimeline.tsx
    index.ts
  model-switcher/
    index.ts
    ModelSwitcher.tsx
  nodes/
    CharacterNode.tsx
    ConditionalNode.tsx
    PlayerNode.tsx
  providers/
    AppThemeProvider.tsx
    CopilotKitProvider.tsx
    TooltipProvider.tsx
  settings/
    ai-settings.tsx
    AppSettingsPanel.tsx
    EditorSettingsPanel.tsx
    SettingsMenu.tsx
    SettingsPanel.tsx
    SettingsSheet.tsx
    types.ts
    WorkspaceSettingsPanel.tsx
  ui/
    accordion.tsx
    alert-dialog.tsx
    alert.tsx
    aspect-ratio.tsx
    avatar.tsx
    badge.tsx
    breadcrumb.tsx
    button.tsx
    card.tsx
    checkbox.tsx
    collapsible.tsx
    command.tsx
    context-menu.tsx
    dialog.tsx
    drawer.tsx
    dropdown-menu.tsx
    hover-card.tsx
    input.tsx
    kbd.tsx
    label.tsx
    menubar.tsx
    navigation-menu.tsx
    pagination.tsx
    popover.tsx
    progress.tsx
    radio-group.tsx
    resizable.tsx
    scroll-area.tsx
    select.tsx
    separator.tsx
    sheet.tsx
    skeleton.tsx
    slider.tsx
    sonner.tsx
    switch.tsx
    table.tsx
    tabs.tsx
    textarea.tsx
    toggle-group.tsx
    toggle.tsx
    tooltip.tsx
  workspaces/
    ForgeWorkspace.tsx
    VideoWorkspace.tsx
    index.ts

docs/
  STATUS.md
  adding-domain-actions.md
  ai-workspace-integration.md
  code-organization.md
  copilotkit-workspace-integration.md
  errors-and-attempts.md
  timeline-and-twick.md
  workspace-design.md
  architecture/
    unified-workspace.md
    workspace-editor-architecture.md
  design/
    styling-and-theming.md
  co-agents-and-multi-agent.md

lib/
  copilot-actions.ts
  forge-to-timeline.ts
  graph-operations.ts
  graph-to-sequence.ts
  openrouter-config.ts
  store.ts
  useForgeCopilotActions.ts
  utils.ts
  app-shell/
    store.ts
    workspace-metadata.ts
  domains/
    forge/
      operations.ts
      scene.ts
      store.ts
      types.ts
      copilot/
        actions.ts
        context.ts
        generative-ui.tsx
        index.ts
        suggestions.ts
    video/
      operations.ts
      scene-overrides.ts
      store.ts
      types.ts
      copilot/
        actions.ts
        context.ts
        index.ts
        suggestions.ts
  model-router/
    auto-switch.ts
    index.ts
    registry.ts
    server-state.ts
    store.ts
    types.ts
  settings/
    store.ts

src/
  shared/
    AGENTS.md
    components/
      app/
        AppContent.tsx
        AppLayout.tsx
        AppTab.tsx
        AppTabGroup.tsx
        index.ts
      workspace/
        AGENTS.md
        README.md
        index.ts
        types.ts
        WorkspaceLayout.tsx
        WorkspaceShell.tsx
        controls/
          WorkspaceButton.tsx
        header/
          WorkspaceHeader.tsx
        layout/
          WorkspaceLayoutGrid.tsx
        modals/
          WorkspaceModalsHost.tsx
        overlays/
          WorkspaceOverlaySurface.tsx
        panels/
          index.ts
          WorkspaceBottomPanel.tsx
          WorkspaceEditor.tsx
          WorkspaceInspector.tsx
          WorkspaceLeftPanel.tsx
          WorkspaceMain.tsx
          WorkspaceSidebar.tsx
        status/
          WorkspaceStatusBar.tsx
        tabs/
          WorkspaceTab.tsx
          WorkspaceTabGroup.tsx
        toolbar/
          WorkspaceFileMenu.tsx
          WorkspaceProjectSelect.tsx
          WorkspaceToolbar.tsx
        tooltip/
          WorkspaceTooltip.tsx
    copilot/
      agent-types.ts
      index.ts
      types.ts
      use-ai-highlight.ts
      use-domain-copilot.ts
      use-domain-copilot-actions.ts
      use-domain-copilot-context.ts
      use-domain-copilot-suggestions.ts
      generative-ui/
        ConfirmationCard.tsx
        DiffPreview.tsx
        index.ts
    styles/
      README.md
      contexts.css
      graph.css
      scrollbar.css
      themes.css
    workspace/
      AGENTS.md
      capabilities.ts
      draft.ts
      focus.ts
      index.ts
      inspector.ts
      modal.ts
      navigation.ts
      overlays.ts
      proposal.ts
      selection.ts
      toolbar.ts
      workspace-ui-spec.ts

types/
  graph.ts

.cursor/
  plans/
    ai_highlight,_refactor,_timeline,_twick_a3e4d601.plan.md
    app_layer_declarative_workspace_settings_a1b2c3d4.plan.md
    forge_workspace_react_flow_and_unified_editor_api_dd8b18af.plan.md
    turborepo_video_agent_flowise_copilotkit_b1b2c3d4.plan.md
    unified_workspace_and_agent_architecture_edd5cdaa.plan.md

.claude/
  settings.local.json
```

*(File `nul` at repo root is an accidental artifact and can be ignored.)*

---

## Key configuration files

| File | Purpose |
|------|--------|
| **package.json** | name: forge-agent-poc; scripts: dev (next dev --turbopack), build, start, lint, test; deps: Next 15, React 19, CopilotKit, React Flow, Payload, OpenRouter/AI SDK, Zustand, Tailwind, shadcn deps, @twick/timeline. |
| **tsconfig.json** | TypeScript config; path alias `@/*` → root. |
| **next.config.ts** | Next.js config (Payload, etc.). |
| **tailwind.config.ts** | Tailwind v4; content from app and components. |
| **payload.config.ts** | Payload CMS config; DB and collections. |
| **jest.config.js** | Jest; testMatch, moduleNameMapper for @/ and server-only mock. |
| **components.json** | shadcn/ui configuration. |

---

## Entry and data flow

- **Entry**: `app/layout.tsx` → `app/page.tsx`. Page wraps with TooltipProvider and CopilotKitProvider, then renders HomeContent (loads sample graph into store) and AppShell.
- **AppShell**: Reads app-shell store; renders AppLayout → AppTabGroup (workspace tabs + Settings) and AppContent (ForgeWorkspace or VideoWorkspace by activeWorkspaceId).
- **ForgeWorkspace**: Uses graph store, forge domain contract, useDomainCopilot(forgeContract); composes WorkspaceShell → Header, Toolbar (File, Project, ModelSwitcher, actions), WorkspaceLayoutGrid (main = GraphEditor, right = Inspector, bottom = ForgeTimeline), StatusBar, OverlaySurface.
- **VideoWorkspace**: Uses video store, video contract, useDomainCopilot(videoContract); similar shell/layout with placeholder main content.
- **CopilotKit**: `/api/copilotkit` builds runtime with OpenRouter model (resolveModel), reports model errors; frontend registers shell context/actions and per-workspace contract (context, actions, suggestions).

---

## References

- **AGENTS.md** (root): Workspace Platform Engineer, unified workspace, agent layers, do-not-repeat notes.
- **docs/STATUS.md**: Current state, Ralph Wiggum loop, next steps, recent changes.
- **docs/architecture/unified-workspace.md**: App Shell, workspaces, route state, model routing.
- **docs/workspace-design.md**: Extending AI, adding workspaces/editors, auto model behavior.
- **src/shared/AGENTS.md** and **src/shared/components/workspace/AGENTS.md**: Shared and workspace UI rules.
