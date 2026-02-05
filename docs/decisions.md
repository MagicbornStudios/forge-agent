---
created: 2026-02-04
updated: 2026-02-04
---

# Architecture decision records

> **For coding agents.** See [Agent artifacts index](agent-artifacts.md) for the full list.

When changing persistence or the data layer, read this file and **docs/11-tech-stack.mdx**. Update these docs when accepting or rejecting a significant choice.

---

## Client boundary: Payload REST for CRUD, custom routes for app ops

**Decision:** For collection CRUD (forge-graphs, video-docs), the client uses the **Payload SDK** against Payload’s auto-generated REST API (`/api/forge-graphs`, `/api/video-docs`). For app-specific operations (auth shape, settings upsert, AI, model config, SSE), the client uses our **custom Next API routes** and the generated or manual client (e.g. `/api/me`, `/api/settings`, `/api/forge/plan`, `workflows.ts` for SSE).

**Rationale:** Payload’s REST gives us full CRUD and querying without duplicating handlers; custom routes keep a single place for auth, settings, and non-CRUD logic.

---

## TanStack Query for server-state

**Decision:** Server-state (graphs, video docs, lists, “me”, pricing, etc.) is fetched and cached via TanStack Query. Query keys and hooks live in `apps/studio/lib/data/` (keys, hooks). Hooks use the Payload SDK for collection CRUD and the generated/manual client for custom endpoints. Mutations invalidate the relevant queries after save.

**Rationale:** Caching, deduping, loading/error/retry, and invalidation are handled in one place; components stay declarative.

---

## Zustand for drafts and UI route

**Decision:** Draft edits (current graph doc, video doc) and UI state (app shell route, selection, open tabs, workspace bottom drawer) live in Zustand. Draft is seeded from server data; save is a mutation that then invalidates queries. App shell route and “last document id” are persisted via **Zustand persist** (app-shell store). Graph and video stores use persist with partialize for dirty drafts; we rehydrate those conditionally when the persisted draft’s documentId matches the current doc. Workspace-level UI (e.g. bottom drawer open/closed) lives in the app-shell store, keyed by workspace id.

**Rationale:** Drafts are client-owned until save; keeping them in Zustand avoids fighting the query cache and keeps a clear “dirty” and “save” flow. Using persist middleware avoids a separate localStorage abstraction and keeps versioning in one place.

---

## Persisted client state: Zustand persist (no separate localStorage layer)

**Decision:** localStorage is used only via **Zustand persist** for app session (route, last doc ids) and draft snapshots (graph/video). We do not maintain a separate `local-storage.ts` with get/set helpers for those. React Query remains the source for server state; we only persist “which doc” and “unsaved draft” in persisted stores.

**Rationale:** One less abstraction, versioning/migrations in one place, and standard middleware. Users keep tab layout, last-opened document, and unsaved drafts across reloads.

---

## One Payload schema/DB for now

**Decision:** We run a single Payload schema and DB to keep local-first dev simple and avoid cross-service auth/identity. Studio and Platform can be separate apps later but should share one schema and type generation at this stage.

**Rationale:** Deferring multi-DB and multi-backend reduces complexity; when we need them, we keep the same client contract by moving complexity behind Next API routes.

---

## Deferring multi-DB

**Decision:** We do not split into multiple DBs or backends until product needs justify it. Collection CRUD uses Payload REST (Payload SDK) from the browser; non-CRUD uses our custom Next API and generated/manual client. No raw fetch in components or stores for server state—use hooks and the Payload SDK or custom client.

**Rationale:** Single DB and a clear split (Payload REST for CRUD, custom routes for app ops) are easier to reason about; “why we don’t” is in **docs/11-tech-stack.mdx**.
