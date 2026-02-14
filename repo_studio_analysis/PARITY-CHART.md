# Repo Studio Parity Chart

PRD features vs Repo Studio today vs Studio/editor alignment. Updated after analysis Round 2.

| PRD Feature | Repo Studio Today | Studio/Editor Alignment | Gap | Phase |
|-------------|-------------------|-------------------------|-----|-------|
| Internal Payload + SQLite settings | config.json + local.overrides | Payload + settings-overrides | High | A |
| Settings registry (section/field) | Hardcoded RepoSettingsPanelContent | settings-registry + AppSettingsRegistrations | High | A |
| Per-workspace menu contribution | Hardcoded menus in shell | createEditorMenubarMenus (central) | Medium | B |
| Structured parsers | Raw `<pre>` text | N/A | High | C |
| Story → Pages (content → Blocks) | Story saves to files only | pages + blocks collections exist | Medium | C |
| Electron desktop | None | N/A | High | D |
| API key auth (desktop) | Session only (web) | api-keys + requireAiRequestAuth | Medium | E |
| Verdaccio/npm publish | repo-studio not in script | ui/shared/etc. in registry:forge:publish:local | Low | B |
| UI definitions of done | Ad-hoc | styling-and-ui-consistency.md | Medium | B |
| Layout parity | EditorDockLayout, partial settings | EditorDockLayout, full settings | Partial | A/B |
