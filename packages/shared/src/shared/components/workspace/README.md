# Workspace UI kit

Declarative, slot-based shell for all workspaces. Same surfaces everywhere: Header, Toolbar, LeftPanel, Main, Right, StatusBar, BottomPanel, Overlays.

## Surfaces

| Slot | Component | Required |
|------|-----------|----------|
| header | WorkspaceHeader (Left / Center / Right) | yes |
| toolbar | WorkspaceToolbar (groups or Left/Center/Right) | yes |
| left | WorkspaceLayoutGrid left prop | optional |
| main | WorkspaceLayoutGrid main prop | yes |
| right | WorkspaceLayoutGrid right prop | optional |
| statusBar | WorkspaceStatusBar | yes |
| bottom | WorkspaceLayoutGrid bottom prop | optional |
| overlays | WorkspaceOverlaySurface (overlays + activeOverlay) | n/a |

## Structure

```
workspace/
  WorkspaceShell.tsx
  WorkspaceLayout.tsx
  layout/WorkspaceLayoutGrid.tsx # left/main/right/bottom grid
  controls/WorkspaceButton.tsx   # tooltip-ready button
  header/WorkspaceHeader.tsx     # .Left, .Center, .Right
  toolbar/WorkspaceToolbar.tsx   # groups? or .Left, .Center, .Right, .Button, .Separator, .Group
  panels/
    WorkspaceLeftPanel.tsx
    WorkspaceEditor.tsx          # editor wrapper inside main (required)
    WorkspaceInspector.tsx       # selection + sections? or children
    WorkspaceBottomPanel.tsx
    WorkspaceSidebar.tsx         # alias for left panel chrome
    WorkspaceMain.tsx            # main region chrome
  status/WorkspaceStatusBar.tsx
  overlays/WorkspaceOverlaySurface.tsx   # declarative overlays; no registry
  modals/WorkspaceModalsHost.tsx          # legacy (registry-based)
  tabs/WorkspaceTabGroup.tsx     # workspace tabs
  tabs/WorkspaceTab.tsx
  tooltip/WorkspaceTooltip.tsx
  types.ts
  index.ts
```

## Usage

```tsx
<WorkspaceShell workspaceId="forge" title="Forge" domain="forge">
  <WorkspaceHeader>
    <WorkspaceHeader.Left>Project</WorkspaceHeader.Left>
    <WorkspaceHeader.Center>Breadcrumbs</WorkspaceHeader.Center>
  </WorkspaceHeader>
  <WorkspaceToolbar>
    <WorkspaceToolbar.Left>...</WorkspaceToolbar.Left>
    <WorkspaceToolbar.Right>
      <WorkspaceToolbar.Button onClick={...} tooltip="Save changes">Save</WorkspaceToolbar.Button>
    </WorkspaceToolbar.Right>
  </WorkspaceToolbar>
  <WorkspaceLayoutGrid main={<GraphEditor />} editor={{ editorId: 'forge-graph', editorType: 'react-flow' }} />
  <WorkspaceStatusBar>Ready</WorkspaceStatusBar>
  <WorkspaceOverlaySurface
    overlays={[{ id: 'create-node', type: 'modal', title: 'Create node', render: ({ payload, onDismiss }) => <CreateNodeModal ... /> }]}
    activeOverlay={activeOverlay}
    onDismiss={() => setActiveOverlay(null)}
  />
</WorkspaceShell>
```

## Workspace tabs + tooltips

Use the shared primitives so every control supports `tooltip` / `tooltipDisabled`:

```tsx
<WorkspaceTabGroup actions={<WorkspaceButton>+ Forge</WorkspaceButton>}>
  <WorkspaceTab label="Forge" isActive tooltip="Switch to Forge" />
</WorkspaceTabGroup>
```

## Conventions

- **Declarative only**: Slots and overlay list; no imperative refs or registry.
- **Editor wrapper required**: `WorkspaceLayoutGrid` always wraps the main slot with `WorkspaceEditor` metadata (`editorId`, `editorType`).
- **Selection-first**: Inspector can use `selection` + `sections[]` with `when(selection)`.
- **No file scanning**: Overlays declared in one place per workspace.
- **shadcn**: Use `npx shadcn@latest add <name>` for UI primitives.
- **Tooltips**: Prefer `WorkspaceButton`, `WorkspaceTab`, and `WorkspaceTooltip` to get `tooltip` + `tooltipDisabled` props.
- **Themes**: `WorkspaceShell` accepts an optional `theme` override. If omitted, the workspace inherits the app theme.
- **Toolbar standard**: Include File menu + Project select + Settings in workspace toolbars.

See [AGENTS.md](./AGENTS.md) and **docs/architecture/workspace-editor-architecture.md** for vocabulary and contracts.
