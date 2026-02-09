---
title: Enhanced features backlog
---

# Enhanced features / ideas backlog

Living log: agents (or humans) propose ideas here; humans triage; we implement when status is `accepted`. **Do not implement** items with status `proposed` until a human sets status to `accepted`.

## Process

1. **Agent (or human)** adds an entry below with status `proposed`.
2. **Human** reviews backlog; sets status to `accepted` or `rejected`; optionally assigns priority or adds to STATUS § Next.
3. When a backlog item is set to **accepted**, add it to [STATUS.md](./STATUS.md) § Next with an **impact size** (Small / Medium / Large / Epic).
4. **Agent or human** implements when status is `accepted`; sets status to `implemented` and adds optional Link to PR/slice.

Agents must not implement proposed items until a human sets `accepted`.

## Format per entry

- **Title** — Short name.
- **Context** — Where/when (e.g. "Dialogue editor", "Settings panel").
- **Suggestion** — What to do (library, UX, DX).
- **Status** — `proposed` | `accepted` | `rejected` | `implemented`.
- **Date** — YYYY-MM-DD.
- **Link** — Optional; PR or slice reference when implemented.

---

## Business / operations backlog (to figure out)

Items to figure out later (not product features; legal, ops, strategy). Not implemented in pay-1a or immediate slices.

- Legal (incorporation, terms, privacy, IP).
- Incorporation, shares, equity.
- Fundraising strategy and tools; bootstrapping.
- Revenue and projections.
- Marketing campaigns and ideas.
- How to use/install tech and keep it lean with coding agents.
- Offerings centered around the core product and platform.
- Developer program: usage metrics and complexity formula for approved-editor payouts.
- App store for community/official editors (listings, install, apply for official).
- GitHub fork and private-repo submission flow for paid users.

---

## Entries

(Add new entries at the top; append-only.)

### Usage-based payouts for approved editors
- **Title** — Usage-based payouts for approved editors.
- **Context** — Developer program; Stripe Connect.
- **Suggestion** — Measure usage of each approved third-party editor; assign value by usage and complexity; recurring payouts via Connect. See docs/business/developer-program-and-editors.mdx and revenue-and-stripe.mdx.
- **Status** — proposed.
- **Date** — 2026-02-09.

### Approved editor data contracts
- **Title** — Approved editor data contracts.
- **Context** — Developer program; platform contract.
- **Suggestion** — Define schemas/contracts for data produced and consumed by approved editors; third-party approved editors can produce new data types and consume from installed approved editors.
- **Status** — proposed.
- **Date** — 2026-02-09.

### Community editor listings
- **Title** — Community editor listings.
- **Context** — Developer program; app store.
- **Suggestion** — Allow developers to list community (unofficial) editors; users can install; no payouts; clone applies to projects using community editors.
- **Status** — proposed.
- **Date** — 2026-02-09.

### Developer submission (GitHub fork for paid)
- **Title** — Developer submission (GitHub fork for paid).
- **Context** — Developer program; submission.
- **Suggestion** — App submission = GitHub repo (private); we fork (or mirror) for paid users so they get the app; developer can list in community and/or apply for official integration.
- **Status** — proposed.
- **Date** — 2026-02-09.

### Testimonials section
- **Title** — Testimonials section.
- **Context** — Marketing landing page.
- **Suggestion** — Add a landing section for quotes/case studies. STATUS Part B explicitly deferred testimonials; backlog tracks as future.
- **Status** — rejected.
- **Note** — Not desired per product decision.
- **Date** — 2026-02-07.

### Marketing analytics
- **Title** — Marketing analytics.
- **Context** — Marketing site (landing, pricing, signup funnel).
- **Suggestion** — Event tracking or integration (e.g. Plausible, Posthog) for landing, pricing, and signup funnel.
- **Effort** — Small. Add script or SDK in root layout; optional custom events on waitlist, pricing, primary CTA. Env var for key/domain; no backend.
- **Status** — implemented.
- **Date** — 2026-02-07.
- **Link** — PostHog in apps/marketing (instrumentation-client.ts init when NEXT_PUBLIC_POSTHOG_KEY set); lib/analytics.ts trackEvent; Waitlist Signup event on success; .env.example and README. Studio uses PostHog for feature flags (e.g. video-editor-enabled).

### CTA and copy A/B
- **Title** — CTA and copy A/B.
- **Context** — Marketing Hero and key copy.
- **Suggestion** — Document or tooling for testing Hero CTAs and key copy (A/B or variants).
- **Status** — proposed.
- **Date** — 2026-02-07.
