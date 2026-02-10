---
title: Task breakdown — Creator dashboard (marketing) and Studio minimal platform
created: 2026-02-09
updated: 2026-02-09
---

# Creator dashboard (marketing) and Studio minimal platform

**Initiative id:** `creator-dashboard` (Tier 0)

**Parent:** [STATUS](STATUS.md) · [Product roadmap Platform](../../roadmap/product.mdx) · [ISSUES: Creator dashboard](../../../ISSUES.md)

Full account management on the marketing site (dashboard: my listings, my games, licenses, revenue); Studio exposes only publish/update listing in the app bar.

---

## Lanes and tasks

### Lane: Template evaluation and adoption

Evaluate and adopt a shadcn-based dashboard template for the marketing account/dashboard area.

| id | title | parent | tier | impact | status | doc |
|----|-------|--------|------|--------|--------|-----|
| creator-dash-template-1 | Evaluate shadcn dashboard templates (Kiranism vs Vercel Studio Admin); document choice and migration steps (auth, layout, tables) | creator-dashboard | 3 | Small | open | — |
| creator-dash-template-2 | Adopt chosen template for marketing account area (sidebar, layout, replace or keep Payload auth) | creator-dashboard | 2 | Medium | open | — |

### Lane: API for creator data

Expose current user's listings (and optionally projects) so marketing can display them.

| id | title | parent | tier | impact | status | doc |
|----|-------|--------|------|--------|--------|-----|
| creator-dash-api-1 | GET /api/me/listings (or document Payload REST GET /api/listings?where[creator][equals]=currentUser) for marketing | creator-dashboard | 3 | Small | open | — |

### Lane: Dashboard pages (marketing)

My listings, my games, licenses (existing), revenue; all under /account.

| id | title | parent | tier | impact | status | doc |
|----|-------|--------|------|--------|--------|-----|
| creator-dash-pages-1 | My listings page: list current user's listings (draft + published), link to Studio or edit | creator-dashboard | 2 | Medium | open | — |
| creator-dash-pages-2 | My games page: projects that are or can be listed; link to Studio | creator-dashboard | 2 | Medium | open | — |
| creator-dash-pages-3 | Revenue page: consume GET /api/me/revenue; show earnings and platform fee | creator-dashboard | 3 | Small | open | — |

### Lane: Studio minimal platform

Remove or avoid listing list/catalog/revenue UI in Studio; keep only app bar publish/update.

| id | title | parent | tier | impact | status | doc |
|----|-------|--------|------|--------|--------|-----|
| creator-dash-studio-1 | Studio: ensure only app bar triggers CreateListingSheet (Publish / Update listing); remove or hide any in-Studio listing list/catalog/revenue UI | creator-dashboard | 2 | Medium | open | — |

---

## Reference

- **Initiative:** [task-registry](task-registry.md) · [Product roadmap](../../roadmap/product.mdx) · [ISSUES](../../../ISSUES.md)
- **Process:** [task-breakdown-system.md](task-breakdown-system.md) · [task-registry.md](task-registry.md)
