---
title: Architecture decision records
created: 2026-02-04
updated: 2026-02-08
---

Living artifact for agents. Index: [18-agent-artifacts-index.mdx](../../18-agent-artifacts-index.mdx).

# Architecture decision records

> **For coding agents.** See [Agent artifacts index](../../18-agent-artifacts-index.mdx) for the full list.

When changing persistence or the data layer, read this file and **docs/11-tech-stack.mdx**. Update these docs when accepting or rejecting a significant choice.

---

## Client boundary: Payload REST for CRUD, custom routes for app ops

**Decision:** For collection CRUD (forge-graphs, video-docs), the client uses the **Payload SDK** against Payload's auto-generated REST API (`/api/forge-graphs`, `/api/video-docs`). For app-specific operations (auth shape, settings upsert, AI, model config, SSE), the client uses our **custom Next API routes** and the generated or manual client (e.g. `/api/me`, `/api/settings`, `/api/forge/plan`, `workflows.ts` for SSE).

**Rationale:** Payload's REST gives us full CRUD and querying without duplicating handlers; custom routes keep a single place for auth, settings, and non-CRUD logic.

---

## TanStack Query for server-state

**Decision:** Server-state (graphs, video docs, lists, "me", pricing, etc.) is fetched and cached via TanStack Query. Query keys and hooks live in `apps/studio/lib/data/` (keys, hooks). Hooks use the Payload SDK for collection CRUD and the generated/manual client for custom endpoints. Mutations invalidate the relevant queries after save.

**Rationale:** Caching, deduping, loading/error/retry, and invalidation are handled in one place; components stay declarative.

---

## Project context at app level

**Decision:** The active project is owned by the **app shell**, not by individual editors. The app-shell store holds `activeProjectId`; the `ProjectSwitcher` lives in the editor tab bar (AppShell). Dialogue and Character (and any other project-scoped editor) read this single project id and sync it into their domain stores. This keeps project context cohesive across editors.

**Rationale:** Users expect one "current project"; switching project in one place should affect all editors. Update this doc if we introduce editor-specific project overrides or multi-project views.

---

## Zustand for drafts and UI route

**Decision:** Draft edits (current graph doc, video doc) and UI state (app shell route, **active project**, selection, open tabs, editor bottom drawer) live in Zustand. Draft is seeded from server data; save is a mutation that then invalidates queries. App shell route and "last document id" are persisted via **Zustand persist** (app-shell store). Graph and video stores use persist with partialize for dirty drafts; we rehydrate those conditionally when the persisted draft's documentId matches the current doc. Editor-level UI (e.g. bottom drawer open/closed) lives in the app-shell store, keyed by editor id.

**Rationale:** Drafts are client-owned until save; keeping them in Zustand avoids fighting the query cache and keeps a clear "dirty" and "save" flow. Using persist middleware avoids a separate localStorage abstraction and keeps versioning in one place.

---

## Persisted client state: Zustand persist (no separate localStorage layer)

**Decision:** localStorage is used only via **Zustand persist** for app session (route, last doc ids) and draft snapshots (graph/video). We do not maintain a separate `local-storage.ts` with get/set helpers for those. React Query remains the source for server state; we only persist "which doc" and "unsaved draft" in persisted stores.

**Rationale:** One less abstraction, versioning/migrations in one place, and standard middleware. Users keep tab layout, last-opened document, and unsaved drafts across reloads.

---

## One Payload schema/DB for now

**Decision:** We run a single Payload schema and DB to keep local-first dev simple and avoid cross-service auth/identity. Studio and Platform can be separate apps later but should share one schema and type generation at this stage.

**Rationale:** Deferring multi-DB and multi-backend reduces complexity; when we need them, we keep the same client contract by moving complexity behind Next API routes.

---

## Deferring multi-DB

**Decision:** We do not split into multiple DBs or backends until product needs justify it. Collection CRUD uses Payload REST (Payload SDK) from the browser; non-CRUD uses our custom Next API and generated/manual client. No raw fetch in components or stores for server state—use hooks and the Payload SDK or custom client.

**Rationale:** Single DB and a clear split (Payload REST for CRUD, custom routes for app ops) are easier to reason about; "why we don't" is in **docs/11-tech-stack.mdx**.

---

## Private package publishing via Verdaccio

**Decision:** Foundation packages are published to a **local Verdaccio registry** under the `@forge/*` scope. We publish `@forge/ui`, `@forge/shared`, `@forge/agent-engine`, and the convenience meta-package `@forge/dev-kit`. Domain packages stay private.

**Rationale:** This keeps the public surface small while enabling external apps to adopt the workspace/editor architecture and Copilot utilities quickly. Verdaccio is local-first, fast, and avoids public npm while we iterate.

---

## CopilotKit + OpenRouter: OpenAI SDK and AI SDK with baseURL only

**Decision:** We use the **OpenAI** npm package and **@ai-sdk/openai** (Vercel AI SDK) with **baseURL** set to OpenRouter (`https://openrouter.ai/api/v1`). We do **not** use `@openrouter/ai-sdk-provider` for the CopilotKit route or shared runtime.

**Rationale:** CopilotKit's `OpenAIAdapter` and `BuiltInAgent` are hardcoded to the `openai` and `@ai-sdk/openai` interfaces. OpenRouter's recommended approach is this same pattern (OpenAI SDK + baseURL). Using a different SDK leads to incompatibility and runtime swaps; see errors-and-attempts.

---

## Settings overrides scoped by user

**Decision:** Settings overrides can be scoped by user. The `settings-overrides` collection has an optional `user` relationship. When authenticated, GET `/api/settings` returns only overrides where `user` equals the current user; POST sets `user` on create and update. Unauthenticated requests use overrides where `user` is null (global/legacy). Theme and app/editor settings are thus per-user when logged in.

**Rationale:** One collection, one API; server derives user from auth. No client contract change. Update this doc if we add Payload access control by user or migrate legacy rows to users.

---

## Settings UI: single left drawer with scope tabs

**Decision:** Settings are presented in a **single left-side drawer** (shadcn Sheet, `side="left"`). One Settings control in the app bar opens this drawer (no dropdown). The drawer contains **scope tabs**: App, User (same content as App when logged in), Project (when `activeProjectId` is set), Editor (when an editor is active), Viewport (when in context). A **single schema** (`lib/settings/schema.ts`) lists every setting key with type, label, default, and which scopes show it; we **derive** `SETTINGS_CONFIG` defaults (app, project) and section definitions (APP_SETTINGS_SECTIONS, etc.) from this schema so adding or changing a key in one place adds/updates the control and the default.

**Rationale:** One surface for all settings; project scope allows per-project overrides; single schema avoids duplicate definitions (defaults vs section fields) and keeps the form in sync as settings evolve. See plan "Settings drawer (left sidebar) and form strategy."

---

## AI and media provider stack

**Decision:** We use a split provider stack: **OpenRouter** for text (chat, streaming, structured output, plan) and image (generation, vision); **ElevenLabs** for audio TTS (character voices, previews); **OpenAI Sora** (or equivalent) **planned** for video generation. OpenRouter does not provide audio TTS/STT or video; we use specialized providers.

**Rationale:** Matches OpenRouter's actual capabilities and keeps a single place to document "who does what." STT and video are documented as future (e.g. Whisper for STT, Sora for video when we add them).

---

## Copilot not gated

**Decision:** The **Copilot** (AI sidebar, plan/patch/review, model selection in chat) is **not** behind a plan or capability gate. All users with access to an editor can use the Copilot. Future platform features (publish, monetize) may be gated via `user.plan` and `CAPABILITIES`; Copilot remains free to use.

**Rationale:** Product choice to keep AI assistance available without paywall. Update this doc if we introduce any Copilot-related gating (e.g. rate limits or premium models only).

---

## Analytics and feature flags: PostHog

**Decision:** We use **PostHog** for (1) marketing analytics (page views, custom events e.g. Waitlist Signup), and (2) Studio feature flags (e.g. Video editor via `video-editor-enabled`). Dev and production use separate PostHog project keys (or the same project with environments) so flags can differ. Plan-based entitlements (free/pro) remain for paywall; release/rollout toggles use PostHog.

**Rationale:** Single provider for analytics and feature flags; no Plausible. Update this doc if we add another analytics or flag provider.

---

## DockLayout uses Dockview (docking + floating)

**Decision:** `DockLayout` is implemented with **Dockview** to restore Unreal-style docking, drag-to-reorder, and floating panels. Layout persists to `localStorage['dockview-{layoutId}']` and exposes a `resetLayout()` ref to recover lost panels.

**Rationale:** Dockview provides the desired editor UX (docked tabs, floating groups, drag-to-group). To avoid known provider/context pitfalls (Twick), the Video editor is locked behind `studio.video.editor` until we re-enable and validate context flow.

---

## Clone semantics (paid clone)

**Decision:** When a user **pays to clone** a project or template, they get **access to that project indefinitely** and can **clone it as many times as they want** (no per-clone fee after purchase). Each clone can be a **different version** — we snapshot the project/data at the time of that clone.

**Rationale:** Aligns with Unity Asset Store / Bandlab style: buy once, use many times; version at clone allows authors to ship updates while purchasers keep their snapshot. See [MVP and first revenue](../../product/mvp-and-revenue.mdx).

---

## Revenue model: platform and creator

**Decision:** **Both platform and creator get paid.** We use a Unity Asset Store / Bandlab style model: presets and packages; we take a cut; creators get payouts (e.g. Stripe Connect). **Catalog** at MVP supports **users and orgs** (browse and list).

**Rationale:** Incentivizes creators to list; platform revenue from take rate. Update this doc when we implement Connect, payouts, and catalog.

---

## MVP infrastructure

**Decision:** We run **Vercel + Payload** for MVP (Studio in the cloud). No self-host requirement for MVP.

**Rationale:** Keeps MVP deployment and ops simple; self-host can be considered after MVP.

---

## Platform and marketing

**Decision:** The **marketing site** (`apps/marketing`) is the **landing page and platform** (account, catalog, billing, "Open Studio"). We can change this later (e.g. split platform into a separate app).

**Rationale:** Single app for landing and platform at MVP; architecture allows splitting when needed.

---

## Creators list from day one

**Decision:** Catalog at MVP includes **creator listings from day one**. Stripe Connect (or similar) and payouts are required at MVP so both platform and creators get paid.

**Rationale:** Creators need to list and get paid from launch; no "creator catalog later" phase for MVP.

---

## MVP ordering: Yarn and GamePlayer in MVP; MCP Apps after MVP

**Decision:** **First-class Yarn Spinner** (export/import `.yarn`) and **GamePlayer** (playable runtime for Yarn Games) are **part of MVP**. We do them before or alongside platform monetization. **Editors as MCP Apps** (McpAppDescriptor, Studio MCP Server) is **after MVP** — we do not block MVP work on MCP.

**Rationale:** MVP success = first paid clone E2E; that requires a playable game (Dialogue + Character + Writer + GamePlayer) and Yarn export. MCP is valuable for post-MVP embedding in hosts (Cursor, Claude Desktop, etc.).

---

## What to do next: prefer MVP-critical; Video when unlocked

**Decision:** When picking work from STATUS § Next, **prefer MVP-critical items** (Yarn Spinner, GamePlayer, plans/capabilities for platform, monetization). **Video** work (Twick → VideoDoc persistence, Video workflow panel) is done **when the Video editor is unlocked** (Video is not in MVP). The default "next slice" is MVP-critical (e.g. Yarn export/import or GamePlayer first slice), not Video.

**Rationale:** Aligns agent and contributor effort with MVP success criterion and avoids spending time on Video until we re-enable it.
