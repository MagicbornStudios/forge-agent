# Editor Components (Shared)

Unreal-Engine-inspired editor UI primitives. This folder replaces the legacy
`components/workspace` hierarchy with **resizable, lockable panels**
and clearer naming.

## Core building blocks

- `WorkspaceShell` - root container per editor. Sets `data-editor-id`, `data-domain`, and `data-theme`. Supports **declarative slots** (`.Header`, `.Toolbar`, `.Layout`, `.StatusBar`, `.Overlay`, `.Settings`) for a fixed anatomy; when slots are used, Toolbar and Settings share one row. Default content for `.Settings` is `<WorkspaceSettingsTrigger />`; provide `openSettings` via `SettingsTriggerProvider` in your app so the gear opens the app settings sheet. Without slots, children render as-is (legacy).
- `WorkspaceHeader` - title bar with `.Left` / `.Center` / `.Right`.
- `WorkspaceToolbar` - toolbar with `.Left` / `.Center` / `.Right` and Menubar,
  Button, Group, ProjectSelect helpers.
- `WorkspaceReviewBar` - plan -> patch review UX.
- `WorkspaceStatusBar` - bottom status line.
- `WorkspaceOverlaySurface` - declarative modal/drawer surface.

## Docking + layout (rails and composable panels)

- **Rails** — Left, main, right, and bottom are **rails**; each rail can have one or more **panel tabs** (Dockview-level tabs). Content of each tab is one **WorkspacePanel** (or equivalent), which can be leaf content, inner tabs via `PanelTabs`, or (future) nested panels.
- **UI-first panel layout (recommended):** Compose **WorkspaceLayout.Left** / `.Main` / `.Right` / `.Bottom` slot children with **WorkspaceLayout.Panel** children. Pass `icon` as `React.ReactNode`. **Left**, **Main**, and **Right** accept an optional **`hideTabBar`** prop: when `true`, the Dockview tab bar for that rail is hidden (Cursor/VS Code style static rail, reclaims space). No store, no effects; panels are collected in render. **WorkspaceContextProvider**(editorId) provides `editorId` only; View menu and `useEditorPanelVisibility` use `EDITOR_PANEL_SPECS` for panel toggles.
- **Viewport:** The main area can be reserved for a **viewport** that hosts **viewport panels** (files via Monaco, markdown preview, graphs, etc.). Each viewport panel has its own tab and close; many open panels scroll. At the Dockview level the main slot may render a single panel whose content is the viewport container.
- **Shared panel content:** Shared panels (e.g. Chat) are implemented once; editors add an **WorkspaceLayout.Panel** with a **stable id** (e.g. `CHAT_PANEL_ID`). Visibility key: `panel.visible.{editorId}-{panelId}`. See decisions.md "Shared panel content and editor-scoped contributions."
- `WorkspaceLayout` - dockable panel layout. **Slot + Panel children** are canonical. Legacy config rails via `leftPanels`, `mainPanels`, `rightPanels`, `bottomPanels` remain for backward compatibility (deprecated). First panel in each array is placed on that side; rest are sibling tabs (`direction: 'within'`). When a rail’s panels array is omitted, legacy props apply: `left`, `main`, `right`, `rightInspector`+`rightSettings`, `bottom`. Declarative slots (`WorkspaceLayout.Left`, `.Main`, `.Right`, `.Bottom`) always override prop-based rail descriptors. Built on **Dockview** for drag-to-reorder, floating panels, and tab grouping. Layout is persisted to `localStorage['dockview-{layoutId}']` when `layoutId` is set. Use `ref.current.resetLayout()` to restore default. **WorkspaceRail**, **WorkspaceRailPanel**, **EditorLayout** are deprecated. (`DockLayout` is a deprecated alias.)
- `WorkspacePanel` - single panel (header, tabs, lock overlay, scroll). Use as the content for each rail panel tab. (`DockPanel` is a deprecated alias.)
- `PanelTabs` - tabs within an WorkspacePanel (e.g. Library: Graphs | Nodes).
- `ViewportMeta` - metadata wrapper for editor surfaces.

## Utilities

- `PanelSettings` - gear popover for per-panel settings.
- `usePanelLock` - lock state for AI patch application.
- `DockSidebar` - grid-embedded shadcn Sidebar wrapper.
- `WorkspaceButton` / `WorkspaceTooltip` - tooltip-friendly editor controls.

## Editor color context

Editor sections are **context-colored** by `WorkspaceShell`’s `domain` prop and `packages/shared/src/shared/styles/contexts.css`. The shell sets `data-domain` (e.g. `dialogue`, `forge`, `video`, `writer`, `ai`, `character`) so all descendants inherit:

- **`--context-accent`** — primary accent for borders, active tab, panel header, selected state. Use for section edges and list accents.
- **`--context-glow`** / **`--context-ring`** — focus and selection rings; `--ring` and `--primary` are aligned to context under `[data-domain]`.
- **`--sidebar-primary`** / **`--sidebar-ring`** — sidebar hover/active when inside a domain.

Optional `data-context-node-type` (e.g. on graph or panel) refines the accent (e.g. dialogue node types). **Context override:** Section primitives (e.g. `SectionHeader` in Studio) can accept an optional `context` prop that wraps the section in `data-domain={context}` so that section uses a different `--context-accent` without changing the whole editor; overridable by consumers. Prefer these tokens over ad-hoc colors; see `docs/design/01-styling-and-theming.mdx` (repo root).

## App menubar (Unreal-style)

The app tab row expects a **menubar**; put it in **WorkspaceApp.Tabs.Menubar**. Build menus with **createWorkspaceMenubarMenus({ file, view, edit?, state? })** so order is consistent (File, View, Edit, State). If **state** items are provided, they are merged into the **File** menu (after a separator) and the top-level State menu is omitted. Contribute the result via your app’s **useAppMenubarContribution(menus)**; the app merges editor menus with shared menus (e.g. Settings) and renders **WorkspaceMenubar** in the tab row. Studio is the single entrypoint; menus and editors use registries (WorkspaceMenubarContribution → menu registry, editor descriptor → editor registry). See decisions.md "Studio as single entrypoint and unified registry pattern".

**Extending the menubar:**

- **Shared (app-level) menus:** Built in the shell component that renders the unified menubar. To add a new shared menu or item, extend the merged menu array (e.g. add a menu object before/after Settings) or extend the hook that supplies shared items (e.g. `useAppSettingsMenuItems`) to return more `WorkspaceMenubarItem` entries.
- **Editor-contributed menus (declarative):** Each editor calls `useAppMenubarContribution(menubarMenus)` with an array of `WorkspaceMenubarMenu` (`id`, `label`, `items`). To add a new editor menu or item: in that editor, add an entry to the `menubarMenus` array (e.g. `{ id: 'tools', label: 'Tools', items: toolsMenuItems }`) or append to an existing menu’s `items` array. Types: `WorkspaceMenubarMenu`, `WorkspaceMenubarItem` from this package (see `toolbar/WorkspaceMenubar.tsx`).
- **New editor:** Use WorkspaceContextProvider + WorkspaceMenubarContribution + WorkspaceMenubarMenuSlot (or useAppMenubarContribution(menus)) with its File/View/State (or equivalent) menus; the app bar shows shared menus plus that editor’s menus when the editor is active. State items are folded into File by `createWorkspaceMenubarMenus`.

## Migration notes

**Workspace\*** UI components have been removed; **Editor\*** + WorkspaceLayout are the only shell. Types (Selection, InspectorSection, ToolbarGroup, OverlaySpec, etc.) live in `shared/workspace` and are consumed by Editor*; there is a single home for these types (no duplicates in editor).

## Example

**Declarative slots (recommended):** Use `WorkspaceLayout.Left` / `.Main` / `.Right` and `WorkspaceShell.Toolbar` / `.Layout` / `.StatusBar` so the layout is visible at a glance.

```tsx
import {
  WorkspaceShell,
  WorkspaceToolbar,
  WorkspaceLayout,
  WorkspacePanel,
  WorkspaceStatusBar,
} from '@forge/shared/components/workspace';
import { BookOpen, LayoutDashboard, ScanSearch } from 'lucide-react';

export function ExampleEditor() {
  return (
    <WorkspaceShell editorId="example" title="Example" domain="ai">
      <WorkspaceShell.Toolbar>
        <WorkspaceToolbar>
          <WorkspaceToolbar.Left>Toolbar</WorkspaceToolbar.Left>
        </WorkspaceToolbar>
      </WorkspaceShell.Toolbar>
      <WorkspaceShell.Layout>
        <WorkspaceLayout
          viewport={{ viewportId: 'example', viewportType: 'custom' }}
          layoutId="example"
        >
          <WorkspaceLayout.Left>
            <WorkspaceLayout.Panel id="left" title="Library" icon={<BookOpen size={14} />}>
              <WorkspacePanel panelId="left">Content</WorkspacePanel>
            </WorkspaceLayout.Panel>
          </WorkspaceLayout.Left>
          <WorkspaceLayout.Main>
            <WorkspaceLayout.Panel id="main" title="Main" icon={<LayoutDashboard size={14} />}>
              <WorkspacePanel panelId="main" scrollable={false}>Main</WorkspacePanel>
            </WorkspaceLayout.Panel>
          </WorkspaceLayout.Main>
          <WorkspaceLayout.Right>
            <WorkspaceLayout.Panel id="right" title="Inspector" icon={<ScanSearch size={14} />}>
              <WorkspacePanel panelId="right">Inspector</WorkspacePanel>
            </WorkspaceLayout.Panel>
          </WorkspaceLayout.Right>
        </WorkspaceLayout>
      </WorkspaceShell.Layout>
      <WorkspaceShell.StatusBar>Ready</WorkspaceShell.StatusBar>
    </WorkspaceShell>
  );
}
```

**Props / raw children (legacy):** You can still use `WorkspaceLayout` with `left=`, `main=`, `right=`, `bottom=` and `WorkspaceShell` with raw children. Slots are the recommended declarative API.

## Recommended editor scaffold (one blessed path)

Use this structure so placement is obvious and the app bar contract is satisfied:

1. **App level:** `WorkspaceApp` → `WorkspaceApp.Tabs` with **WorkspaceApp.Tabs.Menubar** (File, View, … + app Settings) and **WorkspaceApp.Tabs.Actions** (project switcher, editor tab buttons). Build menus with **createWorkspaceMenubarMenus({ file, view?, edit?, state? })** and contribute via your app’s `useAppMenubarContribution(menus)`.
2. **Editor level:** `WorkspaceShell` with slots: **.Toolbar** (WorkspaceToolbar), **.Layout** (WorkspaceLayout with .Left / .Main / .Right / .Bottom and WorkspacePanel), **.StatusBar** (WorkspaceStatusBar), **.Settings** (default: **WorkspaceSettingsTrigger**; provide `openSettings` via **SettingsTriggerProvider** in your app).
3. **Layout:** Prefer **WorkspaceLayout.Left / .Main / .Right / .Bottom** slot children over props.

Raw children and prop-based APIs remain supported but are legacy; slot-based usage is the recommended path. Dev-kit consumers should follow this scaffold.
