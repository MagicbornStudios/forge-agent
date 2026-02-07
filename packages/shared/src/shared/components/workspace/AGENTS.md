# Workspace UI kit (legacy) - Agent rules

## Owner

Workspace Platform Engineer: owns `packages/shared/src/shared/components/workspace` and shared workspace models. This folder remains for backward compatibility; new work should target `components/editor`.

## Surfaces (nomenclature)

Every editor mode has the same places:

| Surface | Required | Purpose |
|---------|----------|---------|
| **Header** | yes | Project switcher, breadcrumbs, mode switcher |
| **Toolbar** | yes | Primary actions for current mode/editor |
| **Main** | yes | Primary editor surface (React Flow, Lexical, JointJS, Twick) |
| **Right** | optional | Selection-driven properties/details |
| **StatusBar** | yes | Saving, validation, selection summary |
| **Overlays** | n/a | Modals, drawers, popovers (declarative list) |
| **LeftPanel** | optional | Library, palette, navigator (graphs list, pages tree) |
| **BottomPanel** | optional | Drawer/workbench (e.g. console, timeline, logs). Slot is optional; state (open/closed) typically lives in app-shell store keyed by mode id. |

Use `left` / `main` / `right` / `bottom` in `DockLayout`.

## Design (shadcn + atomic)

Add components via: `npx shadcn@latest add <name>`. Use shadcn atoms from `packages/ui/src/components/ui/*` (Button, Separator, Card, ScrollArea, Dialog, DropdownMenu, Select, Sheet, Tabs, Popover, Menubar, etc.). Do not hand-roll equivalents.

## Slot composition (Editor)

1. **EditorShell** - Children: Header, Toolbar, DockLayout, StatusBar, OverlaySurface.
2. **ModeHeader** - `ModeHeader.Left`, `.Center`, `.Right` for composable sections.
3. **ModeToolbar** - Either `groups: ToolbarGroup[]` (data-driven) or `Left`/`Center`/`Right` slots.
4. **DockLayout** - `left?`, `main`, `right?`, `bottom?`. Layout adapts.
5. **WorkspaceInspector** - Either `selection` + `sections: InspectorSection[]` (when/render) or `children`.
6. **ModeOverlaySurface** - `overlays: OverlaySpec[]`, `activeOverlay`, `onDismiss`. No registry. Declare overlays in one place per mode.
7. **ViewportMeta** - Required wrapper inside the main slot; always provide `editorId` + `editorType` metadata (or set `viewport` on `DockLayout`).
8. **ModeReviewBar** - Optional. For plan-commit flows: place between Toolbar and DockLayout. Wire `visible` to `(isDirty && pendingFromPlan)`, `onRevert` to refetch/reset draft, `onAccept` to clear pending. State is owned by the domain/store; the bar is presentational only.

## Rules

- **Slots not refs**: No imperative toolbar or modal registry. Composition only.
- **Selection-first**: Inspector content keyed off shared `Selection` (entity / textRange / canvasObject).
- **No file scanning/generators**: Overlays are an explicit array in the mode composition file.
- **No cross-domain imports**: Shared components should not import from app or domain code. UI atoms come from `@forge/ui`.
- **Tooltips**: Use `EditorButton` or `EditorTooltip` when you need tooltip props.
- **Feature gates**: Use `FeatureGate` at the call site (toolbar or slot) to wrap gated controls. `EditorButton` does not accept gate props.
- **Themes**: `EditorShell` accepts `theme` to override `data-theme` for a mode. Omit to inherit app theme.
- **Toolbar standard**: Menubar (File/Edit/View), Project combobox, and Settings are expected in mode toolbars.
- **Sidebars**: Use `DockSidebar` (shadcn Sidebar wrapper) for embedded left/right panels. `PanelTabs` composes it for tabbed palettes.

## Anti-patterns

- Do not add a modal/overlay registry in shared UI.
- Do not assume every mode has a timeline (use optional BottomPanel).
- Do not hardcode editor types in the shell; they live in the main slot.
