---
name: Studio app spec repeatable pattern
overview: After Codex completes Viewport-As-Canvas, unify all studio apps (repo-studio, studio, consumer-studio) on a single canonical app spec and one import surface, with a repeatable pattern for viewports, layout metadata, and pinned panels. Builds on shared app spec and workspace-not-shell plans.
todos: []
isProject: false
---

# Studio app spec: repeatable pattern for all studio apps (including consumer)

This plan runs **after Codex finishes** the [Repo Studio Viewport-As-Canvas Hard Cut](user-provided summary below). It unifies **repo-studio, studio, and consumer-studio** on the same generated shape and one import surface, with a **repeatable structure** so any app built with our components (viewports, WorkspaceLayout, etc.) gets the same codegen and consumption pattern.

---

## Prerequisite: Codex Viewport-As-Canvas work (must be done first)

Codex is implementing:

- **WorkspaceLayout.Main** `hideTabBar` in shared (already present in [WorkspaceLayout.tsx](packages/shared/src/shared/components/workspace/WorkspaceLayout.tsx)); apply it in Planning, Code, Story workspaces so the center canvas has no outer dock tab.
- **WorkspaceViewportProps** in repo-studio [WorkspaceViewport.tsx](apps/repo-studio/src/components/viewport/WorkspaceViewport.tsx): `allowEmpty`, `emptyState`, `onBeforeCloseTab` (already present); Story uses them for closable page tabs and dirty-draft protection.
- **Viewport always visible:** repo-studio shell/store enforces viewport as non-toggleable ([store.ts](apps/repo-studio/src/lib/app-shell/store.ts) uses `PINNED_WORKSPACE_PANEL_IDS = ['viewport']` in sanitization and setPanelVisible). View menu and Settings panel toggles must not offer hide viewport.
- **Story workspace:** left rail = Story explorer/tools (outline, create, publish); center = closable page tabs (allowEmpty, empty state, per-loop persistence, onBeforeCloseTab for dirty close). [StoryWorkspace.tsx](apps/repo-studio/src/components/workspaces/StoryWorkspace.tsx) already has left `id="story"`, main viewport, right assistant; codegen must reflect that topology in [workspace-layout.generated.ts](apps/repo-studio/src/lib/app-shell/workspace-layout.generated.ts).
- **Docs/artifacts:** errors-and-attempts.md and STATUS.md updated for viewport-as-canvas expectation.

**We do not duplicate that work.** This plan assumes it is complete and then adds: shared app spec, single import surface, consumer-studio, and repeatable pattern.

---

## Goals

- **Same shape and one import surface** for repo-studio, studio, and **consumer-studio**. One generated file per app (`app-spec.generated.ts`) with workspaces, layout definitions (panel specs + rail), settings defaults, and helpers. All layout, menu, settings, and shell code import from that file only. (See [shared app spec plan](.cursor/plans/shared_app_spec_single_import_218d41f0.plan.md).)
- **Repeatable pattern and structure:** Every studio app has the same contract: workspace components (WORKSPACE_ID, WORKSPACE_LABEL, WorkspaceLayout.Panel) + forge-codegen.config + one codegen pass + one generated file. Viewports and layout metadata (rails, mainAnchorPanelId, panelSpecs) are part of that shape; viewport “always visible” is driven by generated data (pinned panels) so the pattern works for any app.
- **Consumer studio** uses the same pattern: add a workspace component (or keep a single minimal one), add config, run codegen, import from app-spec. No special-casing.

---

## 1. Canonical schema (shared types + viewport/pinned)

Extend the shared app spec schema so viewport semantics are **data-driven** and repeatable.

**Types (in [packages/shared](packages/shared) or [packages/forge-codegen](packages/forge-codegen)):**

- `PanelRail`, `WorkspacePanelSpec` (id, label, key, rail), `WorkspaceLayoutDefinition` (workspaceId, label, layoutId, mainAnchorPanelId, mainPanelIds, panelSpecs) — as in the [shared app spec plan](.cursor/plans/shared_app_spec_single_import_218d41f0.plan.md).

**Add for viewport / VSCode-like behavior:**

- **Pinned (non-toggleable) panels:** In the generated file, export `PINNED_PANEL_IDS: readonly string[]` (e.g. `['viewport']` for repo-studio when viewport is the center canvas). Config option: `pinnedPanelIds?: string[]` in forge-codegen.config; codegen emits it. Shell/store use it when sanitizing hidden panels and when handling setPanelVisible so pinned panels are never hidden. Consumer-studio can set `pinnedPanelIds: []` or omit; repo-studio sets `['viewport']`. Same code path, different data.

**Generated file exports (single surface, unchanged plus pinned):**

- `WORKSPACE_IDS`, `WorkspaceId`, `WORKSPACE_LABELS`, `LAYOUT_DEFINITIONS`, helpers (`getWorkspaceLayoutDefinition`, `getWorkspacePanelSpecs`, `getWorkspaceLayoutId`, `sanitizeWorkspaceHiddenPanelIds`, `createEmptyWorkspaceHiddenPanelMap`), `SETTINGS_DEFAULTS`.
- **New:** `PINNED_PANEL_IDS` (from config). Repo-studio store (and menu/settings logic) import this instead of hardcoding `new Set(['viewport'])`.

---

## 2. Single codegen pass and config shape

- **One emit:** `emitAppSpec(layouts, settings, config)` in [packages/forge-codegen](packages/forge-codegen) producing one file. No `layoutFormat`; one shape only. (Details in [shared app spec plan](.cursor/plans/shared_app_spec_single_import_218d41f0.plan.md).)
- **Config (per app):** `workspaceFiles`, `appSpecOutputPath`, `layoutIdPrefix`, `panelKeyFormat` or `panelKeyPrefix`, optional `settingsRegistryPath` / `settingsMergeDefaults` / `settingsExportName`, optional `**pinnedPanelIds**` (string[]), optional `extraPanels`. Same config shape for repo-studio, studio, consumer-studio; only values differ.

---

## 3. Repo-studio and Studio (platform)

- **Repo-studio:** After Codex viewport work, codegen already emits Story with left story, main viewport, right assistant. Switch to single app-spec output: one `app-spec.generated.ts` with WORKSPACE_IDS, layout definitions, helpers, SETTINGS_DEFAULTS, and **PINNED_PANEL_IDS = ['viewport']**. All consumers (store, menu-contributions, RepoStudioShell, settings) import from this file. Remove or re-export from workspace-layout.generated.ts and settings/generated/defaults.ts. Store uses generated `PINNED_PANEL_IDS` instead of hardcoded set.
- **Studio (platform):** Same. Generate app-spec.generated.ts with same shape (panelSpecs include rail); optional pinned panels if needed. Replace workspace-panels.generated.ts; settings in spec. One import surface.

---

## 4. Consumer-studio: same pattern

- **Today:** [apps/consumer-studio](apps/consumer-studio) has a single page with WorkspaceShell + WorkspaceLayout (one panel, assistant). No codegen; no shared app spec.
- **Target:** Consumer-studio is a first-class studio app with the same pattern:
  - **Workspace component:** Either extract a small `ConsumerStudioWorkspace.tsx` (or keep a single logical workspace in the page) that exports `WORKSPACE_ID`, `WORKSPACE_LABEL` and uses `WorkspaceLayout.Main` + `WorkspaceLayout.Panel` (e.g. id="assistant-chat", title="Assistant"). This allows the extractor to run.
  - **Config:** Add `forge-codegen.config.mjs` with `workspaceFiles` (one entry), `appSpecOutputPath` (e.g. `lib/app-spec.generated.ts`), `layoutIdPrefix: 'consumer-studio'`, `panelKeyFormat: 'panel.visible.{workspaceId}-{panelId}'`, no settings registry or minimal merge, no `pinnedPanelIds` (or empty).
  - **Codegen:** Run `pnpm --filter @forge/consumer-studio-app run codegen` (add script); output is one app-spec.generated.ts with WORKSPACE_IDS, LAYOUT_DEFINITIONS, helpers, SETTINGS_DEFAULTS, PINNED_PANEL_IDS.
  - **Consumption:** Refactor [app/page.tsx](apps/consumer-studio/app/page.tsx) (or shell) to import WORKSPACE_IDS, getWorkspaceLayoutDefinition, getWorkspacePanelSpecs from app-spec.generated.ts. Use Workspace (from workspace-not-shell plan) with descriptor; layoutId from generated. No behavioral change; same UI, but structure and imports align with repo-studio and studio.

This makes “add a new studio app” a copy of this pattern: workspace component(s) + config + codegen + import from app-spec.

---

## 5. Repeatable pattern: structure and docs

**Standard structure for any studio app:**

1. **Workspace components** under `components/workspaces/` (or equivalent): each exports `WORKSPACE_ID`, `WORKSPACE_LABEL` and uses `WorkspaceLayout` slots + `WorkspaceLayout.Panel` (id, title, rail from slot). Viewport workspaces use `WorkspaceLayout.Main hideTabBar` and a viewport component in the main slot; panel id="viewport" is the canvas panel.
2. **Config:** `forge-codegen.config.mjs` at app root with `workspaceFiles`, `appSpecOutputPath`, `layoutIdPrefix`, panel key format, optional settings and `pinnedPanelIds`.
3. **Codegen:** One command (e.g. `pnpm run codegen`) runs layout extract + settings merge + `emitAppSpec` → single `app-spec.generated.ts`.
4. **Consumption:** Shell, store, menu, settings import only from `app-spec.generated.ts` (WORKSPACE_IDS, WorkspaceId, getWorkspaceLayoutDefinition, getWorkspacePanelSpecs, sanitizeWorkspaceHiddenPanelIds, SETTINGS_DEFAULTS, PINNED_PANEL_IDS). No hand-maintained workspace id lists or layout tables.

**Viewports and layout metadata:**

- Layout definitions include rail and mainAnchorPanelId; viewport-as-canvas workspaces have a main panel id (e.g. "viewport") that can be marked as pinned via `pinnedPanelIds` in config so the shell never hides it. Codegen emits PINNED_PANEL_IDS; shell/store use it. No app-specific branches for “is this repo-studio?”; only data.

**Documentation:**

- Add or update a doc (e.g. in [docs/how-to](docs/how-to) or [packages/shared](packages/shared) workspace README): “Studio apps and app spec.” Describe the repeatable pattern, config options, and “Adding a new studio app” (copy workspace + config, run codegen, wire shell). Reference viewport semantics (hideTabBar, pinned panels) and the Viewport-As-Canvas behavior. Update [AGENTS.md](AGENTS.md) and [docs/agent-artifacts/core/STATUS.md](docs/agent-artifacts/core/STATUS.md) so agents know: one app spec per studio app, same shape, consumer-studio included.

---

## 6. Execution order and guardrails

**Order:**

1. **Codex** completes Viewport-As-Canvas (Story explorer + page tabs, hideTabBar on Main for viewport workspaces, viewport always visible, codegen updated for Story topology, docs/artifacts).
2. **Then** execute this plan: shared types (including PINNED_PANEL_IDS), single emitAppSpec, repo-studio and studio migrated to app-spec.generated.ts, consumer-studio given config + codegen + app-spec imports, store/menu/shell using generated pinned list, docs updated.

**Guardrails (after implementation):**

- Run codegen for repo-studio, studio, consumer-studio and confirm one file per app with same export shape.
- Run `check:codegen` (or equivalent) for each app.
- Run existing tests (e.g. repo-studio shell layout definition tests, viewport tests); add or adjust tests for sanitization using PINNED_PANEL_IDS from spec.
- Run `pnpm guard:workspace-semantics`, `pnpm hydration:doctor`, and app builds.

---

## 7. Summary

- **Prerequisite:** Codex Viewport-As-Canvas done (viewport-as-canvas, Story explorer + closable page tabs, viewport non-toggleable, layout codegen for Story).
- **This plan:** One canonical app spec (same shape) and one import surface for **repo-studio, studio, and consumer-studio**; optional **PINNED_PANEL_IDS** in generated file for viewport-always-visible; single codegen pass and config shape; consumer-studio brought into the same pattern; repeatable structure and “adding a new studio app” documented; execution after Codex, with guardrails and tests.

