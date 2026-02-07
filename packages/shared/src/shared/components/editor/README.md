# Editor Components (Shared)

Unreal-Engine-inspired editor UI primitives. This folder replaces the legacy
`components/workspace` hierarchy with **resizable, dockable, lockable panels**
and clearer naming.

## Core building blocks

- `EditorShell` - root container per mode. Sets `data-mode-id`, `data-domain`,
  and `data-theme`.
- `ModeHeader` - title bar with `.Left` / `.Center` / `.Right`.
- `ModeToolbar` - toolbar with `.Left` / `.Center` / `.Right` and Menubar,
  Button, Group, ProjectSelect helpers.
- `ModeReviewBar` - plan -> patch review UX.
- `ModeStatusBar` - bottom status line.
- `ModeOverlaySurface` - declarative modal/drawer surface.

## Docking + layout

- `DockLayout` - resizable panel layout (left / main / right / bottom).
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
new names for all editor mode code. The old barrel re-exports the new
components with `@deprecated` comments to ease migration.

## Example

```tsx
import {
  EditorShell,
  ModeHeader,
  ModeToolbar,
  DockLayout,
  DockPanel,
  ModeStatusBar,
} from '@forge/shared/components/editor';

export function ExampleMode() {
  return (
    <EditorShell modeId="example" title="Example" domain="ai">
      <ModeHeader>
        <ModeHeader.Left>Example</ModeHeader.Left>
      </ModeHeader>
      <ModeToolbar>
        <ModeToolbar.Left>Toolbar</ModeToolbar.Left>
      </ModeToolbar>
      <DockLayout
        left={<DockPanel panelId="left" title="Library" />}
        main={<DockPanel panelId="main" scrollable={false}>Main</DockPanel>}
        right={<DockPanel panelId="right" title="Inspector" />}
        viewport={{ editorId: 'example', editorType: 'custom' }}
        layoutId="example"
      />
      <ModeStatusBar>Ready</ModeStatusBar>
    </EditorShell>
  );
}
```
