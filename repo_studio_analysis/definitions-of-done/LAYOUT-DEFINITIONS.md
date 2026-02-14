# Layout Definitions of Done

## Menu Contribution
- Menus built via createEditorMenubarMenus
- **Per-workspace contribution required**: each workspace registers its own menu items (File, View, Edit, etc.)
- Scoped by workspace (same as editor in main Studio)

## Settings
- Section/field registration model (Studio pattern)
- Backed by internal Payload + SQLite (not file-based config)
- Generated defaults; right sidebar authoritative

## Spec Codegen
- Command policy, view defaults generated and reloaded deterministically
- Migrate from config.json/local.overrides to Payload-backed where applicable

## Panel Visibility
- Uses `useRepoPanelVisibility` + `REPO_EDITOR_PANEL_SPECS`
- Persisted via Payload-backed settings (Phase A) or current zustand until migration
