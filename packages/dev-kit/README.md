# Forge Dev Kit

Re-exports `@forge/shared`, `@forge/agent-engine`, and `@forge/ui` for building editors and apps that consume the Forge editor platform.

## Editor scaffold (recommended structure)

When building an editor, follow the **slot-first** structure so placement is obvious:

- **App level:** Use `EditorApp.Tabs.Menubar` for the menubar (File, View, …) and `EditorApp.Tabs.Actions` for project switcher and editor tab buttons. Build menus with **createEditorMenubarMenus({ file, view?, edit?, state?, settings?, help? })** and contribute them via your app’s menubar contribution hook.
- **Editor level:** Use `EditorShell` with slots: `.Toolbar`, `.Layout` (with **WorkspaceLayout** and **WorkspacePanel**), `.StatusBar`, and `.Settings`. Put **EditorSettingsTrigger** in `.Settings`; provide `openSettings` via **SettingsTriggerProvider** in your app so the gear opens the **app settings sheet** (one surface for all settings).
- **Layout:** Use **WorkspaceLayout.Left / .Main / .Right / .Bottom** slot children for the panel layout. The default bottom slot is **Assistant** (chat/assistant UI).

## Menu and placement (where to put things)

Use the shared compound builders so placement is consistent and obvious:

| Menu | Expected content | Components / builders |
|------|------------------|------------------------|
| **File** | New, Open, Save; **Switch project**; optional Open Recent | `EditorFileMenu.SwitchProject`, `.New`, `.Open`, `.Save`, `.Separator` |
| **View** | **Appearance** (theme, density); panel toggles | `EditorViewMenu.Appearance`, `EditorViewMenu.PanelToggle`, `.Separator` |
| **Edit** | Undo, Copy, Paste, Find, Replace | `EditorEditMenu.Undo`, `.Redo`, `.Cut`, `.Copy`, `.Paste`, `.Find`, `.Replace`, `.Separator` |
| **Settings** | **Open Settings** (opens the single settings sheet); user/account | `EditorSettingsMenu.OpenSettings`, `EditorSettingsMenu.User`, `.Separator` |
| **Help** | Welcome, Show Commands, About | `EditorHelpMenu.Welcome`, `EditorHelpMenu.ShowCommands`, `EditorHelpMenu.About`, `.Separator` |

**EditorMenubar** supports compound slots (`EditorMenubar.File`, `.View`, `.Edit`, `.Settings`, `.Help`) or the `menus` prop. **EditorShell.Settings** should render **EditorSettingsTrigger**, which opens the app settings sheet.

Full details, examples, and API are in **@forge/shared** → `packages/shared/src/shared/components/editor/README.md` (see "Recommended editor scaffold").
