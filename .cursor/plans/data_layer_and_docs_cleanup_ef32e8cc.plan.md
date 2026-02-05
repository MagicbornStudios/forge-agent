# Data layer, Payload SDK, hooks, and docs (revised)

## Summary

- **Use @payloadcms/sdk for all Payload entity CRUD** from the client — no hand-rolled `fetch` for forge-graphs, video-docs, or other collections. Payload exposes a type-safe REST API and an official SDK (`@payloadcms/sdk`); we use it instead of reinventing the wheel.
- **Use the existing TanStack Query hooks everywhere** — no raw fetch or direct SDK calls in components or Zustand stores. Hooks are the single place that talk to the SDK (or custom client). Add missing hooks (e.g. `useCreateGraph`, `useCreateVideoDoc`) and refactor so page, VideoWorkspace, and stores consume hooks only.
- **Keep a small client for non-Payload routes** (e.g. `/api/me`, `/api/settings`, `/api/forge/plan`, `/api/image-generate`, render, etc.). Either a thin hand-written client or a generated client from our Next API; no fetch in components for those either.
- **Do we still need “studio client”?** Only as a split: (1) **Payload SDK instance** for entity CRUD (replacing current graph/video methods), (2) **Custom API client** for non-Payload routes. Hooks stay; they’re the only place that call SDK or custom client, so components/stores never get “hairy” — they just use `useGraphs()`, `useSaveVideoDoc()`, etc.

---

## 1. Why hooks + SDK (and no raw fetch for Payload)

- We already have [useGraphs](apps/studio/lib/data/hooks/use-graphs.ts), [useVideoDocs](apps/studio/lib/data/hooks/use-video-docs.ts), [useSaveGraph](apps/studio/lib/data/hooks/use-save-graph.ts), [useSaveVideoDoc](apps/studio/lib/data/hooks/use-save-video-doc.ts), etc., but **we’re not using them** in several places: [VideoWorkspace](apps/studio/components/workspaces/VideoWorkspace.tsx), [page.tsx](apps/studio/app/page.tsx), and the Zustand stores ([lib/store.ts](apps/studio/lib/store.ts), [lib/domains/video/store.ts](apps/studio/lib/domains/video/store.ts)) use raw `fetch` instead.
- Payload provides an official **Payload REST API** (auto-generated from collections) and **@payloadcms/sdk** for type-safe CRUD. Docs: <https://payloadcms.com/docs/rest-api/overview> (see “Payload REST API SDK”). So for Payload entities we should use the SDK, not reimplement fetch in [studio-client.ts](apps/studio/lib/data/studio-client.ts).
- **Hooks stay as the single abstraction:** All server state and mutations go through TanStack Query hooks. The hooks’ `queryFn` / `mutationFn` call the Payload SDK (for entities) or the custom API client (for non-Payload). Components and stores never call `fetch` or the SDK directly — they use hooks and pass data/callbacks down. That keeps “React hooks” from getting hairy: one clear layer (hooks) that owns caching, loading, and API shape.

---

## 2. Current vs desired

| What | Current | Desired |
|------|--------|--------|
| Payload entity CRUD | Hand-rolled `fetch` in studio-client + custom routes `/api/graphs`, `/api/video-docs` | **@payloadcms/sdk** against Payload’s REST API (e.g. `/api/forge-graphs`, `/api/video-docs` per collection slug). Hooks call SDK. |
| Who uses the API? | Mix: some hooks use studioClient, page/VideoWorkspace/stores use raw fetch | **Only hooks** use SDK or custom client. Page, VideoWorkspace, and stores use hooks only (e.g. `useGraphs()`, `useCreateVideoDoc()`, `useSaveGraph()`). |
| studio-client | All-in-one: graphs, video-docs, me | **Split:** (1) Payload SDK instance for entity CRUD, (2) small custom client for `/api/me`, `/api/settings`, `/api/forge/plan`, `/api/image-generate`, etc. |
| Custom routes | `/api/graphs`, `/api/video-docs` (custom handlers) | Either **remove** and rely on Payload’s built-in REST at `/api/forge-graphs`, `/api/video-docs`, or keep as thin proxies; in either case **client uses SDK** for those collections. |

---

## 3. Payload REST and collection slugs

- Payload mounts REST at `routes.api` (default `/api`). Each collection is at `/api/{collection-slug}`.
- Our slugs: `forge-graphs`, `video-docs`, `settings-overrides`, `users`, etc. So Payload REST is at `/api/forge-graphs`, `/api/video-docs`, etc.
- We currently have **custom** Next route handlers at `/api/graphs` and `/api/video-docs` that return different shapes (e.g. `result.docs` only). With the SDK we use Payload’s native responses (e.g. `find()` returns `{ docs, totalDocs, ... }`); hooks can unwrap `.docs` or use the doc directly so existing UI types still work.

---

## 4. Implementation plan

### 4.1 Add and wire @payloadcms/sdk

- Install `@payloadcms/sdk` in the studio app.
- Create a single SDK instance (e.g. in [lib/data](apps/studio/lib/data/) or a new `payload-client.ts`):
  - `baseURL`: our app’s API base (e.g. `''` or `window.location.origin` + `/api` depending on how Payload is mounted; with Next same-origin, `/api` is typical).
  - Use generated types from `packages/types/src/payload-types.ts` if the SDK supports a generic for config (e.g. `PayloadSDK<Config>`).
- Ensure Payload’s REST is actually mounted for `forge-graphs` and `video-docs` (e.g. under `/api` via @payloadcms/next). If our custom `/api/graphs` and `/api/video-docs` currently shadow Payload, we either remove them and use `/api/forge-graphs` and `/api/video-docs`, or keep custom routes only for backward compatibility and have the client use SDK against Payload’s paths (if different).

### 4.2 Hooks use SDK instead of studioClient for entities

- **useGraphs:** `queryFn: () => payloadSdk.find({ collection: 'forge-graphs' }).then(r => r.docs)` (or keep full result if UI needs pagination).
- **useGraph(id):** `queryFn: () => payloadSdk.findByID({ collection: 'forge-graphs', id })`.
- **useSaveGraph:** `mutationFn` calls `payloadSdk.update({ collection: 'forge-graphs', id, data: { flow } })`; invalidate `studioKeys.graph(id)` and `studioKeys.graphs()`.
- **useCreateGraph:** Add hook; `mutationFn` calls `payloadSdk.create({ collection: 'forge-graphs', data: { title, flow } })`; invalidate `studioKeys.graphs()`.
- **useVideoDocs / useVideoDoc / useSaveVideoDoc:** Same pattern with `collection: 'video-docs'`.
- **useCreateVideoDoc:** Add hook; `payloadSdk.create({ collection: 'video-docs', data: { title, doc } })`; invalidate list.
- Map SDK response shapes to existing types (ForgeGraphDoc, VideoDocRecord) where needed so the rest of the app doesn’t break.

### 4.3 Custom API client for non-Payload routes

- Keep a small client (e.g. `custom-api-client.ts` or a reduced `studio-client.ts`) for:
  - `GET/POST /api/settings`
  - `GET /api/me`
  - `POST /api/forge/plan`
  - `POST /api/image-generate`, `POST /api/structured-output`
  - Future: render, consolidation, etc.
- These stay as fetch (or a thin wrapper) unless we add OpenAPI/codegen for the Next app; then we could generate a typed client for these routes. For now, a single module with typed methods is enough so that **no component or store calls fetch directly** — they use hooks or callbacks that internally use this client.

### 4.4 Remove raw fetch from components and stores

- **page.tsx:** Use `useGraphs()` and a new `useCreateGraph()` mutation. Initial load: if `lastGraphId` exists, use `useGraph(lastGraphId)` and pass data into graph store; else use `useGraphs().data` to pick first or run `useCreateGraph().mutateAsync()` then set that in the store.
- **VideoWorkspace:** Use `useVideoDocs()` and `useCreateVideoDoc()` for init and “New timeline”. Use `useVideoDoc(id)` and `useSaveVideoDoc()` for load/save; sync server data into [useVideoStore](apps/studio/lib/domains/video/store.ts) for draft edits.
- **lib/store.ts (graph store):** `loadGraph(id)` and `saveGraph()` should **not** call fetch. Either: (a) they call the Payload SDK (or custom client) from inside the store, or (b) prefer having the component call hooks and pass `loadGraph(id)` as a wrapper that uses `queryClient.fetchQuery(studioKeys.graph(id))` and then `setGraph(data)`, and `saveGraph` as a wrapper that runs `useSaveGraph().mutateAsync()`. Option (b) keeps stores as pure draft state and puts all server I/O in hooks; then the component that has the hooks is responsible for calling “load” (e.g. prefetch + setGraph) and “save” (mutation.mutate). Recommendation: **stores only hold draft state**; load/save are performed by the component using hooks and then syncing into the store (or stores call a small “data service” that uses the SDK/custom client, but not raw fetch).
- **lib/domains/video/store.ts:** Same idea: no fetch. Component uses `useVideoDoc(id)`, `useSaveVideoDoc()`, `useCreateVideoDoc()` and syncs to store; or store receives a “save” callback that the component wires to the mutation.

### 4.5 studio-client.ts evolution

- **Option A:** Remove graph and video-doc methods; export only the Payload SDK instance (e.g. `payloadSdk`) and a separate `customApiClient` for me, settings, forge/plan, image-generate, etc.
- **Option B:** Keep one file that re-exports `payloadSdk` and `customApiClient` and document that hooks are the only consumers for server state.

### 4.6 Generated client for Next API (optional)

- For non-Payload routes we could add OpenAPI (or similar) codegen for the Next app and generate a typed client. Then “custom client” is generated instead of hand-written. This is optional and can follow after SDK + hooks are in place.

---

## 5. Documentation and agent guidance

- **AGENTS.md (root):** Add rule: “For Payload-backed entities use @payloadcms/sdk and the TanStack Query hooks in `apps/studio/lib/data/hooks/`. Do not use raw fetch for Payload CRUD. For other API routes use the custom API client. Components and stores must not call fetch or the SDK directly — use the hooks.”
- **docs/decisions.md or new data-and-ui-conventions doc:** State that (1) Payload entity CRUD is done via Payload SDK from the client, (2) all server state flows through TanStack Query hooks that use the SDK or custom client, (3) custom routes (AI, render, settings, me) use the small custom client.
- **docs/how-to/04-data-and-state.md:** Update to describe Payload SDK + hooks; no raw fetch for entity CRUD.
- **errors-and-attempts:** Add a “Don’t: raw fetch for Payload entities; don’t bypass hooks” entry.

---

## 6. What stays as custom routes (and use custom client)

- `/api/me`, `/api/settings`, `/api/model-settings`
- `/api/forge/plan`, `/api/image-generate`, `/api/structured-output`
- Future: Twick render, consolidation, etc.

All of these: call from the client via the **custom API client** (or generated client later), not raw fetch. Hooks can wrap those calls where it helps (e.g. useMe already uses studioClient.getMe).

---

## 7. Files to touch (checklist)

| Area | Action |
|------|--------|
| Dependency | Add `@payloadcms/sdk` in apps/studio |
| Data layer | Add Payload SDK instance; refactor [studio-client.ts](apps/studio/lib/data/studio-client.ts) to SDK + custom client |
| Hooks | Switch [use-graphs](apps/studio/lib/data/hooks/use-graphs.ts), [use-graph](apps/studio/lib/data/hooks/use-graph.ts), [use-save-graph](apps/studio/lib/data/hooks/use-save-graph.ts), [use-video-docs](apps/studio/lib/data/hooks/use-video-docs.ts), [use-video-doc](apps/studio/lib/data/hooks/use-video-doc.ts), [use-save-video-doc](apps/studio/lib/data/hooks/use-save-video-doc.ts) to use SDK; add useCreateGraph, useCreateVideoDoc |
| Page | [app/page.tsx](apps/studio/app/page.tsx): use useGraphs, useGraph, useCreateGraph; no fetch |
| Video | [VideoWorkspace.tsx](apps/studio/components/workspaces/VideoWorkspace.tsx): use useVideoDocs, useVideoDoc, useCreateVideoDoc, useSaveVideoDoc; no fetch |
| Stores | [lib/store.ts](apps/studio/lib/store.ts), [lib/domains/video/store.ts](apps/studio/lib/domains/video/store.ts): remove fetch; load/save via hooks or injected service that uses SDK/custom client |
| API routes | Decide: remove or keep custom `/api/graphs` and `/api/video-docs`; ensure Payload REST is used at `/api/forge-graphs`, `/api/video-docs` for SDK |
| Docs | AGENTS.md, decisions or data-and-ui-conventions, how-to 04, errors-and-attempts |

---

## 8. Hooks “getting hairy” — recommendation

- **One hook layer:** useGraphs, useGraph, useCreateGraph, useSaveGraph, useVideoDocs, useVideoDoc, useCreateVideoDoc, useSaveVideoDoc, useMe, (optional useSettings). These are the only places that know about Payload SDK or custom client.
- **Stores:** Hold only draft state and “dirty” flags. They don’t own load/save; the parent component (or a small coordinator) uses the hooks and syncs server data into the store and triggers save via mutation.
- That way we don’t duplicate fetch/SDK logic and we don’t mix cache and draft in confusing ways — hooks = server state, stores = draft state.
