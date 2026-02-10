---
name: ""
overview: ""
todos: []
isProject: false
---

# Single settings surface and IDE-style menu standardization

## Goals

- **One settings surface**: Trigger in `EditorShell.Settings` and menubar "Open Settings" open the same **sheet** (multi-scope tabs). No "drawer" naming; the surface is a sheet.
- **Naming**: Nothing named "drawer" when it is a sheet. Rename component, context, and hooks to **AppSettingsSheet** / **OpenSettingsSheetContext** / **useOpenSettingsSheet**.
- **Remove workbench**: Drop the "workbench" label; rename to "Assistant" or "Chat" for the Dialogue bottom panel; document.
- **Standard placement via compound components**: File, View, Edit, Settings, Help are explicit **compound components** in shared editor so the dev-kit makes "where to put things" and what we expect obvious. Extend editor components so consumers use `EditorMenubar.File`, `EditorViewMenu.Appearance`, `EditorSettingsMenu.OpenSettings`, `EditorHelpMenu.Welcome`, etc.

---

## 1. Naming: Sheet, not drawer

**Rename everywhere (Studio + shared/docs):**

- **Component**: `SettingsDrawer` → `**AppSettingsSheet**` (file `SettingsDrawer.tsx` → `AppSettingsSheet.tsx`; implementation remains a Sheet, left side, tabbed).
- **Context**: `OpenSettingsDrawerContext` → `**OpenSettingsSheetContext**`; `OpenSettingsDrawerProvider` → `**OpenSettingsSheetProvider**`; `useOpenSettingsDrawer` → `**useOpenSettingsSheet**` (file `OpenSettingsDrawerContext.tsx` → `OpenSettingsSheetContext.tsx`).
- **AppShell and call sites**: `settingsDrawerOpen` → `appSettingsSheetOpen`; `setSettingsDrawerOpen` → `setAppSettingsSheetOpen`; `openSettingsDrawer` → `openAppSettingsSheet`; all imports and usages of SettingsDrawer/OpenSettingsDrawerContext/useOpenSettingsDrawer updated.
- **Docs**: README, dev-kit, and AGENTS.md say "trigger in EditorShell.Settings opens the **settings sheet**" (never "drawer").

No behavioral change; only names. The single surface stays one Sheet with App/User/Project/Editor/Viewport tabs.

---

## 2. Single settings surface (behavior)

- **Keep one surface**: The tabbed sheet (now `AppSettingsSheet`) is the only settings UI. Render it at AppShell root (e.g. sibling to `EditorApp` and `CreateListingSheet`), not inside `EditorApp.Tabs` actions, so it always shows when open.
- **Standardize trigger**: In all four editors (Dialogue, Character, Video, Strategy), replace `SettingsMenu` in `EditorShell.Settings` with `**EditorSettingsTrigger**`. Remove the per-editor dropdown that opened a separate single-scope sheet.
- **Remove duplicate surface**: Remove `**SettingsMenu**` (dropdown + single-scope sheet). Remove or repurpose `**SettingsSheet**` if it is only used by SettingsMenu (the tabbed surface has its own content).
- **Docs**: Shared editor README and dev-kit: "Trigger in EditorShell.Settings opens the app settings **sheet**; provide `openSettings` via SettingsTriggerProvider."

---

## 3. Workbench removal

- Rename Dialogue bottom panel/drawer to **"Assistant"** (or "Chat") in UI and in shared `DockLayout` default slot title. Remove the word "workbench" from user-facing strings and slot defaults.
- Document in shared AGENTS.md or editor README that the bottom slot is for assistant/chat in Dialogue.

---

## 4. New and extended editor components (thorough list)

All of the following live in `**packages/shared/src/shared/components/editor/**` (and `toolbar/` where applicable) so the dev-kit and Studio share the same contract. The goal is to make expected menu structure and placement obvious.

### 4.1 Extend EditorMenubar (compound slots)

- **Current**: `EditorMenubar` accepts `menus: EditorMenubarMenu[]` and renders them in array order.
- **Extend**: Support **compound composition** so the menubar can be built from named slots in a fixed order:
  - `**EditorMenubar.File**` — slot; children are menu items for the File menu.
  - `**EditorMenubar.View**` — slot for View menu.
  - `**EditorMenubar.Edit**` — slot for Edit menu.
  - `**EditorMenubar.Settings**` — slot for Settings menu (app-level).
  - `**EditorMenubar.Help**` — slot for Help menu.
- **Contract**: When `EditorMenubar` receives slot children, render in fixed order: File, View, Edit, State (if present), Settings, Help. Keep existing `menus` prop for backward compatibility (UnifiedMenubar can migrate to slots over time).
- **Files**: [EditorMenubar.tsx](packages/shared/src/shared/components/editor/toolbar/EditorMenubar.tsx); export slot components from [index.ts](packages/shared/src/shared/components/editor/index.ts).

### 4.2 EditorFileMenu (compound item components)

- **Current**: `EditorFileMenu` exists as a dropdown that takes `items: EditorFileMenuItem[]`.
- **Extend** so the File menu’s expected items are first-class compounds (for use inside `EditorMenubar.File` or when building `items`):
  - `**EditorFileMenu.SwitchProject**` — menu item "Switch project" (or "Open project…"); `onSelect` from context (e.g. `useOpenProjectSwitcher`) or props.
  - `**EditorFileMenu.New**` — item "New" (optional shortcut); `onSelect` prop.
  - `**EditorFileMenu.Open**` — item "Open…"; `onSelect` prop.
  - `**EditorFileMenu.Save**` — item "Save"; `onSelect` prop; optional shortcut.
  - `**EditorFileMenu.Separator**` — renders `MenubarSeparator`.
- **Usage**: Apps can compose File menu from these building blocks; "Switch project" is the standard way to expose project switcher from the File menu. Document in editor README and dev-kit.
- **Files**: [EditorFileMenu.tsx](packages/shared/src/shared/components/editor/toolbar/EditorFileMenu.tsx) — add static subcomponents; keep existing `items` API.

### 4.3 EditorViewMenu (new compound component)

- **New component**: `**EditorViewMenu**` with subcomponents that define the expected View menu structure:
  - `**EditorViewMenu.Appearance**` — section for theme and density (submenu or inline items). Can wrap theme/density from context or props (or a small hook `useViewAppearanceItems()` that returns `EditorMenubarItem[]`). Makes "View → Appearance" the standard place for theme/density.
  - `**EditorViewMenu.PanelToggle**` — single panel visibility toggle: `id`, `label`, `checked`, `onCheckedChange` (or context-based). Used for "Show Left Panel", "Show Right Panel", etc.
  - `**EditorViewMenu.Separator**` — separator.
- **Files**: New file `toolbar/EditorViewMenu.tsx`; export from editor index.

### 4.4 EditorEditMenu (new compound component)

- **New component**: `**EditorEditMenu**` with subcomponents for the expected Edit menu:
  - `**EditorEditMenu.Undo**` — item "Undo"; optional shortcut (e.g. Ctrl+Z); `onSelect` prop.
  - `**EditorEditMenu.Redo**` — item "Redo"; optional shortcut; `onSelect` prop.
  - `**EditorEditMenu.Separator**`
  - `**EditorEditMenu.Cut**`, `**EditorEditMenu.Copy**`, `**EditorEditMenu.Paste**` — standard clipboard items; `onSelect` and optional shortcuts.
  - `**EditorEditMenu.Find**`, `**EditorEditMenu.Replace**` — find/replace items; `onSelect` and optional shortcuts.
- **Purpose**: Makes Edit menu structure explicit in the dev-kit; apps compose from these or pass equivalent items.
- **Files**: New file `toolbar/EditorEditMenu.tsx`; export from editor index.

### 4.5 EditorSettingsMenu (new compound component)

- **New component**: `**EditorSettingsMenu**` with subcomponents for the Settings menu:
  - `**EditorSettingsMenu.OpenSettings**` — single item "Open Settings" that calls the app’s open-settings callback (from `useSettingsTrigger` or `useOpenSettingsSheet`). This is the standard way to open the single settings sheet from the menu.
  - `**EditorSettingsMenu.User**` — item for user/account (e.g. "Account", "Sign out"); `onSelect` or children for custom content.
  - `**EditorSettingsMenu.Separator**`
- **Purpose**: Settings menu is clearly "Open Settings" + user section; no ambiguity with a "drawer" or a second surface.
- **Files**: New file `toolbar/EditorSettingsMenu.tsx`; export from editor index.

### 4.6 EditorHelpMenu (new compound component)

- **New component**: `**EditorHelpMenu**` with subcomponents for the standard Help area:
  - `**EditorHelpMenu.Welcome**` — item "Welcome"; `onSelect` prop.
  - `**EditorHelpMenu.ShowCommands**` — item "Show All Commands"; optional shortcut (Ctrl+Shift+P); `onSelect` prop.
  - `**EditorHelpMenu.About**` — item "About"; `onSelect` prop.
  - `**EditorHelpMenu.Separator**`
- **Purpose**: Help menu is the standard "help area"; dev-kit documents these as the expected items.
- **Files**: New file `toolbar/EditorHelpMenu.tsx`; export from editor index.

### 4.7 createEditorMenubarMenus (extend)

- **Current**: Accepts `file`, `view`, `edit`, `state`, `extra`; order File, View, Edit, State.
- **Extend**: Add `**settings?**` and `**help?**` to options and to **STANDARD_ORDER** so built menus can be: File, View, Edit, State, Settings, Help. This aligns with the compound slots and makes it easy to pass app-level Settings and Help items without overloading `extra`.
- **File**: [createEditorMenubarMenus.ts](packages/shared/src/shared/components/editor/toolbar/createEditorMenubarMenus.ts).

---

## 5. AppShell / Studio wiring

- **Project switcher in File menu**: Add an app-level File menu item "Switch project" that triggers the same action as the project switcher (e.g. open its popover). Provide `openProjectSwitcher` (or equivalent) from AppShell via a small context; menu item uses it. Use `**EditorFileMenu.SwitchProject**` (or the item it yields) in the merged File menu.
- **View menu for theme**: Refactor **useAppSettingsMenuItems** (or add **useViewAppearanceItems**) so that **View** menu receives **Appearance** items (theme, density). Contribute View items via **EditorViewMenu.Appearance** or equivalent; Settings menu receives only "Open Settings", user, etc. **UnifiedMenubar** merges editor menus with app View (Appearance) and app Settings/Help.
- **Help menu**: Add Help menu with placeholder items using **EditorHelpMenu** compounds (Welcome, ShowCommands, About). Contribute via `createEditorMenubarMenus` `help` or via slot composition.
- **Single sheet**: Render **AppSettingsSheet** at root; "Open Settings" (from **EditorSettingsMenu.OpenSettings**) and **EditorSettingsTrigger** both call **useOpenSettingsSheet()**.

---

## 6. Dev-kit placement documentation

- In **packages/dev-kit** (README or a short "Menu and placement" section), document:
  - **File**: New, Open, Save; **Switch project** (use `EditorFileMenu.SwitchProject`); optional Open Recent.
  - **View**: **Appearance** (theme, density — use `EditorViewMenu.Appearance`); panel toggles (`EditorViewMenu.PanelToggle`).
  - **Edit**: Undo, Copy, Paste, Find, etc. (use `EditorEditMenu.*`).
  - **Settings**: **Open Settings** (use `EditorSettingsMenu.OpenSettings` — opens the single settings sheet); user/account (`EditorSettingsMenu.User`).
  - **Help**: Welcome, Show Commands, About (use `EditorHelpMenu.*`).
- Reference: `EditorMenubar` compound slots (File, View, Edit, Settings, Help) and `createEditorMenubarMenus({ file, view, edit, state, settings, help })`; **EditorShell.Settings** slot should render **EditorSettingsTrigger**, which opens the app settings **sheet**.

---

## 7. Agent strategy

- **Before**: Read [STATUS](docs/agent-artifacts/core/STATUS.md), [packages/shared AGENTS.md](packages/shared/src/shared/AGENTS.md), [errors-and-attempts](docs/agent-artifacts/core/errors-and-attempts.md) as needed.
- **After each slice**: Update STATUS (Ralph Wiggum Done), affected AGENTS.md/README; add errors-and-attempts note if we fix the sheet-not-opening bug.
- **Styling**: Follow [styling-and-ui-consistency](docs/agent-artifacts/core/styling-and-ui-consistency.md); no screenshot automation.
- **Scope**: All edits in repo (apps, packages, docs); no changes under `.tmp/`.

---

## Implementation order

1. **Naming (sheet not drawer)** — Rename SettingsDrawer → AppSettingsSheet, OpenSettingsDrawerContext → OpenSettingsSheetContext, useOpenSettingsDrawer → useOpenSettingsSheet; move sheet to root in AppShell; update all imports and docs.
2. **Single settings surface** — Replace SettingsMenu with EditorSettingsTrigger in all four editors; remove SettingsMenu and single-scope SettingsSheet usage; ensure one sheet opens from trigger and menubar.
3. **EditorMenubar compound slots** — Add EditorMenubar.File, .View, .Edit, .Settings, .Help; support slot-based composition with fixed order alongside existing `menus` prop.
4. **EditorFileMenu compounds** — Add EditorFileMenu.SwitchProject, .New, .Open, .Save, .Separator.
5. **EditorViewMenu** — New component with .Appearance, .PanelToggle, .Separator.
6. **EditorEditMenu** — New component with .Undo, .Redo, .Cut, .Copy, .Paste, .Find, .Replace, .Separator.
7. **EditorSettingsMenu** — New component with .OpenSettings, .User, .Separator.
8. **EditorHelpMenu** — New component with .Welcome, .ShowCommands, .About, .Separator.
9. **createEditorMenubarMenus** — Add `settings` and `help` to options and STANDARD_ORDER.
10. **Workbench** — Rename to Assistant/Chat in Dialogue and DockLayout; update docs.
11. **Studio wiring** — File menu "Switch project" (openProjectSwitcher + EditorFileMenu.SwitchProject); View menu Appearance (theme/density via EditorViewMenu.Appearance); Help menu (EditorHelpMenu.*); UnifiedMenubar uses new compounds or merged items.
12. **Dev-kit placement docs** — Add "Menu and placement" with the standard list and component references.

---

## Summary: components to create or extend


| Action | Component / name                                                                    | Location                                                |
| ------ | ----------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Rename | SettingsDrawer → **AppSettingsSheet**                                               | apps/studio/components/settings/                        |
| Rename | OpenSettingsDrawerContext → **OpenSettingsSheetContext** (and provider/hook)        | apps/studio/lib/contexts/                               |
| Extend | **EditorMenubar** + .File, .View, .Edit, .Settings, .Help (compound slots)          | packages/shared/.../toolbar/EditorMenubar.tsx           |
| Extend | **EditorFileMenu** + .SwitchProject, .New, .Open, .Save, .Separator                 | packages/shared/.../toolbar/EditorFileMenu.tsx          |
| New    | **EditorViewMenu** + .Appearance, .PanelToggle, .Separator                          | packages/shared/.../toolbar/EditorViewMenu.tsx          |
| New    | **EditorEditMenu** + .Undo, .Redo, .Cut, .Copy, .Paste, .Find, .Replace, .Separator | packages/shared/.../toolbar/EditorEditMenu.tsx          |
| New    | **EditorSettingsMenu** + .OpenSettings, .User, .Separator                           | packages/shared/.../toolbar/EditorSettingsMenu.tsx      |
| New    | **EditorHelpMenu** + .Welcome, .ShowCommands, .About, .Separator                    | packages/shared/.../toolbar/EditorHelpMenu.tsx          |
| Extend | **createEditorMenubarMenus** — add `settings`, `help`, STANDARD_ORDER               | packages/shared/.../toolbar/createEditorMenubarMenus.ts |


All new/updated editor components are in **packages/shared** so both Studio and dev-kit consumers see the same contract and placement expectations.