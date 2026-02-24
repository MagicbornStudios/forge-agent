# DockLayout (WorkspaceLayout) Complete Reference

The resizable panel layout system for editors. Built on [dockview](https://github.com/mathuo/dockview), provides 2-pane, 3-pane, and 4-pane layouts with persistence, viewport scoping, and dynamic panel management.

## Overview

`WorkspaceLayout` is the **layout engine** for editors. It replaces the old grid-based `WorkspaceLayoutGrid` with a powerful dockview-based system that supports:

- **Resizable panels** with drag-to-resize
- **Layout persistence** via localStorage or controlled state
- **Slot-based composition** (`.Left`, `.Main`, `.Right`, `.Bottom`)
- **Config-driven rails** for multi-panel tabs
- **Viewport scoping** for settings resolution
- **Dynamic panel visibility** (show/hide panels without destroying state)

## Installation

```bash
npm install @forge/dev-kit
```

Import:

```tsx
import type { DockLayoutRef } from '@forge/dev-kit';
```

## Basic Usage: 2-Pane Layout

```tsx
<WorkspaceLayout
  layoutId="my-editor"
  leftDefaultSize={20}
>
  <WorkspaceLayout.Left>
    <WorkspacePanel panelId="nav" title="Navigator">
      {/* Left sidebar content */}
    </WorkspacePanel>
  </WorkspaceLayout.Left>

  <WorkspaceLayout.Main>
    <WorkspacePanel panelId="viewport" title="Viewport">
      {/* Main viewport */}
    </WorkspacePanel>
  </WorkspaceLayout.Main>
</WorkspaceLayout>
```

## Props API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `layoutId` | `string` | - | **Critical.** Unique layout identifier for persistence. Sets localStorage key (`dockview-${layoutId}`). |
| `left` | `React.ReactNode` | - | Legacy: Single left panel content. Use `.Left` slot instead. |
| `main` | `React.ReactNode` | - | Legacy: Single main panel content. Use `.Main` slot instead. |
| `right` | `React.ReactNode` | - | Legacy: Single right panel content. Use `.Right` slot instead. |
| `bottom` | `React.ReactNode` | - | Legacy: Single bottom panel content. Use `.Bottom` slot instead. |
| `leftPanels` | `RailPanelDescriptor[]` | - | Config-driven: Array of left rail panels (multi-tab). |
| `mainPanels` | `RailPanelDescriptor[]` | - | Config-driven: Array of main panels (multi-tab). |
| `rightPanels` | `RailPanelDescriptor[]` | - | Config-driven: Array of right rail panels (multi-tab). |
| `bottomPanels` | `RailPanelDescriptor[]` | - | Config-driven: Array of bottom panels (multi-tab). |
| `children` | `React.ReactNode` | - | **Recommended.** Slot components (`.Left`, `.Main`, `.Right`, `.Bottom`). |
| `slots` | `{ left?, main?, right?, bottom? }` | - | Per-slot config: `{ title, icon }` for Dockview tab bars. |
| `viewport` | `DockLayoutViewport` | - | Viewport metadata: `{ viewportId, viewportType, viewportScope }`. Sets `data-viewport-*` attributes. |
| `leftDefaultSize` | `number` | `20` | Left panel default width (percentage, 0-100). |
| `leftMinSize` | `number` | `10` | Left panel minimum width (percentage). |
| `rightDefaultSize` | `number` | `25` | Right panel default width (percentage). |
| `rightMinSize` | `number` | `10` | Right panel minimum width (percentage). |
| `bottomDefaultSize` | `number` | `25` | Bottom panel default height (percentage). |
| `bottomMinSize` | `number` | `10` | Bottom panel minimum height (percentage). |
| `layoutJson` | `string \| null` | - | Controlled layout state (JSON). When provided with `onLayoutChange` + `clearLayout`, layout is externally controlled. |
| `onLayoutChange` | `(json: string) => void` | - | Controlled mode: Called when layout changes. Persist to database/store. |
| `clearLayout` | `() => void` | - | Controlled mode: Called to reset layout. |
| `onPanelClosed` | `(slotId: string) => void` | - | Called when user closes a panel (tab X). Sync View menu state. |
| `className` | `string` | - | Additional classes for root element. |

## Slot-Based Composition (Recommended)

### 3-Pane Layout: Left | Main | Right

```tsx
<WorkspaceLayout
  layoutId="three-pane"
  leftDefaultSize={20}
  rightDefaultSize={25}
>
  <WorkspaceLayout.Left>
    <WorkspacePanel panelId="navigator" title="Navigator">
      {/* Navigator content */}
    </WorkspacePanel>
  </WorkspaceLayout.Left>

  <WorkspaceLayout.Main>
    <WorkspacePanel panelId="viewport" title="Viewport" scrollable={false}>
      {/* Canvas/Flow viewport */}
    </WorkspacePanel>
  </WorkspaceLayout.Main>

  <WorkspaceLayout.Right>
    <WorkspacePanel panelId="inspector" title="Inspector">
      {/* Property inspector */}
    </WorkspacePanel>
  </WorkspaceLayout.Right>
</WorkspaceLayout>
```

### 4-Pane Layout: Left | Main | Right | Bottom

```tsx
<WorkspaceLayout
  layoutId="four-pane"
  leftDefaultSize={20}
  rightDefaultSize={25}
  bottomDefaultSize={30}
>
  <WorkspaceLayout.Left>
    <WorkspacePanel panelId="files" title="Files">
      {/* File tree */}
    </WorkspacePanel>
  </WorkspaceLayout.Left>

  <WorkspaceLayout.Main>
    <WorkspacePanel panelId="editor" title="Editor" scrollable={false}>
      {/* Code editor */}
    </WorkspacePanel>
  </WorkspaceLayout.Main>

  <WorkspaceLayout.Right>
    <WorkspacePanel panelId="outline" title="Outline">
      {/* Document outline */}
    </WorkspacePanel>
  </WorkspaceLayout.Right>

  <WorkspaceLayout.Bottom>
    <WorkspacePanel panelId="terminal" title="Terminal">
      {/* Terminal panel */}
    </WorkspacePanel>
  </WorkspaceLayout.Bottom>
</WorkspaceLayout>
```

## Multi-Panel Rails (Config-Driven)

When a rail has multiple panels, they render as tabs. Use `.Panel` components within slots:

```tsx
<WorkspaceLayout
  layoutId="multi-panel"
  leftDefaultSize={20}
  rightDefaultSize={25}
>
  <WorkspaceLayout.Left>
    <WorkspaceLayout.Panel id="graphs" title="Graphs" icon={<BookOpen size={14} />}>
      {/* Graphs list */}
    </WorkspaceLayout.Panel>
    <WorkspaceLayout.Panel id="nodes" title="Nodes" icon={<Boxes size={14} />}>
      {/* Node palette */}
    </WorkspaceLayout.Panel>
    <WorkspaceLayout.Panel id="assets" title="Assets" icon={<Image size={14} />}>
      {/* Asset library */}
    </WorkspaceLayout.Panel>
  </WorkspaceLayout.Left>

  <WorkspaceLayout.Main>
    <WorkspacePanel panelId="main" title="Main">
      {/* Main content */}
    </WorkspacePanel>
  </WorkspaceLayout.Main>

  <WorkspaceLayout.Right>
    <WorkspaceLayout.Panel id="inspector" title="Inspector" icon={<ScanSearch size={14} />}>
      {/* Property inspector */}
    </WorkspaceLayout.Panel>
    <WorkspaceLayout.Panel id="chat" title="Chat" icon={<MessageCircle size={14} />}>
      {/* AI chat */}
    </WorkspaceLayout.Panel>
  </WorkspaceLayout.Right>
</WorkspaceLayout>
```

**First panel in each rail** is placed adjacent to main. **Subsequent panels** render as tabs within that rail.

## Real-World Example: CharacterWorkspace

From `apps/studio/components/editors/CharacterWorkspace.tsx`:

```tsx
const layoutRef = useRef<DockLayoutRef>(null);
const CHARACTER_LAYOUT_ID = 'character-mode';

const handlePanelClosed = useCallback(
  (slotId: string) => {
    const spec = panelSpecs.find((p) => p.id === slotId);
    if (spec) setPanelVisible(spec.key, false);
  },
  [panelSpecs, setPanelVisible]
);

return (
  <WorkspaceLayout
    ref={layoutRef}
    layoutId={CHARACTER_LAYOUT_ID}
    viewport={{ viewportId, viewportType: 'react-flow' }}
    slots={{ left: { title: 'Characters' }, main: { title: 'Graph' } }}
    leftDefaultSize={20}
    rightDefaultSize={25}
    onPanelClosed={handlePanelClosed}
  >
    <WorkspaceLayout.Left>
      <WorkspaceLayout.Panel id="left" title="Characters" icon={<BookOpen size={14} />}>
        <WorkspacePanel panelId="character-navigator" title="Characters" scrollable={false} hideTitleBar>
          <CharacterSidebar
            characters={characters}
            relationships={relationships}
            activeCharacterId={activeCharacterId}
            onSelectCharacter={(id) => setActiveCharacter(id)}
            onCreateCharacter={() => openOverlay('create-character')}
          />
        </WorkspacePanel>
      </WorkspaceLayout.Panel>
    </WorkspaceLayout.Left>

    <WorkspaceLayout.Main>
      <WorkspaceLayout.Panel id="main" title="Graph" icon={<LayoutDashboard size={14} />}>
        <RelationshipGraphEditor
          characters={characters}
          relationships={relationships}
          activeCharacterId={activeCharacterId}
          onCharacterSelect={(id) => setActiveCharacter(id)}
        />
      </WorkspaceLayout.Panel>
    </WorkspaceLayout.Main>

    <WorkspaceLayout.Right>
      <WorkspaceLayout.Panel id="right" title="Properties" icon={<ScanSearch size={14} />}>
        <WorkspacePanel panelId="character-properties" title="Properties" scrollable hideTitleBar>
          <ActiveCharacterPanel
            character={activeChar}
            onUpdate={handleUpdateCharacter}
          />
        </WorkspacePanel>
      </WorkspaceLayout.Panel>
      <WorkspaceLayout.Panel id="chat" title="Chat" icon={<MessageCircle size={14} />}>
        <div className="h-full min-h-0">
          <DialogueAssistantPanel
            contract={characterAssistantContract}
            toolsEnabled={toolsEnabled}
          />
        </div>
      </WorkspaceLayout.Panel>
    </WorkspaceLayout.Right>
  </WorkspaceLayout>
);
```

## Real-World Example: DialogueWorkspace (Dual Viewports)

From `apps/studio/components/editors/DialogueWorkspace.tsx`:

Shows two graph viewports (narrative + storylet) in the main panel:

```tsx
<WorkspaceLayout
  ref={layoutRef}
  layoutId="dialogue-mode"
  viewport={{ viewportId, viewportType: 'react-flow' }}
  slots={{ left: { title: 'Library' }, main: { title: 'Dialogue Graphs' } }}
  onPanelClosed={handlePanelClosed}
>
  <WorkspaceLayout.Left>
    <WorkspaceLayout.Panel id="left" title="Library" icon={<BookOpen size={14} />}>
      <WorkspacePanel panelId="dialogue-left" title="Library" tabs={sidebarTabs} hideTitleBar />
    </WorkspaceLayout.Panel>
  </WorkspaceLayout.Left>

  <WorkspaceLayout.Main>
    <WorkspaceLayout.Panel id="main" title="Dialogue Graphs" icon={<LayoutDashboard size={14} />}>
      <WorkspacePanel panelId="dialogue-main" title="Dialogue Graphs" hideTitleBar scrollable={false}>
        <div className="flex h-full w-full flex-col gap-[var(--control-gap)] p-[var(--panel-padding)]">
          <ForgeGraphPanel
            scope="narrative"
            graph={narrativeGraph}
            label="Narrative"
            isActive={activeScope === 'narrative'}
            onFocus={() => setActiveScope('narrative')}
          />
          <ForgeGraphPanel
            scope="storylet"
            graph={storyletGraph}
            label="Storylet"
            isActive={activeScope === 'storylet'}
            onFocus={() => setActiveScope('storylet')}
          />
        </div>
      </WorkspacePanel>
    </WorkspaceLayout.Panel>
  </WorkspaceLayout.Main>

  <WorkspaceLayout.Right>
    <WorkspaceLayout.Panel id="right" title="Inspector" icon={<ScanSearch size={14} />}>
      <WorkspacePanel panelId="dialogue-right" hideTitleBar>
        <EditorInspector selection={activeSelection} sections={inspectorSections} />
      </WorkspacePanel>
    </WorkspaceLayout.Panel>
    <WorkspaceLayout.Panel id="chat" title="Chat" icon={<MessageCircle size={14} />}>
      <div className="h-full min-h-0">
        <DialogueAssistantPanel
          contract={forgeAssistantContract}
          toolsEnabled={toolsEnabled}
        />
      </div>
    </WorkspaceLayout.Panel>
  </WorkspaceLayout.Right>
</WorkspaceLayout>
```

## Layout Persistence

### Automatic (localStorage)

When `layoutId` is set, layout is automatically persisted to `localStorage`:

```tsx
<WorkspaceLayout layoutId="my-editor">
  {/* ... */}
</WorkspaceLayout>
```

Key: `dockview-my-editor`

### Controlled (Database/Store)

For server-side persistence or cross-device sync:

```tsx
const [layoutJson, setLayoutJson] = useState<string | null>(null);

const handleLayoutChange = useCallback((json: string) => {
  setLayoutJson(json);
  // Save to database
  saveToDB('layout-my-editor', json);
}, []);

const handleClearLayout = useCallback(() => {
  setLayoutJson(null);
  // Clear from database
  deleteFromDB('layout-my-editor');
}, []);

<WorkspaceLayout
  layoutId="my-editor"
  layoutJson={layoutJson}
  onLayoutChange={handleLayoutChange}
  clearLayout={handleClearLayout}
>
  {/* ... */}
</WorkspaceLayout>
```

## Reset Layout (Imperative API)

Use ref to reset layout programmatically:

```tsx
const layoutRef = useRef<DockLayoutRef>(null);

// In View menu or settings
const handleResetLayout = () => {
  layoutRef.current?.resetLayout();
};

<WorkspaceLayout ref={layoutRef} layoutId="my-editor">
  {/* ... */}
</WorkspaceLayout>
```

This clears persisted layout and restores default panels.

## Viewport Scoping

Set viewport metadata for settings resolution:

```tsx
<WorkspaceLayout
  layoutId="dialogue"
  viewport={{
    viewportId: 'narrative',
    viewportType: 'react-flow',
    viewportScope: 'narrative',
  }}
>
  {/* ... */}
</WorkspaceLayout>
```

Sets these `data-*` attributes on root element:

```html
<div
  data-viewport-id="narrative"
  data-editor-id="narrative"
  data-viewport-type="react-flow"
  data-editor-type="react-flow"
  data-viewport-scope="narrative"
  data-editor-scope="narrative"
>
  ...
</div>
```

Settings store uses these for scope resolution:

```tsx
const showMiniMap = useSettingsStore((s) =>
  s.getSettingValue('graph.showMiniMap', { editorId: 'dialogue', viewportId: 'narrative' })
);
```

## Dynamic Panel Visibility

Hide panels without destroying their state:

```tsx
const [showLeft, setShowLeft] = useState(true);

<WorkspaceLayout layoutId="my-editor">
  {showLeft && (
    <WorkspaceLayout.Left>
      <WorkspacePanel panelId="nav" title="Navigator">
        {/* ... */}
      </WorkspacePanel>
    </WorkspaceLayout.Left>
  )}

  <WorkspaceLayout.Main>
    {/* ... */}
  </WorkspaceLayout.Main>
</WorkspaceLayout>
```

**Panel removal is detected** and the panel is closed in dockview. When you re-render with the panel, it's added back.

## Size Configuration

### Percentage-Based Sizing

All size props are percentages (0-100):

```tsx
<WorkspaceLayout
  leftDefaultSize={15}   // 15% of viewport width
  leftMinSize={10}       // Min 10% width
  rightDefaultSize={30}  // 30% of viewport width
  rightMinSize={15}      // Min 15% width
  bottomDefaultSize={25} // 25% of viewport height
  bottomMinSize={15}     // Min 15% height
>
  {/* ... */}
</WorkspaceLayout>
```

### Size Constraints

- **Left/Right**: Width percentages (viewport width)
- **Bottom**: Height percentage (viewport height)
- **Main**: Always fills remaining space
- **Min sizes prevent collapse** (users can't resize below minimum)

## Panel Tab Configuration

Configure tab appearance per slot:

```tsx
<WorkspaceLayout
  layoutId="my-editor"
  slots={{
    left: {
      title: 'Library',
      icon: <BookOpen size={14} />,
    },
    main: {
      title: 'Viewport',
      icon: <LayoutDashboard size={14} />,
    },
    right: {
      title: 'Properties',
      icon: <ScanSearch size={14} />,
    },
  }}
>
  {/* ... */}
</WorkspaceLayout>
```

These are **fallback configs**. If using `.Panel` components, their `title` and `icon` override these.

## TypeScript Interfaces

```tsx
export interface DockLayoutViewport {
  viewportId?: string;
  viewportType?: string;
  viewportScope?: string;
}

export interface DockLayoutSlotConfig {
  title?: string;
  icon?: React.ReactNode;
}

export interface RailPanelDescriptor {
  id: string;
  title: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

export interface DockLayoutRef {
  resetLayout: () => void;
}
```

## Common Patterns

### Pattern: Collapsible Left Sidebar

```tsx
const [leftVisible, setLeftVisible] = useState(true);

<EditorToolbar>
  <EditorToolbar.Left>
    <EditorToolbar.Button onClick={() => setLeftVisible(!leftVisible)}>
      {leftVisible ? <PanelLeftClose /> : <PanelLeftOpen />}
    </EditorToolbar.Button>
  </EditorToolbar.Left>
</EditorToolbar>

<WorkspaceLayout layoutId="collapsible">
  {leftVisible && (
    <WorkspaceLayout.Left>
      <WorkspacePanel panelId="nav" title="Navigator">
        {/* ... */}
      </WorkspacePanel>
    </WorkspaceLayout.Left>
  )}

  <WorkspaceLayout.Main>
    {/* ... */}
  </WorkspaceLayout.Main>
</WorkspaceLayout>
```

### Pattern: View Menu Integration

Sync panel visibility with View menu:

```tsx
const viewMenuItems = useMemo(
  () => [
    {
      id: 'show-left',
      label: showLeft ? 'Hide Navigator' : 'Show Navigator',
      icon: <PanelLeft size={16} />,
      onSelect: () => setShowLeft(!showLeft),
    },
    {
      id: 'show-right',
      label: showRight ? 'Hide Inspector' : 'Show Inspector',
      icon: <PanelRight size={16} />,
      onSelect: () => setShowRight(!showRight),
    },
    { id: 'sep-1', type: 'separator' as const },
    {
      id: 'reset-layout',
      label: 'Reset Layout',
      icon: <LayoutPanelTop size={16} />,
      onSelect: () => {
        setShowLeft(true);
        setShowRight(true);
        layoutRef.current?.resetLayout();
      },
    },
  ],
  [showLeft, showRight]
);
```

### Pattern: Settings-Driven Visibility

Store panel visibility in settings:

```tsx
const showLeftPanel = useSettingsStore((s) =>
  s.getSettingValue('panel.visible.left', { editorId: 'my-editor' })
) as boolean | undefined;

const showRightPanel = useSettingsStore((s) =>
  s.getSettingValue('panel.visible.right', { editorId: 'my-editor' })
) as boolean | undefined;

<WorkspaceLayout layoutId="my-editor">
  {showLeftPanel !== false && (
    <WorkspaceLayout.Left>
      {/* ... */}
    </WorkspaceLayout.Left>
  )}

  <WorkspaceLayout.Main>
    {/* ... */}
  </WorkspaceLayout.Main>

  {showRightPanel !== false && (
    <WorkspaceLayout.Right>
      {/* ... */}
    </WorkspaceLayout.Right>
  )}
</WorkspaceLayout>
```

## Performance Considerations

1. **Memoize panel content** — Panels re-render on dockview events
2. **Use `React.memo` for expensive viewports** (Canvas, Flow, etc.)
3. **Avoid inline functions in panel content** — Causes unnecessary re-renders
4. **Keep layoutId stable** — Changing it forces full layout reset

## Related Components

- [WorkspacePanel](./dock-panel) — Individual panel wrapper
- [PanelTabs](./panel-tabs.mdx) — Tab system for multi-panel rails
- [EditorInspector](./editor-inspector.mdx) — Selection-driven property panel

## Source Code

Location: `packages/shared/src/shared/components/editor/DockLayout.tsx`

## Migration from WorkspaceLayoutGrid

| Old (WorkspaceLayoutGrid) | New (WorkspaceLayout) |
|---------------------------|------------------------|
| Fixed grid (1-4 columns) | Resizable panels with drag |
| No persistence | Automatic localStorage + controlled |
| `leftSidebar`, `rightSidebar` props | `.Left`, `.Right` slots |
| Manual panel show/hide | Conditional rendering + sync |
| No viewport scoping | `viewport` prop with data attributes |

## Best Practices

1. **Always set `layoutId`** — Required for persistence
2. **Use slot composition over props** — More maintainable
3. **Sync panel visibility with View menu** — Better UX
4. **Use imperative reset sparingly** — Only for "Restore Defaults" actions
5. **Test with different viewport sizes** — Ensure min sizes work
6. **Keep viewport metadata accurate** — Settings depend on it