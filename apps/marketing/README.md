# Forge Marketing Site

Consumer-facing marketing app: landing, docs, login, account, billing, waitlist, newsletter.

## Setup

1. **Env**: Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_STUDIO_APP_URL` to your Studio app URL (e.g. `http://localhost:3000` when Studio runs on 3000).
2. **Run Studio first**: Marketing calls Studio APIs (auth, waitlist, newsletter, promotions). Start Studio with `pnpm dev:studio` then start marketing with `pnpm dev:marketing` (runs on port 3001).
3. **Cross-origin**: If marketing and Studio are on different origins, configure CORS on Studio for the marketing origin and ensure auth cookies use a shared parent domain (e.g. `.example.com`) so login works across both.

## Routes

- `/` — Landing
- `/docs`, `/docs/[slug]` — Consumer docs (content in `content/docs/`)
- `/login` — Log in (Payload `POST /api/users/login` on Studio)
- `/account`, `/billing` — Logged-in only; link to Open app (Studio)
- `/waitlist`, `/newsletter` — Public forms → Studio API → Payload

## Payload (Studio)

Collections used: `waitlist`, `newsletter-subscribers`, `promotions`. Manage in Studio Admin at `/admin`.
