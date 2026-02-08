---
title: Enhanced features backlog
---

# Enhanced features / ideas backlog

Living log: agents (or humans) propose ideas here; humans triage; we implement when status is `accepted`. **Do not implement** items with status `proposed` until a human sets status to `accepted`.

## Format per entry

- **Title** — Short name.
- **Context** — Where/when (e.g. "Dialogue editor", "Settings panel").
- **Suggestion** — What to do (library, UX, DX).
- **Status** — `proposed` | `accepted` | `rejected` | `implemented`.
- **Date** — YYYY-MM-DD.
- **Link** — Optional; PR or slice reference when implemented.

---

## Entries

(Add new entries at the top; append-only.)

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
