# Workspace UI kit — Agent rules

## Owner

Workspace Platform Engineer: owns `packages/shared/src/shared/components/workspace` and shared workspace models.

## Surfaces (nomenclature)

Every workspace has the same places:

| Surface | Required | Purpose |
|---------|----------|---------|
| **Header** | yes | Project switcher, breadcrumbs, workspace switcher |
| **Toolbar** | yes | Primary actions for current workspace/editor |
| **Main** | yes | Primary editor surface (React Flow, Lexical, JointJS, Twick) |
| **Right** | optional | Selection-driven properties/details |
| **StatusBar** | yes | Saving, validation, selection summary |
| **Overlays** | n/a | Modals, drawers, popovers (declarative list) |
| **LeftPanel** | optional | Library, palette, navigator (graphs list, pages tree) |
| **BottomPanel** | optional | Timeline, logs, errors (slot, not a core concept) |

Use **left** / **main** / **right** / **bottom** in `WorkspaceLayoutGrid`.

## Design (shadcn + atomic)

Add components via: `npx shadcn@latest add <name>`. Use shadcn atoms from `apps/studio/components/ui/*` (Button, Separator, Card, ScrollArea, Dialog, DropdownMenu, Select, Sheet, Tabs, Popover, Menubar, etc.). Do not hand-roll equivalents.

## Slot composition

1. **WorkspaceShell** — Children: Header, Toolbar, LayoutGrid, StatusBar, OverlaySurface.
2. **WorkspaceHeader** — `WorkspaceHeader.Left`, `.Center`, `.Right` for composable sections.
3. **WorkspaceToolbar** — Either `groups: ToolbarGroup[]` (data-driven) or `Left`/`Center`/`Right` slots.
4. **WorkspaceLayoutGrid** — `left?`, `main`, `right?`, `bottom?`. Layout adapts.
5. **WorkspaceInspector** — Either `selection` + `sections: InspectorSection[]` (when/render) or `children`.
6. **WorkspaceOverlaySurface** — `overlays: OverlaySpec[]`, `activeOverlay`, `onDismiss`. No registry. Declare overlays in one place per workspace.
7. **WorkspaceEditor** — Required wrapper inside the main slot; always provide `editorId` + `editorType` metadata.

## Rules

- **Slots not refs**: No imperative toolbar or modal registry. Composition only.
- **Selection-first**: Inspector content keyed off shared `Selection` (entity / textRange / canvasObject).
- **No file scanning/generators**: Overlays are an explicit array in the workspace composition file.
- **No cross-domain imports**: Shared components should not import from app or domain code. Temporary exception: shared UI uses Studio shadcn atoms (`apps/studio/components/ui`) until we extract a shared atoms package. Do not expand this footprint.
- **Tooltips**: Use `WorkspaceButton`, `WorkspaceTab`, or `WorkspaceTooltip` when you need `tooltip` / `tooltipDisabled` props (typo alias: `tootlipDisabled`).
- **Themes**: `WorkspaceShell` accepts `theme` to override `data-theme` for a workspace. Omit to inherit app theme.
- **Toolbar standard**: Menubar (File/Edit/View), Project combobox, and Settings are expected in workspace toolbars.

## Anti-patterns

- Do not add a modal/overlay registry in shared UI.
- Do not assume every workspace has a timeline (use optional BottomPanel).
- Do not hardcode editor types in the shell; they live in the main slot.
