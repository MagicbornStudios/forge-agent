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

## CopilotKit responses v2 compatibility + assistant-ui chat pipeline

**Decision:** CopilotKit BuiltInAgent continues to use the **responses** API, but model selection is **filtered to responses‑v2 compatible models** (with a safe fallback). The assistant‑ui chat surface uses the **chat** pipeline by default so it can use a broader set of OpenRouter models without responses‑v3 failures.

**Rationale:** AI SDK 5 only supports responses spec v2; some OpenRouter‑backed providers (Gemini, Claude) return v3 and cause runtime errors. We keep CopilotKit for agent actions while preventing incompatibilities, and rely on assistant‑ui for a resilient, standard chat UI. This gives us two surfaces without blocking workflows.

**Implementation note:** Model selection stays **global** (ModelSwitcher + model router preferences). CopilotKit enforces responses‑v2 compatibility at runtime; assistant‑ui uses the same model selection via `/api/assistant-chat` but through the chat pipeline.

---

## Structured logging: pino in Studio, file and optional client-to-file

**Decision:** Studio uses **pino** for structured logging. Env: `LOG_LEVEL` (default `info`), `LOG_FILE` (optional path; when set, logs go to stdout and file). `getLogger(namespace)` returns a child logger so every line has a namespace. Optional in dev: `ALLOW_CLIENT_LOG=1` and `NEXT_PUBLIC_LOG_TO_SERVER=1` enable `POST /api/dev/log`, which appends client log payloads to the same `LOG_FILE` with a `client: true` field. Log file path (e.g. `.logs/`) is in `.gitignore`.

**Rationale:** One file in the codebase for tracing without watching browser or terminal; env-driven level and namespaces; client-to-file is opt-in and dev-only.

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

## Platform gates and plan

**Decision:** Platform capabilities (`PLATFORM_LIST`, `PLATFORM_PUBLISH`, `PLATFORM_MONETIZE`) are granted to the **pro** plan only; **free** users cannot list, publish, or monetize. Plan is hydrated from `GET /api/me` and stored in the entitlements store; `getStatus(capability)` uses `PLAN_CAPABILITIES[plan]` in `apps/studio/lib/entitlements/store.ts`. No extra wiring is required—EntitlementsProvider already sets plan from `useMe()` and exposes `has`/`get` from the store.

**Rationale:** Single source of truth (plan from API → store → FeatureGate). Update this doc if we add new plan tiers or move platform gates to a different mechanism.

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

**Decision:** When a user **pays to clone** a project or template, they receive a **license** and can **clone again** (no per-clone fee after purchase). The **listing creator** chooses per listing: **indefinite** (purchaser always gets current project state on clone-again) or **version-only** (purchaser gets the same snapshot as at purchase). We persist a **license** record (user, listing, Stripe session id, grantedAt, optional snapshot) to enable clone-again and future audio/licenses.

**Rationale:** Aligns with Unity Asset Store / Bandlab style: buy once, use many times; creator choice supports both "always up to date" and "fixed release" offerings. See [MVP and first revenue](../../product/mvp-and-revenue.mdx) and [Listings and clones](../../business/listings-and-clones.mdx).

---

## Revenue model: platform and creator

**Decision:** **Both platform and creator get paid.** We use a Unity Asset Store / Bandlab style model: presets and packages; we take a cut; creators get payouts (e.g. Stripe Connect). **Catalog** at MVP supports **users and orgs** (browse and list).

**Rationale:** Incentivizes creators to list; platform revenue from take rate. Update this doc when we implement Connect, payouts, and catalog.

---

## Usage-based payouts for approved third-party editors

**Decision:** We add **usage-based recurring payouts** for **approved third-party editors** in the official Studio suite. Same Stripe Connect account we use for clone payouts; this is a second payout stream (editor usage share). We measure usage (sessions, actions, or other metrics TBD) and assign value by usage and **complexity** (tier or formula TBD). Metrics and formula are **TBD**; document in [docs/business/revenue-and-stripe.mdx](../../business/revenue-and-stripe.mdx) and update this ADR when defined.

**Rationale:** Rewards developers whose editors are adopted; AI-first bar (if the AI cannot figure out an editor, it is not a good editor). See [Developer program and editor ecosystem](../../business/developer-program-and-editors.mdx).

---

## MVP infrastructure

**Decision:** We run **Vercel + Payload** for MVP (Studio in the cloud). No self-host requirement for MVP.

**Rationale:** Keeps MVP deployment and ops simple; self-host can be considered after MVP.

---

## Platform and marketing

**Decision:** The **marketing site** (`apps/marketing`) is the **landing page and platform** (account, catalog, billing, "Open Studio"). We can change this later (e.g. split platform into a separate app).

**Rationale:** Single app for landing and platform at MVP; architecture allows splitting when needed.

---

## Catalog and listings API

**Decision:** The **public catalog** is read-only for marketing: Studio exposes **GET /api/catalog** (published listings only; no auth). Payload REST handles **/api/listings** for create/update/delete (authenticated; Create listing UI is gated by PLATFORM_LIST). Payload collection `listings` holds title, slug, description, listingType, project, price, currency, creator, thumbnail, category, status. Marketing calls GET /api/catalog via `fetchListings()` from `lib/api.ts`; Studio uses Payload SDK for listing CRUD.

**Rationale:** Marketing cannot use Payload SDK directly (different app); a single public route keeps the contract clear and allows filtering to published only.

---

## Creators list from day one

**Decision:** Catalog at MVP includes **creator listings from day one**. Stripe Connect (or similar) and payouts are required at MVP so both platform and creators get paid.

**Rationale:** Creators need to list and get paid from launch; no "creator catalog later" phase for MVP.

---

## Payments and checkout (Stripe hosted)

**Decision:** Use **Stripe hosted Checkout** for one-time clone purchases (and keep existing subscription Checkout for Pro). No custom payment UI. Use **Stripe for invoicing** where needed. Align with Cursor-style defaults (create session, redirect to Stripe, success/cancel URLs).

**Rationale:** Reduces PCI and UX risk; Stripe handles payment form and 3DS. See [Revenue and Stripe](../../business/revenue-and-stripe.mdx) and platform monetization task breakdown.

---

## Stripe Connect (day one)

**Decision:** Use **Stripe Connect from day one** for clone purchases. Payments go to the creator's connected account; platform takes an application fee. Creators must complete **Connect onboarding** (Express or Standard) before they can receive payouts; we store `stripeAccountId` (e.g. on users or a creator-accounts collection).

**Rationale:** Ensures creators get paid directly from launch. Document onboarding flow in business docs and task breakdown. See [Revenue and Stripe](../../business/revenue-and-stripe.mdx).

---

## Clone implementation (full project, media as references)

**Decision:** Clone = **full project copy**: project row, forge-graphs, characters, relationships, pages, blocks, settings. **Media:** do not duplicate files; store **references** to the source project's media. When the **clone owner** replaces or deletes (e.g. in Character), upload new media and remove the reference to the old media. Optional: mark media in the cloned project as "reference" so UI can show "from original project" until replaced.

**Rationale:** Keeps storage and clone cost low; clone owner gains full control when they edit. See [Listings and clones](../../business/listings-and-clones.mdx).

---

## License record (clone-again and future licenses)

**Decision:** Persist a **license** when a user pays to clone (e.g. Payload collection `licenses`: user, listing, stripeSessionId or paymentIntentId, grantedAt, optional versionSnapshotId). Enables clone-again (API and UI) and future audio/generated-content licenses. Webhook on successful payment creates the license and triggers first clone (or queue).

**Rationale:** Single record for "right to clone" and future license types. See [Listings and clones](../../business/listings-and-clones.mdx) and task breakdown.

---

## Listing versioning (clone mode)

**Decision:** Add a field to listings (e.g. `cloneMode: 'indefinite' | 'version-only'`). The **creator** sets it when creating or editing a listing. Backend uses it when handling clone-again: **indefinite** = clone current project state; **version-only** = clone the same snapshot as at first purchase.

**Rationale:** Creator choice per listing; supports both "always latest" and "fixed release" use cases. See [Listings and clones](../../business/listings-and-clones.mdx).

---

## Payouts: single seller now; splits later

**Decision:** **Single seller per listing for now.** Payment goes to the listing creator's Connect account; platform takes an application fee. No split payouts. Splits between multiple sellers (music-industry style) and IP/licensing (e.g. Beatstars-style) are to be figured out later when we have more features and creatable content that could justify splits.

**Rationale:** Keeps checkout and payouts simple at launch. See [Revenue and Stripe](../../business/revenue-and-stripe.mdx).

---

## MVP ordering: Yarn and GamePlayer in MVP; MCP Apps after MVP

**Decision:** **First-class Yarn Spinner** (export/import `.yarn`) and **GamePlayer** (playable runtime for Yarn Games) are **part of MVP**. We do them before or alongside platform monetization. **Editors as MCP Apps** (McpAppDescriptor, Studio MCP Server) is **after MVP** — we do not block MVP work on MCP.

**Rationale:** MVP success = first paid clone E2E; that requires a playable game (Dialogue + Character + Writer + GamePlayer) and Yarn export. MCP is valuable for post-MVP embedding in hosts (Cursor, Claude Desktop, etc.).

---

## What to do next: prefer MVP-critical; Video when unlocked

**Decision:** When picking work from STATUS § Next, **prefer MVP-critical items** (Yarn Spinner, GamePlayer, plans/capabilities for platform, monetization). **Video** work (Twick → VideoDoc persistence, Video workflow panel) is done **when the Video editor is unlocked** (Video is not in MVP). The default "next slice" is MVP-critical (e.g. Yarn export/import or GamePlayer first slice), not Video.

**Rationale:** Aligns agent and contributor effort with MVP success criterion and avoids spending time on Video until we re-enable it.
