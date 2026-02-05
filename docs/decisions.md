# Architecture decision records

When changing persistence or the data layer, read this file and **docs/tech-stack.md**. Update these docs when accepting or rejecting a significant choice.

---

## Client boundary: Next API only

**Decision:** The browser never calls Payload REST or GraphQL directly. All server-state is fetched through our Next API routes (`/api/graphs`, `/api/video-docs`, `/api/settings`, etc.), which may internally use Payload and/or other backends later.

**Rationale:** One client boundary simplifies auth/CORS, keeps a single contract for the client, and allows adding platform/user/billing from other backends later without refactoring the client.

---

## TanStack Query for server-state

**Decision:** Server-state (graphs, video docs, lists, “me”, pricing, etc.) is fetched and cached via TanStack Query. Query keys and hooks live in `apps/studio/lib/data/` (keys, hooks). Hooks call the OpenAPI-generated client in `lib/api-client/`. Mutations invalidate the relevant queries after save.

**Rationale:** Caching, deduping, loading/error/retry, and invalidation are handled in one place; components stay declarative.

---

## Zustand for drafts and UI route

**Decision:** Draft edits (current graph doc, video doc) and UI state (app shell route, selection, open tabs) live in Zustand. Draft is seeded from server data; save is a mutation that then invalidates queries. App shell route and “last document id” are persisted to localStorage (versioned keys).

**Rationale:** Drafts are client-owned until save; keeping them in Zustand avoids fighting the query cache and keeps a clear “dirty” and “save” flow.

---

## localStorage for route and last document ids

**Decision:** We persist app shell route (`forge:app-shell:v1`) and last document ids (`forge:lastGraphId:v1`, `forge:lastVideoDocId:v1`) in localStorage. On init we restore route and load last (or first, or create empty) document.

**Rationale:** Users keep their tab layout and last-opened document across reloads without requiring a backend session.

---

## One Payload schema/DB for now

**Decision:** We run a single Payload schema and DB to keep local-first dev simple and avoid cross-service auth/identity. Studio and Platform can be separate apps later but should share one schema and type generation at this stage.

**Rationale:** Deferring multi-DB and multi-backend reduces complexity; when we need them, we keep the same client contract by moving complexity behind Next API routes.

---

## Deferring multi-DB / direct Payload from browser

**Decision:** We do not call Payload REST or SDK from the browser. We do not split into multiple DBs or backends until product needs justify it. All app API access goes through the OpenAPI-generated client; server state flows through TanStack Query hooks that use that client; no raw fetch in components or stores.

**Rationale:** Single boundary and single DB are easier to reason about and evolve; “why we don’t” is documented in **docs/tech-stack.md**.
