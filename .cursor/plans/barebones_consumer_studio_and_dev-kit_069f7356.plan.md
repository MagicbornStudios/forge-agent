---
name: Barebones Consumer Studio and Dev-Kit
overview: Add a new barebones studio app at apps/ level that uses only the consumer-facing dev-kit, with zero-config Repo Studio detection and assistant; extend dev-kit (via shared) so the runtime switch and assistant URL "just work" on import. Execution will use the forge-loop lifecycle; planning only now while Codex migration is in progress.
todos: []
isProject: false
---

# Barebones Consumer Studio and Dev-Kit Companion Runtime

## Goal

- A **new app** at the same level as `apps/studio` and `apps/repo-studio` that is the reference for "a dev using our studio components": minimal toolbar + workspace + assistant, **no AI setup** (no local assistant-chat route, no env).
- **Just works:** When Repo Studio is running, the toolbar auto-detects and shows a connect/use switch; the assistant panel points at Repo Studio with no config. When Repo Studio is not running, the app still renders with a clear "Start Repo Studio to enable AI" or disabled assistant state.
- **Consumer-facing only:** The app uses `@forge/dev-kit` only (no imports from `apps/studio` or `apps/repo-studio`).
- **Execution:** Implement using the forge-loop (discuss-phase, plan-phase, execute-phase, verify-work, sync-legacy). We are **planning only** now; another agent (Codex) is doing a large component migration/renaming, so implementation should align with or follow that work.

---

## 1. Extend shared (so dev-kit exposes it) for zero-config companion runtime

Today only `useCompanionRuntimeDetection(baseUrl)` is in shared ([packages/shared/src/shared/workspace/companion-runtime.ts](packages/shared/src/shared/workspace/companion-runtime.ts)). Studio has its own app-shell store, `RepoStudioRuntimeSwitch`, and `useAssistantChatUrl` in [apps/studio](apps/studio). To make "import and it works" for any app using dev-kit:

- **Default baseUrl:** When the app does not set a base URL (e.g. no `NEXT_PUBLIC_REPO_STUDIO_APP_URL`), default in development to `http://localhost:3010` (Repo Studio default port). So detection runs without the dev setting env. Optionally allow override via a single env or a provider prop.
- **Companion runtime store:** A small Zustand store (or React context) in **shared** that holds: `repoStudioBaseUrl`, `useRepoStudioRuntime`, `useCodexAssistant`, and setters. Persist `useRepoStudioRuntime` (and optionally `useCodexAssistant`) so the choice survives refresh. This must live in shared so dev-kit re-exports it and no app-specific code is required.
- **Switch component:** A `RepoStudioRuntimeSwitch` (or equivalent name after migration) in **shared** that: uses `useCompanionRuntimeDetection(defaultOrPropBaseUrl)`, the shared store, and renders the "Use Repo Studio for AI" / "Use Codex" toggles. Same behavior as [apps/studio/components/RepoStudioRuntimeSwitch.tsx](apps/studio/components/RepoStudioRuntimeSwitch.tsx) but with no dependency on `@/lib/app-shell/store`.
- **useAssistantChatUrl:** A hook in **shared** that reads the shared store and returns the assistant-chat URL: when `useRepoStudioRuntime` and `repoStudioBaseUrl` are set, return `repoStudioBaseUrl + '/api/assistant-chat'` (and append `?editorTarget=codex-assistant` when `useCodexAssistant`). Otherwise return a fallback (e.g. `null` or a no-op URL) so the barebones app can show "AI unavailable" when Repo Studio is not in use.

**Location:** New (or extended) modules under [packages/shared/src/shared/workspace](packages/shared/src/shared/workspace) (e.g. `companion-runtime-store.ts`, and either extend `companion-runtime.ts` or add a small `CompanionRuntimeSwitch.tsx` and `useAssistantChatUrl.ts` there). Re-export from [packages/shared/src/shared/workspace/index.ts](packages/shared/src/shared/workspace/index.ts). Dev-kit already re-exports `@forge/shared`, so no dev-kit code change beyond ensuring the new exports are part of the shared public surface.

**Naming:** Codex is doing component/renaming migration. The plan should refer to "companion runtime switch" and "assistant chat URL hook" generically; final names can match the migration (e.g. keep `RepoStudioRuntimeSwitch` or rename to something like `CompanionRuntimeSwitch`).

---

## 2. New app: barebones consumer studio

- **Placement:** New Next.js app under `apps/`, same level as `apps/studio` and `apps/repo-studio` (e.g. `apps/barebones-studio` or `apps/consumer-studio`). Name TBD (avoid conflicting with existing "consumer" example under `examples/consumer`).
- **Dependencies:** Only `@forge/dev-kit` (and what dev-kit brings: shared, ui, agent-engine), Next, React. No dependency on `apps/studio` or `apps/repo-studio`.
- **Structure:**
  - Root layout: theme and any global providers (e.g. from dev-kit if needed).
  - Single page: compose from dev-kit only — e.g. `AppProviders`, `EditorApp`, `EditorShell`, toolbar slot that includes the companion runtime switch, and a main content area that either renders the assistant workspace (Thread / CodebaseAgentStrategyWorkspace or equivalent) when a chat URL is available, or a short message when Repo Studio is not detected/opted in.
  - **No** local `app/api/assistant-chat` route. All assistant traffic goes to Repo Studio when the user has turned the switch on.
- **Assistant URL:** The page (or a wrapper) uses the new `useAssistantChatUrl` from dev-kit. When it returns a URL, pass it into the assistant workspace/panel (e.g. `apiUrl={assistantChatUrl}`). When it returns null or "unavailable", show a single panel with copy like "Start Repo Studio (e.g. pnpm dev:repo-studio) and turn on 'Use Repo Studio for AI' in the toolbar."
- **Toolbar:** Include the companion runtime switch in the shell toolbar so that as soon as Repo Studio is running and reachable, the switch appears and the user can enable AI with one click.

**Build/lint:** Add the new app to the workspace; ensure `pnpm --filter <new-app> build` and lint pass. Root scripts can expose `dev:barebones-studio` (or similar) analogous to `dev:repo-studio` and `dev:studio`.

---

## 3. Forge-loop and coordination with Codex migration

- **Phase:** Add a new phase to [.planning/ROADMAP.md](.planning/ROADMAP.md) (e.g. **Phase 14: Barebones consumer studio and dev-kit companion runtime**) with a short goal and 1–2 plans (e.g. 14-01: shared companion runtime store + switch + useAssistantChatUrl + default baseUrl; 14-02: new apps/barebones-studio app). When **executing**, run the full loop: `forge-loop discuss-phase 14`, `forge-loop plan-phase 14`, `forge-loop execute-phase 14`, `forge-loop verify-work 14`, `forge-loop sync-legacy`.
- **Coordination:** Codex is performing a large component migration and renaming. Implementation of this plan should:
  - Prefer stable APIs from shared/editor (EditorShell, EditorApp, etc.); if names change during migration, the implementation phase should use the current names at execution time.
  - Avoid duplicating logic that Codex might be centralizing (e.g. if a shared "app shell" or "companion runtime" layer appears, use it instead of inventing a second one).
  - Be done after or in sync with the migration so the new app and shared changes don’t conflict with renames.

---

## 4. Summary


| Item                           | Action                                                                                                                                                 |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Default Repo Studio URL in dev | In shared, default baseUrl to `http://localhost:3010` when not set (e.g. in browser dev).                                                              |
| Companion runtime state        | Add a small store (or context) in shared for repoStudioBaseUrl, useRepoStudioRuntime, useCodexAssistant + setters; optional persist.                   |
| Switch component               | Add RepoStudioRuntimeSwitch (or post-migration name) in shared using detection hook + store.                                                           |
| useAssistantChatUrl            | Add in shared; reads store, returns Repo Studio assistant-chat URL or fallback.                                                                        |
| New app                        | Add apps/barebones-studio (or consumer-studio); dev-kit only; toolbar + single panel; assistant via useAssistantChatUrl; no local /api/assistant-chat. |
| Forge-loop                     | Add Phase 14 (or equivalent); execute with discuss → plan → execute → verify → sync-legacy.                                                            |
| Codex migration                | Implement after or aligned with migration; use current component names at execution time.                                                              |


No edits to the plan file itself; this is the plan to review and later execute via the loop.