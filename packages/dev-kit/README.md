# Forge Dev Kit

Re-exports `@forge/shared`, `@forge/agent-engine`, and `@forge/ui` for building editors and apps that consume the Forge editor platform.

## Editor scaffold (recommended structure)

When building an editor, follow the **slot-first** structure so placement is obvious:

- **App level:** Use `WorkspaceApp.Tabs.Menubar` for the menubar (File, View, …) and `WorkspaceApp.Tabs.Actions` for project switcher and editor tab buttons. Build menus with **createWorkspaceMenubarMenus({ file, view?, edit?, state?, settings?, help? })** and contribute them via your app’s menubar contribution hook.
- **Editor level:** Use `WorkspaceShell` with slots: `.Toolbar`, `.Layout` (with **WorkspaceLayout** and **WorkspacePanel**), `.StatusBar`, and `.Settings`. Put **WorkspaceSettingsTrigger** in `.Settings`; provide `openSettings` via **SettingsTriggerProvider** in your app so the gear opens the **app settings sheet** (one surface for all settings).
- **Layout:** Use **WorkspaceLayout.Left / .Main / .Right / .Bottom** slot children for the panel layout. The default bottom slot is **Assistant** (chat/assistant UI).

## Menu and placement (where to put things)

Use the shared compound builders so placement is consistent and obvious:

| Menu | Expected content | Components / builders |
|------|------------------|------------------------|
| **File** | New, Open, Save; **Switch project**; optional Open Recent | `WorkspaceFileMenu.SwitchProject`, `.New`, `.Open`, `.Save`, `.Separator` |
| **View** | **Appearance** (theme, density); panel toggles | `WorkspaceViewMenu.Appearance`, `WorkspaceViewMenu.PanelToggle`, `.Separator` |
| **Edit** | Undo, Copy, Paste, Find, Replace | `WorkspaceEditMenu.Undo`, `.Redo`, `.Cut`, `.Copy`, `.Paste`, `.Find`, `.Replace`, `.Separator` |
| **Settings** | **Open Settings** (opens the single settings sheet); user/account | `WorkspaceSettingsMenu.OpenSettings`, `WorkspaceSettingsMenu.User`, `.Separator` |
| **Help** | Welcome, Show Commands, About | `WorkspaceHelpMenu.Welcome`, `WorkspaceHelpMenu.ShowCommands`, `WorkspaceHelpMenu.About`, `.Separator` |

**WorkspaceMenubar** supports compound slots (`WorkspaceMenubar.File`, `.View`, `.Edit`, `.Settings`, `.Help`) or the `menus` prop. **WorkspaceShell.Settings** should render **WorkspaceSettingsTrigger**, which opens the app settings sheet.

Full details, examples, and API are in **@forge/shared** → `packages/shared/src/shared/components/workspace/README.md` (see "Recommended editor scaffold").

## Codegen (workspace layout and settings)

Use **@forge/forge-codegen** so layout and settings defaults are generated from your components instead of hand-written. This keeps the View menu and panel visibility in sync with the UI.

**Component contract:** In each workspace root component, export **WORKSPACE_ID** and **WORKSPACE_LABEL** (string constants), and use **WorkspaceLayout.Panel** with literal **id** and **title** props for every panel. Codegen parses these and emits panel specs and (optionally) layout definitions.

**Setup:** Add `@forge/forge-codegen` as a devDependency. Add a **forge-codegen.config.mjs** in your app root that lists `workspaceFiles`, `layoutOutputPath`, `layoutFormat` (`'studio'` or `'repo-studio'`), and optionally `settingsRegistryPath` / `settingsOutputPath`. Run `pnpm run codegen` (e.g. `node node_modules/@forge/forge-codegen/cli.mjs all --config forge-codegen.config.mjs`) before dev and build. See **apps/repo-studio/forge-codegen.config.mjs** and **apps/studio/forge-codegen.config.mjs** for examples.

