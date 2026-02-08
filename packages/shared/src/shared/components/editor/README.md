# Editor Components (Shared)

Unreal-Engine-inspired editor UI primitives. This folder replaces the legacy
`components/workspace` hierarchy with **resizable, lockable panels**
and clearer naming.

## Core building blocks

- `EditorShell` - root container per editor. Sets `data-editor-id`, `data-domain`, and `data-theme`.
- `EditorHeader` - title bar with `.Left` / `.Center` / `.Right`.
- `EditorToolbar` - toolbar with `.Left` / `.Center` / `.Right` and Menubar,
  Button, Group, ProjectSelect helpers.
- `EditorReviewBar` - plan -> patch review UX.
- `EditorStatusBar` - bottom status line.
- `EditorOverlaySurface` - declarative modal/drawer surface.

## Docking + layout

- `DockLayout` - dockable panel layout (left / main / right / bottom). Built on **Dockview** for drag-to-reorder, floating panels, and tab grouping. Layout is persisted to `localStorage['dockview-{layoutId}']` when `layoutId` is set. Use a ref and call `ref.current.resetLayout()` to restore default panels (e.g. "Reset layout" button). Optional `slots` let you customize tab title/icon.
- `DockPanel` - single panel (header, tabs, lock overlay, scroll).
- `PanelTabs` - tabs within a DockPanel.
- `ViewportMeta` - metadata wrapper for editor surfaces.

## Utilities

- `PanelSettings` - gear popover for per-panel settings.
- `usePanelLock` - lock state for AI patch application.
- `DockSidebar` - grid-embedded shadcn Sidebar wrapper.
- `EditorButton` / `EditorTooltip` - tooltip-friendly editor controls.

## Editor color context

Editor sections are **context-colored** by `EditorShell`’s `domain` prop and `packages/shared/src/shared/styles/contexts.css`. The shell sets `data-domain` (e.g. `dialogue`, `forge`, `video`, `writer`, `ai`, `character`) so all descendants inherit:

- **`--context-accent`** — primary accent for borders, active tab, panel header, selected state. Use for section edges and list accents.
- **`--context-glow`** / **`--context-ring`** — focus and selection rings; `--ring` and `--primary` are aligned to context under `[data-domain]`.
- **`--sidebar-primary`** / **`--sidebar-ring`** — sidebar hover/active when inside a domain.

Optional `data-context-node-type` (e.g. on graph or panel) refines the accent (e.g. dialogue node types). Prefer these tokens over ad-hoc colors; see `docs/design/01-styling-and-theming.mdx` (repo root).

## Migration notes

**Workspace\*** UI components have been removed; **Editor\*** + DockLayout are the only shell. Types (Selection, InspectorSection, ToolbarGroup, OverlaySpec, etc.) live in `shared/workspace` and are consumed by Editor*; there is a single home for these types (no duplicates in editor).

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
