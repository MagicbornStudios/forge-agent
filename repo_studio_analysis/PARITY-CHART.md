# Repo Studio Parity Chart

PRD features vs Repo Studio today vs Studio/editor alignment. Updated 2026-02. Phases A-D complete (05-08); Phase E (09) in progress.

| PRD Feature | Repo Studio Today | Studio/Editor Alignment | Gap | Phase |
|-------------|-------------------|-------------------------|-----|-------|
| Internal Payload + SQLite settings | payload.config.ts, SQLite in .repo-studio/data, repo-settings-overrides | Payload + settings-overrides | None | A |
| Settings registry (section/field) | registry.ts, RepoSettingsRegistrations, buildRepoSettingsDefaultsFromRegistry | settings-registry + AppSettingsRegistrations | None | A |
| Per-workspace menu contribution | buildRepoWorkspaceMenus, REPO_WORKSPACE_MENU_FACTORIES per workspace | createEditorMenubarMenus (central) | Low (central map; true mount/register optional) | B |
| Structured parsers | packages/repo-studio/src/core/parsers, Phase 07 | N/A | None | C |
| Story → Pages (content → Blocks) | publish-service.ts, apply/preview/queue routes, repo-pages/repo-blocks | pages + blocks collections exist | None | C |
| Electron desktop | Phase 08 delivered; packaging | N/A | None | D |
| API key auth (desktop) | Session only (web) | api-keys + requireAiRequestAuth | Medium | E |
| Verdaccio/npm publish | forge-repo-studio:package:publish; not in registry:forge:publish:local batch | ui/shared/etc. in registry:forge:publish:local | Low | B |
| UI definitions of done | styling-and-ui-consistency.md | styling-and-ui-consistency.md | Low | B |
| Layout parity | EditorDockLayout, settings sidebar | EditorDockLayout, full settings | None | A/B |
