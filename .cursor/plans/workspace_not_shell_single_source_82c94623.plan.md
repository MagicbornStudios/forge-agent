---
name: Workspace not Shell single source
overview: Rename WorkspaceShell to Workspace, drop editorId in favor of workspace id everywhere, make the workspace component the single source for id/label/descriptor, and document exports vs codegen (layouts, settings, menus) with examples and a pattern for generating more.
todos: []
isProject: false
---

# Workspace (not Shell) and single source for id/definitions

## What you're asking for

- **Drop the term "shell".** The root container is the workspace; call it **Workspace**, not WorkspaceShell.
- **Workspace component owns id and definitions.** The workspace (e.g. DialogueWorkspace) should hold id and label (and whatever the root needs); the shared root component should just be **Workspace** and take that from the component, not the other way around.
- **No triple declaration.** Right now we have (1) `WORKSPACE_ID` / `WORKSPACE_LABEL`, (2) `workspaceDescriptor` (id, label, icon, order for the registry), and (3) id/title/domain passed into the root. You want one source: the workspace component gives id and definitions; codegen and the registry and the root component all use that. **editorId is dropped**—use workspace id (e.g. `workspaceId`) and `data-workspace-id` everywhere.
- **Codegen from components.** Defaults, settings, layout—we get as much as possible from codegen from the components; static data only where we need it (e.g. layout restore).

## Current flow

- **Shared:** [WorkspaceShell.tsx](packages/shared/src/shared/components/workspace/WorkspaceShell.tsx) – root with `editorId`, `title`, `subtitle`, `domain`, `theme`, `density` and slots (`.Toolbar`, `.Layout`, `.StatusBar`, …). **editorId will be removed** in favor of workspace id and `data-workspace-id`.
- **Studio workspace (e.g. Dialogue):** Exports `WORKSPACE_ID`, `WORKSPACE_LABEL`, and `workspaceDescriptor` (id, label, summary, icon, order). [workspace-bootstrap.ts](apps/studio/lib/workspace-registry/workspace-bootstrap.ts) imports `workspaceDescriptor` and does `registerWorkspace({ ...dialogueDescriptor, component: DialogueWorkspace })`. The component then renders the root with id/label/domain repeated at the call site.
- **Codegen:** Reads `WORKSPACE_ID` and `WORKSPACE_LABEL` from the file for layout/specs. So codegen uses (1); registry uses (2); the root uses (3) with the same values typed again.

## Target model

- **One export from the workspace component** that carries id, label, and whatever the root and registry need (e.g. domain, summary, icon, order). That object is the single source; the shared **Workspace** (renamed from WorkspaceShell) accepts it and uses it for **data-workspace-id**, title, **data-domain**, etc. No `editorId`; use workspace id and `data-workspace-id` everywhere. No separate `WORKSPACE_ID` / `WORKSPACE_LABEL` unless they are the canonical definitions and the descriptor is built from them.
- **Naming:** Rename **WorkspaceShell** → **Workspace** everywhere (shared package, Studio usages, docs). Slots become `Workspace.Header`, `Workspace.Toolbar`, `Workspace.Layout`, etc. The file can stay `WorkspaceShell.tsx` for a while and export `Workspace`, or be renamed to `Workspace.tsx` for consistency.
- **WorkspaceLayout ≠ Workspace.** Workspace is the outer container (the “shell”); WorkspaceLayout is one possible layout inside it (one layout per workspace, but not the same concept). No naming change to WorkspaceLayout.

## 1. Rename WorkspaceShell → Workspace and drop editorId (shared + apps)

- **Shared:** In [WorkspaceShell.tsx](packages/shared/src/shared/components/workspace/WorkspaceShell.tsx): rename component and slot components to **Workspace** (e.g. `WorkspaceRoot`, `Workspace.Header`, `Workspace.Toolbar`, …). Rename `WorkspaceShellProps` → `WorkspaceProps`. **Remove `editorId`;** use **workspaceId** (or `id`) and set **data-workspace-id** on the root (not data-editor-id). Export `Workspace` and `WorkspaceProps`. Keep or rename file to `Workspace.tsx` and update [index.ts](packages/shared/src/shared/components/workspace/index.ts).
- **References:** Replace all `WorkspaceShell` / `WorkspaceShellProps` with `Workspace` / `WorkspaceProps`; replace `editorId` with `workspaceId` (or pass `descriptor` only). Update settings resolution, context APIs, and CSS selectors that use `data-editor-id` to **data-workspace-id**. Apply in shared (README, WorkspaceSettingsTrigger, etc.) and in [DialogueWorkspace](apps/studio/components/workspaces/DialogueWorkspace.tsx), [CharacterWorkspace](apps/studio/components/workspaces/CharacterWorkspace.tsx), [StrategyWorkspace](apps/studio/components/workspaces/StrategyWorkspace.tsx). Repo-studio does not use the shared Workspace (it uses WorkspaceLayout only), but any API that took editorId should take workspaceId.

## 2. Single source: descriptor on the workspace component

- **One descriptor export** from each workspace component that has at least `id`, `label`, and optionally `domain` (for `data-domain`), `summary`, `icon`, `order`. The registry already needs id, label, icon, order, component; the root needs id, label, domain. So the descriptor type (or a minimal “workspace meta” type used by the root) includes: `id`, `label`, `domain?` (default id), `summary?`, `icon`, `order?`.
- **Workspace (root) accepts descriptor:** Add a prop like `descriptor?: { id: string; label: string; domain?: string; ... }` (or reuse a shared type). When `descriptor` is passed, Workspace uses `descriptor.id` for **data-workspace-id** and for workspaceId in any APIs, `descriptor.label` for title, `descriptor.domain ?? descriptor.id` for `data-domain`. So in DialogueWorkspace we can do `<Workspace descriptor={workspaceDescriptor} subtitle={activeGraph?.title} ... />` and stop passing id/title/domain by hand. Still allow overriding (e.g. `title` overrides `descriptor.label` when present).
- **Define descriptor from one place:** In each workspace file, export a single object (e.g. `workspaceDescriptor`) that has `id`, `label`, `domain` (or omit and default to id), `summary`, `icon`, `order`. Remove the separate `WORKSPACE_ID` and `WORKSPACE_LABEL` constants; codegen will read `workspaceDescriptor.id` and `workspaceDescriptor.label` (or we keep `WORKSPACE_ID` / `WORKSPACE_LABEL` as the only exports and build `workspaceDescriptor` from them so codegen stays trivial). Recommendation: keep **WORKSPACE_ID** and **WORKSPACE_LABEL** as the canonical exports so codegen and layout extraction don’t need to parse a full object; then set `workspaceDescriptor = { id: WORKSPACE_ID, label: WORKSPACE_LABEL, domain: WORKSPACE_ID, summary: '...', icon, order }` so there’s still a single logical source (the two constants) and no duplicated string literals in the descriptor.

## 3. Exports and codegen: what we export vs what codegen generates

### 3.1 From the workspace component (source of truth)

**Hand-written in each workspace file:** **workspaceDescriptor** (or WORKSPACE_ID + WORKSPACE_LABEL with descriptor built from them). Example:

```ts
export const WORKSPACE_ID = 'dialogue' as const;
export const WORKSPACE_LABEL = 'Dialogue';
export const workspaceDescriptor = {
  id: WORKSPACE_ID,
  label: WORKSPACE_LABEL,
  domain: WORKSPACE_ID,
  summary: 'YarnSpinner dialogue graph editor (React Flow)',
  icon: MessageCircle,
  order: 0,
};
```

**WorkspaceLayout.Panel** usage in JSX (id, title, rail) is parsed by layout codegen; no separate export of panel list.

### 3.2 Layout codegen output

**Repo-studio** → [workspace-layout.generated.ts](apps/repo-studio/src/lib/app-shell/workspace-layout.generated.ts): types (`RepoPanelId`, `RepoWorkspacePanelSpec`, `RepoWorkspaceLayoutDefinition`), constants (`REPO_PANEL_IDS`, `REPO_WORKSPACE_LABELS`), functions (`getWorkspaceLayoutDefinition(workspaceId)`, `getWorkspaceLayoutId(workspaceId)`, `getWorkspacePanelSpecs(workspaceId)`, `sanitizeWorkspaceHiddenPanelIds`, `createEmptyWorkspaceHiddenPanelMap`).

**Studio** → [workspace-panels.generated.ts](apps/studio/lib/app-shell/workspace-panels.generated.ts): `WorkspacePanelSpec`, `WORKSPACE_PANEL_SPECS: Record<workspaceId, WorkspacePanelSpec[]>` (keys = workspace id; each value = array of `{ id, label, key }` with key e.g. `panel.visible.{workspaceId}-{panelId}`).

### 3.3 Settings codegen output

**Repo-studio** → [settings/generated/defaults.ts](apps/repo-studio/src/lib/settings/generated/defaults.ts): `REPO_SETTINGS_GENERATED_DEFAULTS` (nested: commands, panels, loops, assistant, env, platform, reviewQueue, etc.).

**Studio:** Generated or test-based defaults (e.g. `APP_DEFAULTS`, `VIEWPORT_DEFAULTS`, `getViewportDefaults(workspaceId, viewportId)`). Settings keys use **workspaceId**, not editorId.

### 3.4 Menu contributions

**Today:** Hand-written per-workspace menu factories ([menu-contributions.ts](apps/repo-studio/src/lib/app-shell/menu-contributions.ts)); **View Focus** items come from **getWorkspacePanelSpecs(workspaceId)** (generated). Panel list and labels from codegen; file/view extras hand-written.

**Future:** Declarative export (e.g. `WORKSPACE_MENU_EXTRAS`) per workspace could drive a codegen pass that emits a menu-contributions slice.

### 3.5 Workspace list / registry

Registry is populated at runtime from **workspaceDescriptor** + component. No codegen for the registry. Optional future: codegen could emit a typed workspace list from scanned descriptors.

---

## 4. How we'll generate more (pattern)

- **Input:** Workspace components export **WORKSPACE_ID** / **WORKSPACE_LABEL** (or **workspaceDescriptor**) and use **WorkspaceLayout.Panel** in JSX; optional colocated config (e.g. menu extras).
- **Codegen passes:** Each pass (layout, settings, future: menu extras, workspace list) reads those exports and/or parses JSX, then writes a **.generated.ts** with a fixed API.
- **Adding a new generated output:** (1) Define the source (new export or descriptor + config). (2) Add an extractor in forge-codegen. (3) Add an emitter that writes the new .generated.ts. (4) Wire into the app's codegen command and optionally check:codegen. Consumers import only from .generated.

## 5. AGENTS / docs

- Update [AGENTS.md](AGENTS.md) and shared workspace README / dev-kit: use "Workspace" (not WorkspaceShell), **workspaceId** (not editorId), **data-workspace-id** (not data-editor-id). State that the workspace component is the single source for id and definitions.

## Summary

- **Rename:** WorkspaceShell → Workspace; **drop editorId** → use **workspaceId** (or id) and **data-workspace-id** everywhere.
- **Single source:** One descriptor per workspace component; Workspace (root) and registry consume it; codegen reads id/label from component (or descriptor).
- **Exports:** Component exports descriptor (and optionally WORKSPACE_ID / WORKSPACE_LABEL). Layout codegen emits panel specs and layout definitions; settings codegen emits defaults; menu View Focus uses generated panel specs; file/view extras hand-written or future codegen.
- **Extending codegen:** New pass = new source + extractor + emitter + wire into codegen; consumers import from .generated only.

