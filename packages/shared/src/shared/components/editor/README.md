# Editor Components (Shared)

Unreal-Engine-inspired editor UI primitives. This folder replaces the legacy
`components/workspace` hierarchy with **resizable, dockable, lockable panels**
and clearer naming.

## Core building blocks

- `EditorShell` - root container per editor. Sets `data-editor-id` (and legacy `data-mode-id`),
  `data-domain`, and `data-theme`.
- `EditorHeader` - title bar with `.Left` / `.Center` / `.Right`.
- `EditorToolbar` - toolbar with `.Left` / `.Center` / `.Right` and Menubar,
  Button, Group, ProjectSelect helpers.
- `EditorReviewBar` - plan -> patch review UX.
- `EditorStatusBar` - bottom status line.
- `EditorOverlaySurface` - declarative modal/drawer surface.

## Docking + layout

- `DockLayout` - resizable panel layout (left / main / right / bottom). Built on **Dockview**; layout persistence, resize, and drag are available to all consumers (including devkit users). Use the optional `slots` prop to set tab title and icon key per slot (e.g. `slots={{ main: { title: 'Dialogue Graphs' } }}`). Layout is persisted to `localStorage` when `layoutId` is set; reset by clearing `localStorage['dockview-{layoutId}']`.
- `DockPanel` - single panel (header, tabs, lock overlay, scroll).
- `PanelTabs` - tabs within a DockPanel.
- `ViewportMeta` - metadata wrapper for editor surfaces.

## Utilities

- `PanelSettings` - gear popover for per-panel settings.
- `usePanelLock` - lock state for AI patch application.
- `DockSidebar` - grid-embedded shadcn Sidebar wrapper.
- `EditorButton` / `EditorTooltip` - tooltip-friendly editor controls.

## Migration notes

Legacy `Workspace*` components remain in `components/workspace`. Use the
new names for all editor code. Deprecated `Mode*` aliases are re-exported
from the editor barrel for a limited migration window.

## Example

```tsx
import {
  EditorShell,
  EditorHeader,
  EditorToolbar,
  DockLayout,
  DockPanel,
  EditorStatusBar,
} from '@forge/shared/components/editor';

export function ExampleEditor() {
  return (
    <EditorShell editorId="example" title="Example" domain="ai">
      <EditorHeader>
        <EditorHeader.Left>Example</EditorHeader.Left>
      </EditorHeader>
      <EditorToolbar>
        <EditorToolbar.Left>Toolbar</EditorToolbar.Left>
      </EditorToolbar>
      <DockLayout
        left={<DockPanel panelId="left" title="Library" />}
        main={<DockPanel panelId="main" scrollable={false}>Main</DockPanel>}
        right={<DockPanel panelId="right" title="Inspector" />}
        viewport={{ viewportId: 'example', viewportType: 'custom' }}
        layoutId="example"
      />
      <EditorStatusBar>Ready</EditorStatusBar>
    </EditorShell>
  );
}
```
