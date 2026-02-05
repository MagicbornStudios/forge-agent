---
name: Marketing cleanup and integrations
overview: Clean up the marketing app with a clear component structure (atoms/molecules/organisms), add logged-in sidebar (shadcn sidebar-08), integrate minimal Stripe and email (Resend), add Payload jobs for announcement scheduling, extend seeds, and document everything in internal how-tos.
todos: []
isProject: false
---

# Marketing site cleanup, integrations, and docs

## 1. Component structure (atoms / molecules / organisms)

Mirror the workspace pattern in [packages/shared/src/shared/components/workspace/README.md](packages/shared/src/shared/components/workspace/README.md) but keep marketing lightweight: no custom "MarketingButton"; use shadcn via `@forge/ui` as atoms and build up.

**Proposed layout under `apps/marketing/components/`:**

- **Atoms** — Use `@forge/ui` directly (Button, Card, Input, Label, etc.). No new atom components unless we add a shadcn primitive (e.g. Sidebar) that does not exist in `@forge/ui` yet.
- **Molecules** — Reusable composites:
  - `HeroSection` — title, description, CTA buttons (extract from current landing).
  - `FeatureCard` / `PricingCard` — card + title + text + optional CTA (from landing features/pricing).
  - `DocNavSidebar` — sidebar nav list for docs (already in docs layout; can move to a molecule).
- **Organisms** — Full sections or shells:
  - `MarketingHeader` — existing; keep in `organisms/` (or `layout/`).
  - `PromotionsBanner` — existing; move to `organisms/`.
  - `MarketingSidebar` — **new**: logged-in app sidebar (based on sidebar-08), with nav: Account, Billing, Open app, Docs, etc.
  - `AuthProvider` — stays as a provider; can live in `providers/` or `organisms/`.

Add `**apps/marketing/components/README.md**` (and optionally `AGENTS.md`) describing this structure and conventions, and an **index.ts** (or index per folder) for clean imports.

**Where to add sidebar-08:** Run `npx shadcn@latest add sidebar-08` **in the marketing app** (`apps/marketing`). That will add the Sidebar primitive + the block to the app. Use it inside a new **MarketingSidebar** organism that shows only when the user is logged in.

**Logged-in layout change:** Keep one `(marketing)` layout. When `useAuth().user` is set, render **MarketingSidebar** (e.g. collapsible sidebar) alongside `main`; when not logged in, keep current header + main only. The header can stay as-is (it already shows Account / Billing / Open app when logged in); the sidebar gives a dedicated nav rail for account, billing, docs, and "Open app" for logged-in users.

---

## 2. Sidebar (sidebar-08) and logged-in shell

- Run `npx shadcn@latest add sidebar-08` in `apps/marketing` (adds Sidebar component(s) and the block).
- Create **MarketingSidebar** organism that:
  - Uses the sidebar-08 block structure (or simplified variant) with nav groups: Main (Account, Billing, Open app), Docs, etc.
  - Reads `useAuth().user`; only render when user is non-null (or render sidebar shell with "Log in" in footer).
- Update `**(marketing)/layout.tsx**`: render a wrapper that conditionally shows sidebar + main when logged in. Use a client wrapper (e.g. `MarketingShell`) that uses `useAuth()` and renders either:
  - `[Header] + [Sidebar + main]` (logged in), or
  - `[Header] + [main]` (not logged in).

Sidebar content: Account, Billing, Open app (external link), Docs; optional footer with user email or logout. Use existing `getStudioApiUrl()` for "Open app" href.

---

## 3. Seeds

Extend [apps/studio/payload/seed.ts](apps/studio/payload/seed.ts):

- **Promotions:** Create 1–2 sample promotions (e.g. "Welcome" with `active: true`, optional one with `startsAt`/`endsAt` for testing).
- **Waitlist / newsletter:** Optionally 1–2 seed entries so Admin has visible data (e.g. `seed@forge.local`).

Keep seed idempotent (e.g. `ensurePromotion` by title or slug if you add one).

---

## 4. Announcements and scheduling (Payload Jobs)

- **Current state:** [apps/studio/payload/collections/promotions.ts](apps/studio/payload/collections/promotions.ts) already has `active`, `startsAt`, `endsAt`. The API filters by these; no cron yet.
- **Minimal scheduling:** Use **Payload Jobs** with `waitUntil` to activate/deactivate promotions at a given time:
  - Add a **Task** (e.g. `activatePromotion`) that takes `promotionId`, loads the doc, sets `active: true`, saves.
  - Add a **Task** (e.g. `deactivatePromotion`) that sets `active: false`.
  - In **promotions** `afterChange` hook: if `startsAt` is in the future, queue a job with `task: 'activatePromotion'`, `input: { promotionId: doc.id }`, `waitUntil: new Date(doc.startsAt)`. If `endsAt` is set, queue `deactivatePromotion` with `waitUntil: new Date(doc.endsAt)`.
- **Payload config:** Add `jobs: { tasks: { activatePromotion: ... }, ... }` (and workflows if needed) in [apps/studio/payload.config.ts](apps/studio/payload.config.ts). Payload 3 Jobs require a long-running process (not serverless); document that for Vercel we’d need an external cron hitting an API that queues the job, or use a different host for the worker.
- **Recurring "cron":** For a daily check (e.g. activate all promotions where `startsAt <= now` and `active === false`), the cheapest minimal option is an external cron (e.g. Vercel Cron or a small server) calling a Studio API route that runs the same logic or queues jobs. Document this in the how-to; do not implement a full cron in this slice if not required.

---

## 5. Email / newsletter (minimal)

- **Choice:** Resend (simple API, free tier ~100 emails/day). Alternative: SendGrid or Mailchimp free tier; prefer the one with the smallest setup (single API key, one endpoint).
- **Scope:**
  - **Storage:** Keep using Payload `newsletter-subscribers` (and waitlist). No change.
  - **Sending:** One optional "welcome" email when a user subscribes (POST to Resend from Studio API route or from a Payload `afterChange` hook on `newsletter-subscribers`). If no welcome needed initially, skip and only document the env + how to add it.
- **Implementation:**
  - Studio: add `POST /api/newsletter/welcome` (or similar) that accepts `subscriberId` or email and sends one transactional email via Resend; or call Resend in the existing `POST /api/newsletter` after creating the doc (minimal).
  - Env: `RESEND_API_KEY` (and optionally `FROM_EMAIL`). Document in how-to.
- **No** custom dashboard or campaign builder; keep it minimal.

---

## 6. Stripe (minimal)

- **Flow:** Stripe Checkout (hosted). No Stripe Elements or custom form in our app.
- **Studio:**
  - New route `POST /api/stripe/create-checkout-session`: body `{ priceId?: string, successUrl?, cancelUrl? }`; create Stripe Checkout Session, return `{ url }`. Use `STRIPE_SECRET_KEY` and a default `STRIPE_PRICE_ID_PRO` (or single price ID) from env.
  - New route `POST /api/stripe/webhook`: Stripe webhook (checkout.session.completed, etc.); identify user (e.g. `client_reference_id` or metadata with `userId`), update `user.plan` to `'pro'` via Payload. Use `STRIPE_WEBHOOK_SECRET`.
- **Marketing billing page:** "Upgrade" button calls Studio `POST /api/stripe/create-checkout-session` (with credentials if we pass current user id), then redirect to `url`. After payment, redirect to `successUrl` (e.g. `/billing?success=1`).
- **Docs:** Env vars, webhook registration (Stripe CLI for local), and that we only update `user.plan` (no invoices or portal in v1).

---

## 7. Internal how-tos (documentation)

Add new how-to guides under `docs/how-to/` and link them from [docs/how-to/00-index.mdx](docs/how-to/00-index.mdx):


| File                                          | Content                                                                                                                                                                                        |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **10-marketing-site.mdx**                     | Marketing app overview: routes, layout, header vs sidebar (logged-in), auth boundary (Studio), CORS/cookie notes. Point to atoms/molecules/organisms README.                                   |
| **11-marketing-auth.mdx**                     | Auth: Payload users, login (`POST /api/users/login`), cookie, `useAuth` on marketing, CORS and same-site/cookie domain for cross-origin.                                                       |
| **12-marketing-stripe.mdx**                   | Stripe: Checkout Session creation, webhook handler, updating `user.plan`; env (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID_PRO`); minimal flow and testing with Stripe CLI. |
| **13-marketing-email-newsletter.mdx**         | Email/newsletter: Resend (or chosen provider), env (`RESEND_API_KEY`), optional welcome email on subscribe; list stored in Payload; no campaign UI.                                            |
| **14-marketing-announcements-scheduling.mdx** | Announcements: promotions collection, `startsAt`/`endsAt`, Payload Jobs with `waitUntil` for activate/deactivate; where to queue (hooks); limitation on serverless (cron alternative).         |


Update **00-index.mdx** with a row for "Marketing site" and links to 10–14.

---

## 8. Code and config cleanup

- **Marketing:** Move existing components into the new folder structure (e.g. `organisms/MarketingHeader.tsx`, `organisms/PromotionsBanner.tsx`, `providers/AuthProvider.tsx` or keep under `components/` with subdirs). Ensure no duplicate or dead code; single place for API base URL and auth types.
- **Studio:** Centralize env usage (Stripe, Resend) and document in a single `.env.example` or in the how-tos. Ensure Payload collections (promotions, waitlist, newsletter) have consistent access control and that new API routes (Stripe, optional Resend) follow the "one API boundary" rule (client talks only to our routes).
- **Seeds:** As above; keep seed runnable and idempotent.

---

## 9. Summary checklist

- Reorganize marketing components (atoms = @forge/ui, molecules = HeroSection, FeatureCard, PricingCard, DocNavSidebar, organisms = MarketingHeader, PromotionsBanner, MarketingSidebar); add README (+ optional AGENTS.md).
- Add sidebar: `npx shadcn@latest add sidebar-08` in marketing app; implement MarketingSidebar organism; when logged in, show sidebar + main in layout.
- Seeds: 1–2 promotions, optional waitlist/newsletter entries in Studio seed.
- Payload Jobs: tasks `activatePromotion` / `deactivatePromotion`; queue from promotion hooks with `waitUntil` for startsAt/endsAt; document serverless limitation.
- Email: Resend (or minimal alternative), env, optional welcome on subscribe; document in 13-marketing-email-newsletter.
- Stripe: Checkout Session route + webhook in Studio; update user.plan; billing page "Upgrade" redirects to Checkout; document in 12-marketing-stripe.
- Internal how-tos: 10–14 (marketing overview, auth, Stripe, email, announcements/scheduling); update 00-index.

All choices favor **minimal and cheap** to get running quickly; docs and structure stay clear so we can swap or extend later.