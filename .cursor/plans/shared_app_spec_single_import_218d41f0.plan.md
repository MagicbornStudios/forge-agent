---
name: Shared app spec single import
overview: Unify codegen so both repo-studio and studio use the same canonical schema and a single generated file per app (app-spec) for workspaces, panels, layout definitions, and settings defaults—one import surface, high reusability. Builds on the prior Workspace/editorId plan.
todos: []
isProject: false
---

# Shared app spec and single import surface

This plan extends the [workspace-not-shell single-source plan](workspace_not_shell_single_source_82c94623): WorkspaceShell → Workspace, editorId → workspaceId/data-workspace-id, single descriptor per workspace component. Here we add: **one shared shape** for generated data and **one import surface** per studio app so layout, menu, settings, and shell all import from a single generated module.

---

## Goals

- **Same shape everywhere.** Repo-studio and studio both consume the same canonical types and structure: workspace list, panel specs (id, label, key, rail), layout definitions, settings defaults. No more `layoutFormat: 'repo-studio' | 'studio'` with different emitted types.
- **One import surface per app.** One generated file per app (e.g. `app-spec.generated.ts`) that exports workspaces, layout definitions (with panel specs), and settings defaults. All consumers import from this file only.
- **High reusability.** Shared schema lives in one place (e.g. `@forge/shared` or `@forge/forge-codegen`); codegen emits that shape; both apps use it. Adding a new studio app = same codegen + config.

---

## 1. Canonical schema (shared types)

Define the **single shape** that codegen emits and both apps consume. Place it in shared code so types are reusable:

- **Location:** New module in [packages/shared](packages/shared) (e.g. `shared/workspace/app-spec-types.ts`) or a minimal types surface in [packages/forge-codegen](packages/forge-codegen) that shared and apps depend on. Prefer shared so runtime code (e.g. WorkspaceLayout) can reference the same types.

**Types to define:**

- `PanelRail = 'left' | 'main' | 'right' | 'bottom'`
- `WorkspacePanelSpec = { id: string; label: string; key: string; rail: PanelRail }` — same for both apps; Studio currently omits rail in its generated type but the extractor already has it; include it in the shared shape so repo-studio keeps working and studio can ignore or use it later.
- `WorkspaceLayoutDefinition = { workspaceId: string; label: string; layoutId: string; mainAnchorPanelId: string; mainPanelIds: string[]; panelSpecs: WorkspacePanelSpec[] }`
- Optional: `WorkspaceDescriptor` (id, label, order?, summary?, etc.) for registry/bootstrap if we want it in the spec; otherwise apps keep importing descriptor from components and only use generated data for layout/settings.

**Generated file exports (single surface):**

- `WORKSPACE_IDS` — readonly array of workspace ids (replaces app-specific REPO_WORKSPACE_IDS or hand-maintained list).
- `WorkspaceId` — type derived from `WORKSPACE_IDS` (replaces RepoWorkspaceId / app-specific type).
- `WORKSPACE_LABELS: Record<WorkspaceId, string>`
- `LAYOUT_DEFINITIONS: Record<WorkspaceId, WorkspaceLayoutDefinition>` (or equivalent) — so every workspace has a layout definition with panelSpecs (including rail).
- Helpers: `getWorkspaceLayoutDefinition(workspaceId)`, `getWorkspacePanelSpecs(workspaceId)`, `getWorkspaceLayoutId(workspaceId)`, `sanitizeWorkspaceHiddenPanelIds(workspaceId, panelIds)`, `createEmptyWorkspaceHiddenPanelMap()` — same API for both apps.
- `SETTINGS_DEFAULTS` (or `APP_SETTINGS_DEFAULTS`) — the merged settings defaults object (today repo-studio has REPO_SETTINGS_GENERATED_DEFAULTS; studio would get the same shape from codegen).

So: one generated module = workspace ids + labels + layout definitions (with panel specs) + settings defaults + helpers. No separate workspace-layout.generated.ts and settings/generated/defaults.ts as different entry points; either one file that contains both, or one file that re-exports a single “app spec” object. Recommendation: **one file** `app-spec.generated.ts` that exports all of the above so “one import surface” is literal.

---

## 2. Single codegen emit path

- **Current state:** [emit-layout.mjs](packages/forge-codegen/lib/emit-layout.mjs) has two branches (`emitRepoStudioFormat`, `emitStudioFormat`) and two output shapes. Settings are emitted separately via [settings.mjs](packages/forge-codegen/lib/settings.mjs) to a different file.
- **Target:** One emit function (e.g. `emitAppSpec`) that:
  - Takes extracted layouts (from existing [extract-layout.mjs](packages/forge-codegen/lib/extract-layout.mjs)), settings (from registry + merge defaults), and config.
  - Builds the **canonical shape**: workspace ids, labels, layout definitions (each with panelSpecs that include id, label, key, rail). Panel key format is config-driven (e.g. `panelKeyFormat: 'panel.visible.{workspaceId}-{panelId}'` for studio, or `panelKeyPrefix: 'panel.visible.repo'` for repo-style global keys) but the **structure** (WorkspacePanelSpec with rail, WorkspaceLayoutDefinition) is the same.
  - Emits one TypeScript file that exports the shared types (or imports them from shared) and the app’s data + helpers.
- **Config (per app):** One config that supplies: `workspaceFiles`, `layoutIdPrefix`, `panelKeyFormat` or `panelKeyPrefix`, `settingsRegistryPath`, `settingsMergeDefaults`, `settingsExportName`, and **single** `appSpecOutputPath` (e.g. `src/lib/app-spec.generated.ts`). Remove `layoutFormat`; there is only one format.
- **Migration in forge-codegen:** Replace the two layout emit branches with `emitAppSpec`. Have it call the existing settings merge logic and embed settings defaults in the same emitted file (or keep settings in a separate generated file but re-export from app-spec so consumers still have one import surface—either way, “one import” means one module to import from). Update [cli.mjs](packages/forge-codegen/cli.mjs) to run one “app-spec” pass that does layout extract + settings load/merge + single emit.

---

## 3. One generated file per app, one import surface

- **Repo-studio:** Generate [apps/repo-studio/src/lib/app-spec.generated.ts](apps/repo-studio/src/lib/app-shell/workspace-layout.generated.ts) (or a new path like `src/lib/app-spec.generated.ts`) containing:
  - Imports of shared types (`WorkspacePanelSpec`, `WorkspaceLayoutDefinition`, `PanelRail`) from shared or from a small types barrel in codegen.
  - `WORKSPACE_IDS`, `WorkspaceId`, `WORKSPACE_LABELS`, layout definitions, helpers, and `SETTINGS_DEFAULTS` (or `REPO_SETTINGS_DEFAULTS` to keep naming if desired).
  - All existing consumers (store, menu-contributions, RepoStudioShell, settings hydration) switch to importing from this file only. Remove [workspace-layout.generated.ts](apps/repo-studio/src/lib/app-shell/workspace-layout.generated.ts) and [settings/generated/defaults.ts](apps/repo-studio/src/lib/settings/generated/defaults.ts) as separate entry points—either delete them and put their content into app-spec, or keep them as implementation detail and re-export from app-spec so the public surface is one module.
- **Studio:** Same. Generate `app-spec.generated.ts` (e.g. under [apps/studio/lib/app-shell/](apps/studio/lib/app-shell/) or `lib/app-spec.generated.ts`) with the **same shape**: WORKSPACE_IDS, WorkspaceId, WORKSPACE_LABELS, LAYOUT_DEFINITIONS (with panelSpecs including rail), helpers, SETTINGS_DEFAULTS. Remove or replace [workspace-panels.generated.ts](apps/studio/lib/app-shell/workspace-panels.generated.ts). Studio’s layout code and any settings code import from app-spec only. Studio’s panel key format stays per-workspace (`panel.visible.{workspaceId}-{panelId}`) via config; no change to behavior, only to where the data lives and that it uses the shared shape.
- **Extra panels / config:** Today Studio uses `extraPanels` in config for panels not in JSX (e.g. dialogue bottom). The single emit path should still support “extra panels” in config and merge them into the extracted panel list so the generated spec stays the single source of truth.

---

## 4. App-specific types (WorkspaceId) from generated

- Repo-studio today has [REPO_WORKSPACE_IDS and RepoWorkspaceId](apps/repo-studio/src/lib/types.ts) in a hand-maintained file. After this plan, `WORKSPACE_IDS` and `WorkspaceId` come from app-spec.generated.ts. Either:
  - Remove REPO_WORKSPACE_IDS/RepoWorkspaceId from types.ts and have the app use the generated WORKSPACE_IDS/WorkspaceId everywhere, or
  - Keep types.ts but have it re-export from app-spec.generated.ts for a transition period, then remove.
- Studio currently has no central WorkspaceId type; it uses string. After this plan, Studio also gets WORKSPACE_IDS and WorkspaceId from its app-spec.generated.ts, so both apps have the same pattern and the same shape.

---

## 5. Summary and relationship to prior plan

- **From the prior plan (unchanged):** Rename WorkspaceShell → Workspace; drop editorId → workspaceId and data-workspace-id; single descriptor per workspace component; codegen reads WORKSPACE_ID/WORKSPACE_LABEL (or descriptor) and WorkspaceLayout.Panel from components.
- **This plan adds:**
  - **Shared canonical schema:** PanelRail, WorkspacePanelSpec (id, label, key, rail), WorkspaceLayoutDefinition, plus workspace ids/labels and settings defaults, defined once and used by both apps.
  - **Single codegen path:** One emit function producing that shape; config only for file paths, panel key format/prefix, and settings merge. No layoutFormat split.
  - **One import surface per app:** One generated file (app-spec.generated.ts) per app exporting workspaces, layout definitions, panel specs, settings defaults, and helpers. Layout, menu, settings, and shell all import from that file. No hunting across workspace-layout.generated.ts vs workspace-panels.generated.ts vs settings/generated/defaults.ts.

**Concrete steps (for implementation):**

1. Add shared types (PanelRail, WorkspacePanelSpec, WorkspaceLayoutDefinition) in shared or forge-codegen; export from a single barrel.
2. Implement `emitAppSpec(layouts, settings, config)` in forge-codegen that outputs one file with the canonical shape and helpers; support panelKeyFormat/panelKeyPrefix and extraPanels in config.
3. Change repo-studio and studio configs to use a single appSpecOutputPath and remove layoutFormat; run one “app-spec” codegen pass that does layout extract + settings + single emit.
4. Repo-studio: point all consumers to app-spec.generated.ts; remove or re-export from old workspace-layout and settings defaults paths; align REPO_WORKSPACE_IDS/RepoWorkspaceId with generated WORKSPACE_IDS/WorkspaceId.
5. Studio: generate app-spec.generated.ts with same shape; point consumers to it; remove or replace workspace-panels.generated.ts; add settings to the spec if not already present.
6. Update AGENTS/docs: one generated app spec per studio app, shared shape, single import surface; reference the Workspace/workspaceId plan for component-level single source.

