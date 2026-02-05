# Tech stack and “why we use it” / “why we don’t”

Reference for agents and humans. Update when adding or removing major choices.

---

## Stack (Studio)

| Area | Choice | Why we use it |
|------|--------|----------------|
| Framework | Next.js (App Router) | SSR, API routes, single deployment. |
| Server CMS/DB | Payload + SQLite | Type-safe schema, local-first, REST/GraphQL available server-side only. |
| Client server-state | TanStack Query (React Query) | Caching, deduping, loading/error, invalidation; one data layer for all server-state. |
| Client UI/draft state | Zustand | Lightweight, works with React; used for drafts and app shell route. |
| Persistence (client) | localStorage (versioned keys) | App shell route and last document ids; no backend required. |
| AI/chat | CopilotKit + OpenRouter | Agent UX and model routing. |
| Styling | Tailwind + shadcn (packages/ui) | Consistent design system. |
| Shared workspace | packages/shared (WorkspaceShell, slots) | Single layout/contract for Forge, Video, etc. |

---

## Why we don’t

- **No direct Payload REST/GraphQL from the browser.** All server-state goes through our Next API routes. This keeps one client boundary, simplifies auth/CORS, and makes it easy to add other backends (platform, billing) later without changing the client.
- **No “just Zustand + fetch” for server-state.** We’d reimplement caching identity, invalidation, loading/error, and retries; TanStack Query provides this in one place.
- **No multiple DBs or backends in the client contract yet.** We use one Payload schema/DB; when we split, the client still talks only to Next API routes.

---

## Where things live

- **Query keys and API clients:** `apps/studio/lib/data/keys.ts`, `studio-client.ts`, `platform-client.ts`
- **Hooks:** `apps/studio/lib/data/hooks/` (`useGraphs`, `useGraph`, `useSaveGraph`, `useVideoDocs`, `useVideoDoc`, `useSaveVideoDoc`)
- **Persistence keys:** `apps/studio/lib/persistence/local-storage.ts`
- **Decisions and rationale:** **docs/decisions.md**
