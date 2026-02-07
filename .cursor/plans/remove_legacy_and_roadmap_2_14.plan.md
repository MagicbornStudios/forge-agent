---
name: ""
overview: ""
todos: []
isProject: false
---

# Remove legacy/deprecated code and update roadmap for 2/14

## Execution approach (agent artifacts and codebase strategy)

Follow the **Ralph Wiggum loop** and artifact discipline so changes stay consistent and we avoid repeated mistakes.

**Before starting**

- Read [docs/agent-artifacts/core/STATUS.md](docs/agent-artifacts/core/STATUS.md) and [docs/18-agent-artifacts-index.mdx](docs/18-agent-artifacts-index.mdx) for current state.
- Read root [AGENTS.md](AGENTS.md) and [packages/shared/src/shared/AGENTS.md](packages/shared/src/shared/AGENTS.md) (and workspace [AGENTS.md](packages/shared/src/shared/components/workspace/AGENTS.md)) when touching editor/workspace code.
- Check [docs/agent-artifacts/core/errors-and-attempts.md](docs/agent-artifacts/core/errors-and-attempts.md) before retrying any failed pattern (e.g. imports, re-exports, layout).
- Use **rg** (ripgrep) and **Read** to locate every use of deprecated names/fields; use **list_dir** where needed. Prefer these over ad-hoc grep/cat (see [tool-usage.md](docs/agent-artifacts/core/tool-usage.md)).

**During execution**

- Work in **vertical slices**: one coherent change (e.g. "single DockLayout") then update STATUS and affected docs. Do not mix unrelated renames in one commit.
- **Scope all edits to our codebase.** Do **not** edit anything under `.tmp/` or other agent-download directories (see .gitignore and codebase strategy below).
- After each slice: update STATUS (Ralph Wiggum Done list), and any AGENTS.md or artifact that the change affects (e.g. editor README, 05-editor-platform.mdx).

**Search discipline**

- Before removing a symbol: `rg "SymbolName" apps packages docs` (exclude `.tmp` in practice by not opening .tmp paths). Update every call site; then remove the definition.
- For viewport/editor renames: rg for `editorId`, `editorType`, `editorScope`, `viewportId`, `viewportType`, `viewportScope`, `data-editor-`, `data-mode-id` in apps, packages/shared, packages/types; update types first, then components, then docs.

---

## 1. .gitignore and agent-download directories

**Goal:** Ignore `.tmp` and any similar directories used by agents to download external repos/components. Our version control and edits apply only to our codebase.

- **.gitignore** ([.gitignore](.gitignore)): Add a clear section, e.g.:
  - `# Agent / tooling – downloaded reference material (do not track or edit)`
  - `.tmp/`
  - Optionally: a short comment that agents use `.tmp` to pull entire repos or components for reference.
- If we later add other download/cache dirs (e.g. `.agent-cache/`, `reference/`), add them here and document in codebase strategy.

---

## 2. Codebase strategy: .tmp and “do not edit”

**Goal:** Agents and humans know that `.tmp` is not our code; no edits or refactors there.

- **Root AGENTS.md** ([AGENTS.md](AGENTS.md)): Add a short subsection, e.g. **Scoped edits / .tmp**:
  - The `.tmp/` directory (and any path listed in .gitignore as agent-download/reference) is used by agents to download entire repos or component trees for reference. Do **not** edit, refactor, or lint files under `.tmp/`. It is not part of our codebase; search and code changes apply to `apps/`, `packages/`, `docs/`, and root config only.
- **19-coding-agent-strategy.mdx** ([docs/19-coding-agent-strategy.mdx](docs/19-coding-agent-strategy.mdx)): In “How agents are expected to use them” or a new “Scope of edits” bullet, add: When implementing a slice, scope all file edits to the repo (apps, packages, docs). Do not modify files under `.tmp/` or other agent-download directories; they are reference material, not our code.
- **tool-usage.md** ([docs/agent-artifacts/core/tool-usage.md](docs/agent-artifacts/core/tool-usage.md)): Add a one-liner under Principles: “Search and edit only within the repo (e.g. apps, packages, docs). Exclude `.tmp/` and other agent-download paths; they are not our code.”

---

## 3. Single layout primitive (DockLayout = Dockview)

**Goal:** One canonical `DockLayout` backed by Dockview; remove the react-resizable-panels-based implementation.

- **CodebaseAgentStrategyEditor** ([packages/shared/src/shared/components/assistant-ui/CodebaseAgentStrategyEditor.tsx](packages/shared/src/shared/components/assistant-ui/CodebaseAgentStrategyEditor.tsx)): Switch from `DockLayout` to the Dockview-based layout. Use the same slot API and `viewport={{ viewportId: 'strategy-chat', viewportType: 'assistant-ui' }}` (no deprecated `editorId`/`editorType`).
- **Replace and rename:** In [packages/shared/src/shared/components/editor/](packages/shared/src/shared/components/editor/):
  - Replace the contents of [DockLayout.tsx](packages/shared/src/shared/components/editor/DockLayout.tsx) with the current DockLayoutV2 implementation (Dockview + slot API + persistence). Keep the name `DockLayout` and types `DockLayoutProps`, `DockLayoutViewport`.
  - Delete [DockLayoutV2.tsx](packages/shared/src/shared/components/editor/DockLayoutV2.tsx).
  - In [index.ts](packages/shared/src/shared/components/editor/index.ts): remove exports for `DockLayoutV2` and `DockLayoutV2Props`; keep single `DockLayout` export.
- **Studio:** Update [DialogueEditor.tsx](apps/studio/components/editors/DialogueEditor.tsx), [VideoEditor.tsx](apps/studio/components/editors/VideoEditor.tsx), [CharacterEditor.tsx](apps/studio/components/editors/CharacterEditor.tsx): change `DockLayoutV2` import and usage to `DockLayout` (same API).
- **Docs:** Replace all mentions of "DockLayoutV2" or "legacy DockLayout" with "DockLayout" (Dockview-based). See section 8.

---

## 4. Remove deprecated Mode* aliases (editor components)

**Goal:** No deprecated re-exports; callers use Editor* names.

- **Consumer example** ([examples/consumer/app/page.tsx](examples/consumer/app/page.tsx)): Switch to `EditorHeader`, `EditorToolbar`, `EditorStatusBar` (from `@forge/dev-kit` or shared).
- **Shared editor index** ([packages/shared/src/shared/components/editor/index.ts](packages/shared/src/shared/components/editor/index.ts)): Remove the entire "Deprecated aliases (Mode*)" block.
- *Delete Mode files:** Remove [ModeHeader.tsx](packages/shared/src/shared/components/editor/ModeHeader.tsx), [ModeToolbar.tsx](packages/shared/src/shared/components/editor/ModeToolbar.tsx), [ModeStatusBar.tsx](packages/shared/src/shared/components/editor/ModeStatusBar.tsx), [ModeReviewBar.tsx](packages/shared/src/shared/components/editor/ModeReviewBar.tsx), [ModeOverlaySurface.tsx](packages/shared/src/shared/components/editor/ModeOverlaySurface.tsx).
- **Docs:** Update [05-editor-platform.mdx](docs/architecture/05-editor-platform.mdx) table: remove row for "Mode*.tsx | Deprecated aliases".

---

## 5. Remove deprecated editor/mode name aliases (studio)

**Goal:** No DialogueMode / VideoMode / CharacterMode / StrategyMode aliases.

- **Studio editors index** ([apps/studio/components/editors/index.ts](apps/studio/components/editors/index.ts)): Remove the four deprecated exports (`DialogueEditor as DialogueMode`, etc.).
- **Delete mode re-export files:** [apps/studio/components/modes/DialogueMode.tsx](apps/studio/components/modes/DialogueMode.tsx), [VideoMode.tsx](apps/studio/components/modes/VideoMode.tsx), [CharacterMode.tsx](apps/studio/components/modes/CharacterMode.tsx), [StrategyMode.tsx](apps/studio/components/modes/StrategyMode.tsx). AppShell already imports DialogueEditor, VideoEditor, etc. directly.

---

## 6. Remove deprecated re-exports from workspace index

**Goal:** No "use editor instead" re-exports from workspace.

- In [packages/shared/src/shared/components/workspace/index.ts](packages/shared/src/shared/components/workspace/index.ts): Remove the block "Deprecated editor exports (migration convenience)" (all re-exports of EditorShell, EditorHeader, EditorToolbar, EditorStatusBar, EditorReviewBar, EditorOverlaySurface, DockLayout, DockPanel, PanelTabs, ViewportMeta, DockSidebar, EditorButton, EditorTooltip, PanelSettings, usePanelLock from `../editor`). Keep all real workspace exports (WorkspaceShell, WorkspaceLayout, WorkspaceButton, WorkspaceInspector, etc.).

---

## 7. Clean viewport and app-shell deprecated names and fields (required)

**Goal:** Remove all deprecated viewport and app-shell fields and types so the core has no legacy naming.

**Viewport types (viewportId / viewportType / viewportScope only)**

- **DockLayout** (single implementation): In the viewport type, remove deprecated `editorId`, `editorType`, `editorScope`. Keep only `viewportId`, `viewportType`, `viewportScope`. Update all call sites (DialogueEditor, VideoEditor, CharacterEditor, CodebaseAgentStrategyEditor) to pass only these. Remove any `data-editor-*` fallbacks in the layout component.
- **ViewportMeta** ([packages/shared/src/shared/components/editor/ViewportMeta.tsx](packages/shared/src/shared/components/editor/ViewportMeta.tsx)): Remove deprecated props from the type and implementation; keep only `viewportId`, `viewportType`, `viewportScope`. Update any callers.
- **EditorShell** ([packages/shared/src/shared/components/editor/EditorShell.tsx](packages/shared/src/shared/components/editor/EditorShell.tsx)): Remove deprecated `modeId` prop; use only `editorId`. Update all usages (rg for `modeId` in apps and packages). Remove `data-mode-id` from the component if it was legacy; keep `data-editor-id`.

**App shell store and metadata**

- **App shell store** ([apps/studio/lib/app-shell/store.ts](apps/studio/lib/app-shell/store.ts)): Remove type alias `AppShellWorkspaceId` (use `EditorId` everywhere). Remove deprecated aliases (e.g. `lastDialogueProjectId` alias if there is a deprecated duplicate name). Keep the store API stable; only remove deprecated names from types and comments.
- **mode-metadata.ts** ([apps/studio/lib/app-shell/mode-metadata.ts](apps/studio/lib/app-shell/mode-metadata.ts)): File is deprecated in favor of editor-metadata. If nothing imports from `mode-metadata`, delete the file and update any references to use [editor-metadata.ts](apps/studio/lib/app-shell/editor-metadata.ts). If something still imports it, switch those imports to editor-metadata and then delete mode-metadata.ts.
- **Settings config** ([apps/studio/lib/settings/config.ts](apps/studio/lib/settings/config.ts)): Remove deprecated `getEditorDefaults` / `getViewportDefaults` wrappers if they only forward to the canonical names; update call sites to use the canonical function names and delete the deprecated exports.
- **Model router** ([apps/studio/lib/model-router/server-state.ts](apps/studio/lib/model-router/server-state.ts)): Remove deprecated compatibility function (e.g. the one documented "Kept for compatibility during migration") and update call sites to use the current API.

Use **rg** for each deprecated symbol (e.g. `editorId`, `editorType`, `modeId`, `AppShellWorkspaceId`, `getEditorDefaults`, `mode-metadata`) to find every reference before removing.

---

## 8. Docs and STATUS: no "legacy" or "DockLayoutV2"

- **STATUS.md** ([docs/agent-artifacts/core/STATUS.md](docs/agent-artifacts/core/STATUS.md)): Change "DockLayout (legacy), DockLayoutV2" to "DockLayout (Dockview)". Remove "legacy" from the Dialogue editor bullet. In "What changed", state that DockLayout is the single Dockview-based layout and that deprecated/legacy fields and aliases have been removed.
- **02-components.mdx** ([docs/design/02-components.mdx](docs/design/02-components.mdx)): Editor layout section refers only to "DockLayout" (undock, drag, reorder, persist). Remove "DockLayout (legacy)" and "DockLayoutV2" split.
- **05-editor-platform.mdx** ([docs/architecture/05-editor-platform.mdx](docs/architecture/05-editor-platform.mdx)): Describe DockLayout as the Dockview-based layout; remove references to react-resizable-panels and "legacy".
- **Other docs:** In [00-tools-and-editors.mdx](docs/architecture/00-tools-and-editors.mdx), [10-project-overview.mdx](docs/10-project-overview.mdx), [11-tech-stack.mdx](docs/11-tech-stack.mdx), how-to and architecture indexes, replace "DockLayoutV2" / "legacy DockLayout" with "DockLayout" and remove legacy wording. Use rg to find every occurrence.

---

## 9. Roadmap: production target 2/14

- **Product roadmap** ([docs/roadmap/product.mdx](docs/roadmap/product.mdx)): Add a short **Timeline** or **Targets** section: e.g. "**Production target:** 2/14. We are in development until then; migration and rollback strategy apply after production."
- **Roadmap index** ([docs/roadmap/00-roadmap-index.mdx](docs/roadmap/00-roadmap-index.mdx)): Add one line about production target 2/14.
- **STATUS.md**: In "Current" or "Next", add: "Production target 2/14; core and Ralph Wiggum loop only; no legacy or deprecated code in the editor platform."

---

## 10. Workspace AGENTS and migration guide

- [packages/shared/src/shared/components/workspace/AGENTS.md](packages/shared/src/shared/components/workspace/AGENTS.md): Remove "(legacy)" from the title or clarify that workspace is the UI kit for panels/toolbar/tabs and that editor is the shell + DockLayout.
- [docs/how-to/21-migration-guide-workspace-to-editor.mdx](docs/how-to/21-migration-guide-workspace-to-editor.mdx): State that migration is complete; prefer imports from editor; no deprecated workspace re-exports. Remove references to deprecated aliases.

---

## 11. After completion: update artifacts

- **STATUS.md:** Add a Done entry for this slice: "Removed legacy and deprecated code: single DockLayout (Dockview), no Mode* or workspace editor re-exports, viewport/app-shell deprecated fields removed, .gitignore and codebase strategy for .tmp, roadmap 2/14."
- **errors-and-attempts.md:** If any fix during this work is worth recording (e.g. import path, re-export breakage), add a short entry.
- **AGENTS.md (root):** Ensure the new "Scoped edits / .tmp" (or equivalent) subsection is present and accurate.

---

## Execution order

1. **.gitignore and codebase strategy** (sections 1–2): .gitignore, AGENTS.md, 19-coding-agent-strategy.mdx, tool-usage.md.
2. **Single DockLayout** (section 3): CodebaseAgentStrategyEditor → DockLayoutV2; replace DockLayout.tsx with V2 impl; delete DockLayoutV2.tsx; update studio editors and exports.
3. *Mode and studio aliases** (sections 4–5): Consumer → Editor*; remove Mode* exports and delete Mode* files; remove studio deprecated editor aliases; delete mode re-export files.
4. **Workspace re-exports** (section 6): Remove deprecated block from workspace index.
5. **Viewport and app-shell cleanup** (section 7): Types and call sites for viewportId/viewportType/viewportScope only; EditorShell modeId → editorId; app-shell store and mode-metadata; settings config and model-router deprecated APIs.
6. **Docs and roadmap** (sections 8–10): STATUS, 02-components, 05-editor-platform, other docs, roadmap 2/14, workspace AGENTS, migration guide.
7. **Artifacts** (section 11): STATUS Done entry, errors-and-attempts if needed, AGENTS.md check.

---

## Out of scope

- **react-resizable-panels** remains in `packages/ui` for the Resizable component. No change to UI package.
- **.tmp** and external samples: Do not edit; exclude from search/edits by convention and .gitignore.
- Further cleanup of third-party deprecations (e.g. inside node_modules or .tmp) is out of scope.

