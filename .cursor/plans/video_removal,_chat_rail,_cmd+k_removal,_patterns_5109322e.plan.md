---
name: Video removal, Chat rail, Cmd+K removal, patterns
overview: Remove the Video editor; add a shared Chat panel (DialogueAssistantPanel) to the right rail for Dialogue and Character; remove Cmd+K and the AssistantChatPopup; align Strategy with the same panel and scope; review declarative refactor and document shared-panel and scoping patterns per codebase agent strategy.
todos: []
isProject: false
---

# Video removal, Chat in right rail, Cmd+K removal, and design-pattern review

## 1. Remove Video editor

- **Store and routing:** In [apps/studio/lib/app-shell/store.ts](apps/studio/lib/app-shell/store.ts), remove `'video'` from `EDITOR_IDS` so it is no longer a valid workspace. Update `EditorId` type and any `DEFAULT_OPEN` / persisted route logic that might reference video. Ensure persisted `openWorkspaceIds` and `activeWorkspaceId` are migrated or sanitized (e.g. on load, replace `'video'` with default and remove from list).
- **AppShell:** In [apps/studio/components/AppShell.tsx](apps/studio/components/AppShell.tsx): remove `VideoEditor` import and the conditional `{activeWorkspaceId === 'video' && videoEnabled && <VideoEditor />}`; remove the Video tab button and any `videoEnabled` / `useVideoEditorEnabled` usage for tab visibility; adjust `editorIdsForActions` and `visibleWorkspaceIds` so video is never included.
- **Metadata:** In [apps/studio/lib/app-shell/editor-metadata.ts](apps/studio/lib/app-shell/editor-metadata.ts), remove the `video` entry from `EDITOR_LABELS`, `EDITOR_SUMMARY`, and `EDITOR_VIEWPORT_IDS` (or leave keys for type safety but mark deprecated; prefer removal if `EditorId` no longer includes `'video'`).
- **Panel specs and schema:** In [apps/studio/lib/app-shell/editor-panels.ts](apps/studio/lib/app-shell/editor-panels.ts), remove the `video` entry from `EDITOR_PANEL_SPECS`. In [apps/studio/lib/settings/schema.ts](apps/studio/lib/settings/schema.ts), remove or deprecate `panel.visible.video-right` and `panel.visible.video-bottom` schema entries (and any SETTINGS_CONFIG that references them). Keep schema in sync so no broken keys.
- **Feature flag:** In [apps/studio/lib/feature-flags.ts](apps/studio/lib/feature-flags.ts), remove or repurpose `useVideoEditorEnabled` (e.g. always return false, or remove and delete all call sites).
- **Do not change:** Leave [apps/studio/components/editors/VideoEditor.tsx](apps/studio/components/editors/VideoEditor.tsx) in the repo but do not import or render it; document in STATUS/decisions that Video is no longer a workspace and receives no updates. Optionally move to a `_deprecated` folder or add a file-level deprecation comment.
- **Docs:** Update [docs/agent-artifacts/core/STATUS.md](docs/agent-artifacts/core/STATUS.md), [docs/agent-artifacts/core/decisions.md](docs/agent-artifacts/core/decisions.md) (one line: Video editor removed from workspace; no new updates), and any references in AGENTS.md or editor lists.

## 2. Chat panel in right rail (DialogueAssistantPanel, same in Strategy)

- **Single panel content:** Use [DialogueAssistantPanel](apps/studio/components/editors/dialogue/DialogueAssistantPanel.tsx) as the canonical Chat UI. Ensure it is the same component used in (1) the new right-rail Chat panel and (2) any remaining Strategy surface (see below). No duplication of behavior.
- **Shared descriptor / id:** Introduce a constant for the Chat panel id (e.g. `CHAT_PANEL_ID = 'chat'`) in one place (e.g. [apps/studio/lib/app-shell/editor-metadata.ts](apps/studio/lib/app-shell/editor-metadata.ts) or a small `apps/studio/lib/editor-registry/constants.ts`) so View menu and schema keys stay consistent (`panel.visible.{editorId}-chat`). Optionally export a small helper or component that wraps `DialogueAssistantPanel` for the rail (e.g. `AssistantChatPanelContent`) so every editor that adds the Chat panel uses the same content and styling.
- **Schema:** Add `panel.visible.dialogue-chat` and `panel.visible.character-chat` (and any other editor that gets the Chat panel) to [apps/studio/lib/settings/schema.ts](apps/studio/lib/settings/schema.ts) with type toggle and default true, and ensure SETTINGS_CONFIG / section meta include them if needed for Settings UI.
- **Dialogue:** In [apps/studio/components/editors/DialogueEditor.tsx](apps/studio/components/editors/DialogueEditor.tsx), add a second **EditorPanel** on the right rail with `id="chat"`, title "Chat", and content = `DialogueAssistantPanel` (or `AssistantChatPanelContent`) with the same props as today (e.g. `composerTrailing={<ModelSwitcher provider="assistantUi" variant="composer" />}`). Order: e.g. Inspector first, Chat second (or Chat first); keep stable so layout persistence is predictable.
- **Character:** In [apps/studio/components/editors/CharacterEditor.tsx](apps/studio/components/editors/CharacterEditor.tsx), add an **EditorPanel** on the right rail with `id="chat"`, title "Chat", same content component. So Character has Properties + Chat on the right.
- **Strategy as tab:** Either (A) remove the Strategy tab and rely only on the right-rail Chat panel for the assistant UI, or (B) keep a minimal Strategy tab that only renders a shell with the same DialogueAssistantPanel (no left/main rails). User said "move the strategy editor as a chat panel in the right rails" and "same panel in strategy editor and in this panel" — so recommend (A) remove Strategy tab and use only the right-rail Chat; if you keep (B), Strategy tab becomes a single-panel view of the same DialogueAssistantPanel. Decide and document in decisions.md.
- **Panel specs fallback:** If Strategy tab is removed, remove `strategy` from `EDITOR_PANEL_SPECS` and from `EDITOR_IDS` / metadata. If Strategy tab is kept as minimal shell, keep `strategy` in `EDITOR_IDS` but its "layout" is just the Chat panel (same component).

## 3. Remove Cmd+K and AssistantChatPopup

- **Shortcut:** In [apps/studio/components/AppShell.tsx](apps/studio/components/AppShell.tsx), remove the `useEffect` that listens for Mod+K and Ctrl+Shift+P and calls `setChatPopupOpen(true)`.
- **Popup component:** Remove rendering of `<AssistantChatPopup open={chatPopupOpen} onOpenChange={setChatPopupOpen} />` and the `chatPopupOpen` / `setChatPopupOpen` state and `openChatPopup` callback. Remove `openChatPopup` from the props passed to `UnifiedMenubar`.
- **Help menu:** In AppShell, change the Help menu so it no longer opens the popup. Options: remove "Show Commands" item, or replace with "Open Chat" that focuses or reveals the right-rail Chat panel (e.g. set a setting or call a store action that focuses the chat panel tab in the active editor). Prefer "Open Chat" that focuses the rail panel if feasible without large refactors; otherwise remove the item and keep Welcome + About.
- **UnifiedMenubar:** In [apps/studio/components/AppShell.tsx](apps/studio/components/AppShell.tsx), update `UnifiedMenubar` usage so it no longer receives `openChatPopup`; update the Help menu items in the merged menus (remove or replace Show Commands as above).
- **AssistantChatPopup:** Leave [apps/studio/components/assistant/AssistantChatPopup.tsx](apps/studio/components/assistant/AssistantChatPopup.tsx) in the codebase but unused, or delete it and remove the import. Prefer delete if nothing else references it.
- **Docs:** STATUS and decisions: Cmd+K removed; chat is available only in the right-rail Chat panel (and optionally Strategy tab if kept).

## 4. Scoping and registries (same panel, registry-style scope)

- **Single source of truth:** The Chat panel content is one component (DialogueAssistantPanel). Panel id is a constant (`CHAT_PANEL_ID`). Visibility keys follow `panel.visible.{editorId}-{panelId}`. Document in [docs/agent-artifacts/core/decisions.md](docs/agent-artifacts/core/decisions.md) that shared panels (e.g. Chat) are added by each editor that should show them via the same descriptor (id + content component), so we have one panel implementation and one id, and future tooling can be scoped the same way (e.g. by editorId, or by a future "app-contributed panels" registry if we add it).
- **No new registry type yet:** Keep the current panel registry keyed by editorId; each editor that wants Chat explicitly adds an EditorPanel with id `CHAT_PANEL_ID` and the shared content. If later we introduce "app-level" or "global" panel contributions that get merged into every editor’s rails, that can be a follow-up and documented in decisions.

## 5. Refactor and design-pattern review

- **Declarative refactor:** The current refactor (panel registry, EditorLayoutProvider, EditorRail, EditorPanel, EditorLayout; settings registry; EditorMenubarContribution) is consistent: panels and settings and menubar are declared in the tree and register on mount. No change required for the refactor itself; only add the Chat panel to the existing pattern.
- **Menu items and scope:** Menus are already handled in a registry-like way: **EditorMenubarContribution** + **EditorMenubarMenuSlot** build the menu array and call `setEditorMenus` on mount (per-editor scope); unmount clears. No additional menu registry is needed. Document in [docs/agent-artifacts/core/standard-practices.md](docs/agent-artifacts/core/standard-practices.md) or decisions that editor-scoped contributions (panels, menus, settings sections) follow the same pattern: declare under a provider, register on mount, unregister on unmount, keyed by editorId or scope.
- **Shared panel pattern:** Add a short subsection in [docs/agent-artifacts/core/decisions.md](docs/agent-artifacts/core/decisions.md) or in [packages/shared/src/shared/components/editor/README.md](packages/shared/src/shared/components/editor/README.md): "Shared panel content (e.g. Chat) is implemented once; editors that want the panel add an EditorPanel with a stable id (e.g. CHAT_PANEL_ID) and the same content component. Visibility and View menu derive from the panel registry; schema keys are panel.visible.{editorId}-{panelId}."
- **Gaps / cleanup:** (1) Remove or deprecate Video and optionally Strategy from EDITOR_IDS and all editor lists in docs. (2) Ensure EDITOR_PANEL_SPECS fallback and schema have no video/strategy entries if those editors are removed. (3) Run doc scan (design, architecture, how-to, agent-artifacts) and update STATUS, task-registry, and any "list of editors" or "Video/Strategy" references. (4) If Strategy tab is removed, remove Strategy from feature flag and tab bar and EditorApp.Content.

## 6. Agent strategy (per 19-coding-agent-strategy)

- **Before:** Read STATUS and relevant AGENTS.md; check errors-and-attempts for any related gotchas.
- **After each slice:** Update STATUS (Ralph Wiggum Done), merge/replace EDITOR_IDS and route logic, then panel/schema/docs; then Cmd+K removal; then pattern docs.
- **Doc scan:** Update [docs/agent-artifacts/core/STATUS.md](docs/agent-artifacts/core/STATUS.md), [docs/agent-artifacts/core/decisions.md](docs/agent-artifacts/core/decisions.md), [docs/agent-artifacts/core/task-registry.md](docs/agent-artifacts/core/task-registry.md) if initiatives change, [AGENTS.md](AGENTS.md) if editor list or app-shell rules change, and any architecture docs that list editors or Cmd+K.
- **Constants:** Use `CHAT_PANEL_ID` (and optional `DIALOGUE_ASSISTANT_API_URL` if needed) from a single place; no magic strings for the chat panel id.

## Implementation order (slices)

1. **Slice 1 — Remove Video:** EDITOR_IDS and store without video; AppShell without Video tab or VideoEditor; metadata and editor-panels and schema without video; feature flag removed or always false; STATUS/decisions updated.
2. **Slice 2 — Chat panel in rail:** Add CHAT_PANEL_ID; add DialogueAssistantPanel (or AssistantChatPanelContent) to right rail in Dialogue and Character; add schema keys for panel.visible.{editorId}-chat; verify View menu and layout.
3. **Slice 3 — Strategy tab decision:** Either remove Strategy tab and EDITOR_IDS/strategy everywhere, or keep minimal Strategy tab showing only DialogueAssistantPanel; update AppShell and docs accordingly.
4. **Slice 4 — Remove Cmd+K:** Remove shortcut listener, AssistantChatPopup render, chatPopupOpen state, openChatPopup; update Help menu (remove or "Open Chat"); delete or deprecate AssistantChatPopup component.
5. **Slice 5 — Patterns and docs:** Document shared-panel pattern and scoping in decisions/README; add standard-practices or decisions note on editor-scoped contributions; full doc scan and STATUS Ralph Wiggum update.

## Files to touch (summary)


| Area          | Files                                                                                                 |
| ------------- | ----------------------------------------------------------------------------------------------------- |
| Video removal | store.ts, AppShell.tsx, editor-metadata.ts, editor-panels.ts, schema.ts, feature-flags.ts             |
| Chat panel    | DialogueEditor.tsx, CharacterEditor.tsx, editor-metadata or constants, schema.ts                      |
| Strategy      | AppShell.tsx, store.ts, editor-metadata.ts, editor-panels.ts, StrategyEditor.tsx (delete or simplify) |
| Cmd+K         | AppShell.tsx, AssistantChatPopup.tsx (delete or keep unused)                                          |
| Docs          | STATUS.md, decisions.md, task-registry.md, AGENTS.md, shared editor README, standard-practices        |


## Risk and notes

- **Layout persistence:** Adding a new right-rail panel (Chat) may change Dockview default layout for existing users; use stable panel ids and test restore/reset.
- **Strategy vs Chat:** If Strategy tab is removed, any "Strategy" capability or feature flag (e.g. STUDIO_STRATEGY_EDITOR) might gate the Chat panel visibility or the ModelSwitcher; clarify and document.
- **CopilotKit vs assistant-ui:** User noted moving away from CopilotKit; DialogueAssistantPanel uses assistant-ui. Keeping one shared panel and a clear scope/registry pattern sets up future tooling without changing this plan.

dont deprecate, just remove things that dont fit anymore. also we need to think about registring editors the same way we have been with the app and the panels, settings and etc. we should update our todos with that.  we should have a clear design pattern and declaritve api