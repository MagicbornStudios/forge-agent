# Editor Components (Shared)

Unreal-Engine-inspired editor UI primitives. This folder replaces the legacy
`components/workspace` hierarchy with **resizable, lockable panels**
and clearer naming.

## Core building blocks

- `EditorShell` - root container per editor. Sets `data-editor-id`, `data-domain`, and `data-theme`. Supports **declarative slots** (`.Header`, `.Toolbar`, `.Layout`, `.StatusBar`, `.Overlay`, `.Settings`) for a fixed anatomy; when slots are used, Toolbar and Settings share one row. Default content for `.Settings` is `<EditorSettingsTrigger />`; provide `openSettings` via `SettingsTriggerProvider` in your app so the gear opens the app settings sheet. Without slots, children render as-is (legacy).
- `EditorHeader` - title bar with `.Left` / `.Center` / `.Right`.
- `EditorToolbar` - toolbar with `.Left` / `.Center` / `.Right` and Menubar,
  Button, Group, ProjectSelect helpers.
- `EditorReviewBar` - plan -> patch review UX.
- `EditorStatusBar` - bottom status line.
- `EditorOverlaySurface` - declarative modal/drawer surface.

## Docking + layout (rails and composable panels)

- **Rails** — Left, main, right, and bottom are **rails**; each rail can have one or more **panel tabs** (Dockview-level tabs). Content of each tab is one **EditorDockPanel** (or equivalent), which can be leaf content, inner tabs via `PanelTabs`, or (future) nested panels.
- **Declarative panel registration (Studio):** Use **EditorLayoutProvider**(editorId) and **EditorRail**(side) + **EditorPanel**(id, title, iconKey) from shared; **EditorLayout** from Studio subscribes to the panel registry and renders **EditorDockLayout**. Panel visibility and View menu derive from the registry; visibility key is `panel.visible.{editorId}-{panelId}`. EditorRail and EditorPanel must be used inside EditorLayoutProvider.
- **Shared panel content:** Shared panels (e.g. Chat) are implemented once; editors that want the panel add an **EditorPanel** with a **stable id** (e.g. `CHAT_PANEL_ID`) and the same content component. Visibility and View menu derive from the panel registry; schema keys are `panel.visible.{editorId}-{panelId}`. See decisions.md "Shared panel content and editor-scoped contributions."
- `EditorDockLayout` - dockable panel layout. Use **config-driven rails** via `leftPanels`, `mainPanels`, `rightPanels`, `bottomPanels` (arrays of `RailPanelDescriptor`: `{ id, title, iconKey?, content }`). First panel in each array is placed on that side; rest are sibling tabs (`direction: 'within'`). When a rail’s panels array is omitted, legacy props apply: `left`, `main`, `right`, `rightInspector`+`rightSettings`, `bottom`. Declarative slots (`EditorDockLayout.Left`, `.Main`, `.Right`, `.Bottom`) or props; slot children override props. Built on **Dockview** for drag-to-reorder, floating panels, and tab grouping. Layout is persisted to `localStorage['dockview-{layoutId}']` when `layoutId` is set. Use a ref and call `ref.current.resetLayout()` to restore default panels. (`DockLayout` is a deprecated alias.)
- `EditorDockPanel` - single panel (header, tabs, lock overlay, scroll). Use as the content for each rail panel tab. (`DockPanel` is a deprecated alias.)
- `PanelTabs` - tabs within an EditorDockPanel (e.g. Library: Graphs | Nodes).
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

Optional `data-context-node-type` (e.g. on graph or panel) refines the accent (e.g. dialogue node types). **Context override:** Section primitives (e.g. `SectionHeader` in Studio) can accept an optional `context` prop that wraps the section in `data-domain={context}` so that section uses a different `--context-accent` without changing the whole editor; overridable by consumers. Prefer these tokens over ad-hoc colors; see `docs/design/01-styling-and-theming.mdx` (repo root).

## App menubar (Unreal-style)

The app tab row expects a **menubar**; put it in **EditorApp.Tabs.Menubar**. Build menus with **createEditorMenubarMenus({ file, view, edit?, state? })** so order is consistent (File, View, Edit, State). If **state** items are provided, they are merged into the **File** menu (after a separator) and the top-level State menu is omitted. Contribute the result via your app’s **useAppMenubarContribution(menus)**; the app merges editor menus with shared menus (e.g. Settings) and renders **EditorMenubar** in the tab row. Studio is the single entrypoint; menus and editors use registries (EditorMenubarContribution → menu registry, editor descriptor → editor registry). See decisions.md "Studio as single entrypoint and unified registry pattern".

**Extending the menubar:**

- **Shared (app-level) menus:** Built in the shell component that renders the unified menubar. To add a new shared menu or item, extend the merged menu array (e.g. add a menu object before/after Settings) or extend the hook that supplies shared items (e.g. `useAppSettingsMenuItems`) to return more `EditorMenubarItem` entries.
- **Editor-contributed menus (declarative):** Each editor calls `useAppMenubarContribution(menubarMenus)` with an array of `EditorMenubarMenu` (`id`, `label`, `items`). To add a new editor menu or item: in that editor, add an entry to the `menubarMenus` array (e.g. `{ id: 'tools', label: 'Tools', items: toolsMenuItems }`) or append to an existing menu’s `items` array. Types: `EditorMenubarMenu`, `EditorMenubarItem` from this package (see `toolbar/EditorMenubar.tsx`).
- **New editor:** Use EditorLayoutProvider + EditorMenubarContribution + EditorMenubarMenuSlot (or useAppMenubarContribution(menus)) with its File/View/State (or equivalent) menus; the app bar shows shared menus plus that editor’s menus when the editor is active. State items are folded into File by `createEditorMenubarMenus`.

## Migration notes

**Workspace\*** UI components have been removed; **Editor\*** + DockLayout are the only shell. Types (Selection, InspectorSection, ToolbarGroup, OverlaySpec, etc.) live in `shared/workspace` and are consumed by Editor*; there is a single home for these types (no duplicates in editor).

## Example

**Declarative slots (recommended):** Use `EditorDockLayout.Left` / `.Main` / `.Right` and `EditorShell.Toolbar` / `.Layout` / `.StatusBar` so the layout is visible at a glance.

```tsx
import {
  EditorShell,
  EditorToolbar,
  EditorDockLayout,
  EditorDockPanel,
  EditorStatusBar,
} from '@forge/shared/components/editor';

export function ExampleEditor() {
  return (
    <EditorShell editorId="example" title="Example" domain="ai">
      <EditorShell.Toolbar>
        <EditorToolbar>
          <EditorToolbar.Left>Toolbar</EditorToolbar.Left>
        </EditorToolbar>
      </EditorShell.Toolbar>
      <EditorShell.Layout>
        <EditorDockLayout
          viewport={{ viewportId: 'example', viewportType: 'custom' }}
          layoutId="example"
        >
          <EditorDockLayout.Left>
            <EditorDockPanel panelId="left" title="Library" />
          </EditorDockLayout.Left>
          <EditorDockLayout.Main>
            <EditorDockPanel panelId="main" scrollable={false}>Main</EditorDockPanel>
          </EditorDockLayout.Main>
          <EditorDockLayout.Right>
            <EditorDockPanel panelId="right" title="Inspector" />
          </EditorDockLayout.Right>
        </EditorDockLayout>
      </EditorShell.Layout>
      <EditorShell.StatusBar>Ready</EditorShell.StatusBar>
    </EditorShell>
  );
}
```

**Props / raw children (legacy):** You can still use `EditorDockLayout` with `left=`, `main=`, `right=`, `bottom=` and `EditorShell` with raw children. Slots are the recommended declarative API.

## Recommended editor scaffold (one blessed path)

Use this structure so placement is obvious and the app bar contract is satisfied:

1. **App level:** `EditorApp` → `EditorApp.Tabs` with **EditorApp.Tabs.Menubar** (File, View, … + app Settings) and **EditorApp.Tabs.Actions** (project switcher, editor tab buttons). Build menus with **createEditorMenubarMenus({ file, view?, edit?, state? })** and contribute via your app’s `useAppMenubarContribution(menus)`.
2. **Editor level:** `EditorShell` with slots: **.Toolbar** (EditorToolbar), **.Layout** (EditorDockLayout with .Left / .Main / .Right / .Bottom and EditorDockPanel), **.StatusBar** (EditorStatusBar), **.Settings** (default: **EditorSettingsTrigger**; provide `openSettings` via **SettingsTriggerProvider** in your app).
3. **Layout:** Prefer **EditorDockLayout.Left / .Main / .Right / .Bottom** slot children over props.

Raw children and prop-based APIs remain supported but are legacy; slot-based usage is the recommended path. Dev-kit consumers should follow this scaffold.
