# Data layer: next-swagger-doc, Swagger UI, generated client, and hooks

## Summary

- **Auto-generate OpenAPI from JSDoc** — use **next-swagger-doc** only; no hand-maintained spec. Annotate each API route in `app/api/` with JSDoc `@swagger` blocks; the spec is generated at runtime/build from the route files.
- **Serve spec and Swagger UI** — `GET /api/docs` returns the OpenAPI JSON (from `createSwaggerSpec`). Swagger UI at `/api-doc` loads that spec (dynamic import of `swagger-ui-react`) so the app has browsable API docs.
- **Generate a typed client from the spec** — feed `/api/docs` (or a generated `openapi.json` file) into **openapi-typescript-codegen** or **@hey-api/openapi-ts** to produce the TS client. One client for the whole app; no Payload SDK, no hand-rolled `studioClient`.
- **Use the generated client everywhere** — hooks call the generated client only; no raw `fetch`. Add missing hooks (e.g. `useCreateGraph`, `useCreateVideoDoc`) and refactor page, VideoWorkspace, and stores to use hooks only.
- **Seamless automation** — run codegen in prebuild or as a Turborepo task so the client stays in sync with API changes; no manual spec maintenance.

---

## 1. Why OpenAPI + codegen (and no Payload SDK)

- Our API surface is **our Next.js routes**: `/api/graphs`, `/api/video-docs`, `/api/graphs/[id]`, `/api/video-docs/[id]`, `/api/me`, `/api/settings`, `/api/forge/plan`, `/api/image-generate`, `/api/structured-output`, `/api/model-settings`, etc. Payload is used only inside those route handlers. So we don’t need a separate “Payload SDK” — we need one typed client for our app’s API.
- **OpenAPI** gives us: (1) a single spec that describes every route, (2) Swagger UI for the app, (3) generated TypeScript client so we don’t hand-write or maintain `studio-client` methods.
- **Codegen** (e.g. `openapi-typescript` + `openapi-fetch`, or `@hey-api/openapi-ts`) produces a small, type-safe fetch client. All hooks use it; components and stores never call `fetch` or the client directly for server state — they use the hooks.

---

## 2. Current vs desired

| What | Current | Desired |
|------|--------|--------|
| API surface | Custom Next routes; hand-rolled [studio-client.ts](apps/studio/lib/data/studio-client.ts) with fetch | **Same routes**; no hand-rolled client. **OpenAPI spec** describes all routes; **generated client** is the only HTTP layer. |
| Swagger | None | **Swagger UI** for the app (e.g. `/api-doc`) from the same OpenAPI spec. |
| Who uses the API? | Mix: some hooks use studioClient, page/VideoWorkspace/stores use raw fetch | **Only hooks** use the generated client. Page, VideoWorkspace, and stores use hooks only. |
| Payload SDK | Not used | **Not used.** We use our generated client against our Next routes (which internally use Payload). |

---

## 3. Implementation plan

### 3.1 Install and wire next-swagger-doc (spec from JSDoc only)

- **Install (apps/studio):** `pnpm add next-swagger-doc swagger-ui-react -D`
- **Create `lib/swagger.ts`:**
  - Import `createSwaggerSpec` from `next-swagger-doc`.
  - Export async `getApiDocs()` that returns `createSwaggerSpec({ apiFolder: 'app/api', definition: { openapi: '3.0.0', info: { title: 'Studio API', version: '1.0' } } })`.
- **Add route handler** `app/api/docs/route.ts`:
  - `GET` calls `getApiDocs()` and returns `NextResponse.json(spec)`.
  - Visiting `/api/docs` returns the OpenAPI JSON (no hand-maintained file).
- **Annotate every API route** with JSDoc so the spec is complete. Example pattern in each route file (e.g. `app/api/graphs/route.ts`):

```ts
/**
 * @swagger
 * /api/graphs:
 *   get:
 *     summary: List graphs
 *     tags: [graphs]
 *     responses:
 *       200:
 *         description: Success
 *   post:
 *     summary: Create graph
 *     tags: [graphs]
 *     requestBody: { content: { application/json: { schema: { ... } } } }
 *     responses:
 *       200:
 *         description: Created
 */
export async function GET() { ... }
export async function POST(request: NextRequest) { ... }
```

- Apply the same pattern to: `app/api/graphs/[id]/route.ts`, `app/api/video-docs/route.ts`, `app/api/video-docs/[id]/route.ts`, `app/api/me/route.ts`, `app/api/settings/route.ts`, `app/api/model-settings/route.ts`, `app/api/forge/plan/route.ts`, `app/api/image-generate/route.ts`, `app/api/structured-output/route.ts`. Tags: `graphs`, `video-docs`, `auth`, `settings`, `model`, `ai`. No separate YAML/JSON spec file.

### 3.2 Swagger UI page

- **Route:** `app/api-doc/page.tsx` (or `app/swagger/page.tsx`).
- **Implementation:** Use `swagger-ui-react`; load the spec from `/api/docs` (e.g. `url: '/api/docs'`). Use **dynamic import** for `swagger-ui-react` so it only runs on the client and avoids SSR issues (e.g. `const SwaggerUI = dynamic(() => import('swagger-ui-react').then(m => m.default), { ssr: false })`).
- Result: humans and agents can open `/api-doc` to explore and try the API.

### 3.3 Generate typed client (openapi-typescript-codegen or @hey-api/openapi-ts)

- **Install (apps/studio):** `pnpm add -D openapi-typescript-codegen` (or `@hey-api/openapi-ts` for Next.js–optimized output).
- **Script in package.json:**
  - **Option A (dev server required):** `"generate-client": "openapi-typescript-codegen --input http://localhost:3000/api/docs --output ./lib/api-client --client fetch"`. Run after `pnpm dev` is up (or in a script that starts dev, waits for ready, runs codegen).
  - **Option B (CI/build friendly):** Add a small Node script that imports `getApiDocs` from `@/lib/swagger`, calls it, and writes the result to `openapi.json` (e.g. in project root or `lib/`). Then: `"generate-spec": "node scripts/generate-openapi.mjs"`, `"generate-client": "openapi-typescript-codegen --input ./openapi.json --output ./lib/api-client --client fetch"`. No running server needed; use in `postbuild` or Turborepo.
- **Output:** `apps/studio/lib/api-client/` (or `./lib/api-client` relative to studio app). Generated client is the single HTTP layer; base URL can be left default (same-origin) or set via env in the generated client wrapper.
- **Usage:** After codegen, use the client in hooks (e.g. `api.graphs.getGraphs()`, `api.graphs.createGraph(...)` — exact names depend on generator). Full autocomplete and type safety.

### 3.4 Automation (seamless sync)

- **Regenerate on API changes:** Run client codegen as part of build or a dedicated task so the client never drifts.
  - **prebuild:** e.g. `"prebuild": "pnpm generate-spec && pnpm generate-client"` (if using Option B), or `"build": "pnpm generate-client && next build"` when using Option A with a script that ensures spec is available.
  - **Turborepo:** Add a `codegen` task (or `generate-client`) that depends on route files; run it before `build`. Other packages don’t need to run it.
- **Developer workflow:** After changing any route in `app/api/`, add/update JSDoc for that route, then run `pnpm generate-client` (or rely on prebuild). No manual spec file to edit.

### 3.4 Hooks use the generated client only

- Replace all usage of [studio-client.ts](apps/studio/lib/data/studio-client.ts) (graphs, video-docs, me) with calls to the generated client. For example:
  - **useGraphs:** `queryFn: () => generatedClient.getGraphs()` (or equivalent generated method).
  - **useGraph(id):** `queryFn: () => generatedClient.getGraphById(id)`.
  - **useSaveGraph:** `mutationFn` calls `generatedClient.patchGraph(id, { flow })`; invalidate `studioKeys.graph(id)` and `studioKeys.graphs()`.
  - **useCreateGraph:** Add hook; `mutationFn` calls `generatedClient.postGraph({ title, flow })`; invalidate `studioKeys.graphs()`.
  - Same for video-docs: use generated `getVideoDocs`, `getVideoDocById`, `patchVideoDoc`, `postVideoDoc`.
  - **useMe:** use generated `getMe` (or equivalent).
- Add **useCreateGraph** and **useCreateVideoDoc** if not present. All hooks live in [apps/studio/lib/data/hooks/](apps/studio/lib/data/hooks/); they are the only place that import and call the generated client.

### 3.5 Deprecate / remove hand-rolled studio-client

- Once the generated client is wired into hooks, **remove** (or reduce) the graph/video/me methods from [studio-client.ts](apps/studio/lib/data/studio-client.ts). Either:
  - **Remove studio-client** and have hooks import the generated client directly, or
  - **Re-export** the generated client as `studioClient` for a single entry point and document that “studio client” is now the codegen client. No hand-written fetch for any route.

### 3.6 Remove raw fetch from components and stores

- **page.tsx:** Use `useGraphs()`, `useGraph(lastGraphId)`, and `useCreateGraph()`. No raw fetch; initial load and “create if empty” go through hooks.
- **VideoWorkspace:** Use `useVideoDocs()`, `useVideoDoc(id)`, `useCreateVideoDoc()`, `useSaveVideoDoc()`. No raw fetch for list, create, or load/save.
- **lib/store.ts (graph store):** `loadGraph(id)` and `saveGraph()` must not call fetch. Prefer: component uses hooks and syncs server data into the store; save is triggered via `useSaveGraph().mutate()`. Store holds only draft state; load/save are orchestrated by the component using the hooks (or the store receives an injected “api” that is the generated client, but still no raw fetch).
- **lib/domains/video/store.ts:** Same: no fetch; component uses hooks and syncs to store; save via `useSaveVideoDoc().mutate()`.

### 3.7 Settings, model-settings, AI routes

- Document in OpenAPI: `GET/POST /api/settings`, `GET/POST /api/model-settings`, `POST /api/forge/plan`, `POST /api/image-generate`, `POST /api/structured-output`. Generate client methods for them. Any component that currently fetches these (e.g. SettingsSheet, model-router store, AppShell) should use the generated client via a hook or a small wrapper that uses the client — no raw fetch.

---

## 4. Routes to annotate with JSDoc (spec scope)

Annotate all of these in `app/api/` so next-swagger-doc picks them up and the generated client covers them:

| Route | Methods | Notes |
|-------|--------|--------|
| `/api/graphs` | GET, POST | List; create. Response types align with ForgeGraph. |
| `/api/graphs/{id}` | GET, PATCH | Get one; update (e.g. flow). |
| `/api/video-docs` | GET, POST | List; create. |
| `/api/video-docs/{id}` | GET, PATCH | Get one; update (e.g. doc). |
| `/api/me` | GET | Auth; 401 → { user: null }. |
| `/api/settings` | GET, POST | Settings overrides. |
| `/api/model-settings` | GET, POST | Model router config. |
| `/api/forge/plan` | POST | AI plan request/response. |
| `/api/image-generate` | POST | AI image. |
| `/api/structured-output` | POST | AI structured output. |
| Future (render, etc.) | As needed | Add route + JSDoc, then run generate-client. |

No separate Payload API; our routes are the contract. Annotate each route with JSDoc; the codegen “includes” those routes once they have @swagger JSDoc; regenerate client after API changes.

---

## 5. Tooling (no manual spec)

- **Spec:** **next-swagger-doc** only. No hand-maintained YAML/JSON; annotate routes with JSDoc; spec is generated from `app/api/` via `createSwaggerSpec({ apiFolder: 'app/api', ... })`.
- **Spec endpoint:** `GET /api/docs` → JSON (route handler that returns `getApiDocs()`).
- **Swagger UI:** **swagger-ui-react** (dynamic import), page at `/api-doc`, loads spec from `/api/docs`.
- **Codegen:** **openapi-typescript-codegen** or **@hey-api/openapi-ts**; input = `http://localhost:3000/api/docs` (dev) or a generated `openapi.json` file (CI/build); output = `./lib/api-client`; client = fetch. Regenerate via `pnpm generate-client` (and optionally `pnpm generate-spec` when using file input).

---

## 6. Documentation and agent guidance

- **AGENTS.md (root):** Add rule: “All API access goes through the OpenAPI-generated client. Use the TanStack Query hooks in `apps/studio/lib/data/hooks/` for server state. Do not use raw fetch or hand-rolled API methods. The OpenAPI spec is in …; regenerate the client with `pnpm generate-client` after route/JSDoc changes. Spec is auto-generated from JSDoc (next-swagger-doc). Swagger UI at `/api-doc`, spec at `/api/docs`.”
- **docs/decisions.md or data-and-ui-conventions:** State that (1) the app API is described by OpenAPI and consumed via the generated client, (2) all server state flows through TanStack Query hooks that use that client, (3) no raw fetch in components or stores.
- **docs/how-to/04-data-and-state.md:** Update to describe OpenAPI → generated client → hooks; no raw fetch.
- **errors-and-attempts:** Add a “Don’t: raw fetch for API; don’t bypass the generated client or hooks” entry.

---

## 7. Files to touch (checklist)

| Area | Action |
|------|--------|
| Spec + docs | Install `next-swagger-doc` and `swagger-ui-react`; add `lib/swagger.ts` (getApiDocs) and `app/api/docs/route.ts` (GET → spec JSON); annotate all routes in `app/api/` with @swagger JSDoc. |
| Swagger UI | Add `app/api-doc/page.tsx`; dynamic import `swagger-ui-react`, load spec from `/api/docs`. |
| Codegen | Install `openapi-typescript-codegen` or `@hey-api/openapi-ts`; add script `generate-client` (input: `http://localhost:3000/api/docs` or `./openapi.json`; output: `./lib/api-client`; client: fetch). Optionally `generate-spec` script that writes openapi.json for CI. Hook into prebuild or Turborepo so client stays in sync. |
| Hooks | Refactor all hooks in [apps/studio/lib/data/hooks/](apps/studio/lib/data/hooks/) to use the generated client; add useCreateGraph, useCreateVideoDoc. |
| studio-client | Remove or reduce to re-export of generated client; no hand-written fetch for any route. |
| Page | [app/page.tsx](apps/studio/app/page.tsx): use useGraphs, useGraph, useCreateGraph only; no fetch. |
| Video | [VideoWorkspace.tsx](apps/studio/components/workspaces/VideoWorkspace.tsx): use useVideoDocs, useVideoDoc, useCreateVideoDoc, useSaveVideoDoc; no fetch. |
| Stores | [lib/store.ts](apps/studio/lib/store.ts), [lib/domains/video/store.ts](apps/studio/lib/domains/video/store.ts): no fetch; load/save via hooks or injected client. |
| Settings / AI | [SettingsSheet.tsx](apps/studio/components/settings/SettingsSheet.tsx), [SettingsHydration.tsx](apps/studio/components/settings/SettingsHydration.tsx), [lib/model-router/store.ts](apps/studio/lib/model-router/store.ts), [AppShell.tsx](apps/studio/components/AppShell.tsx): use generated client (via hook or wrapper); no raw fetch. |
| Docs | AGENTS.md, decisions or data-and-ui-conventions, how-to 04, errors-and-attempts. |

---

## 8. Hooks and stores (unchanged)

- **One hook layer:** useGraphs, useGraph, useCreateGraph, useSaveGraph, useVideoDocs, useVideoDoc, useCreateVideoDoc, useSaveVideoDoc, useMe, (optional useSettings). They are the only consumers of the generated client.
- **Stores:** Hold only draft state and dirty flags; they don’t own HTTP. The component that has the hooks syncs server data into the store and triggers save via mutations.
