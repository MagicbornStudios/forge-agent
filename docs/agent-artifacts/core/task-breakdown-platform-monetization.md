---
title: Task breakdown — Platform monetization (clone/download)
created: 2026-02-08
updated: 2026-02-08
---

# Platform: monetization (clone/download)

**Initiative id:** `platform-mono` (Tier 0)

**Parent:** [STATUS § Next #4](./STATUS.md) · [MVP and first revenue](../../product/mvp-and-revenue.mdx)

Clone to user/org for a price; or download build/template/Strategy core. Listings, checkout, Stripe Connect or similar. First revenue = first paid clone end-to-end.

---

## Lanes and tasks

### Lane: Plan/capabilities (Tier 1)

Extend `user.plan` and `CAPABILITIES` to gate platform features (who can list, who can clone/download paid).

| id | title | parent | tier | impact | status | doc |
|----|-------|--------|------|--------|--------|-----|
| platform-mono-cap-1 | Add PLATFORM_LIST capability and gate listing UI | platform-mono | 3 | Small | done | [entitlements](../../packages/shared/src/shared/entitlements) |
| platform-mono-cap-2 | Add PLATFORM_MONETIZE to CAPABILITIES and plan check | platform-mono | 3 | Small | done | [decisions](./decisions.md) |
| platform-mono-cap-3 | Wire plan to entitlements store for platform gates | platform-mono | 3 | Small | done | — |

### Lane: Listings (Tier 1)

Catalog and creator listings; create/update/delete listing.

| id | title | parent | tier | impact | status | doc |
|----|-------|--------|------|--------|--------|-----|
| platform-mono-list-1 | Listings API: Payload collection + GET /api/listings (published only) | platform-mono | 2 | Medium | done | — |
| platform-mono-list-2 | Listings UI: catalog page (public grid at /catalog) | platform-mono | 2 | Medium | done | — |
| platform-mono-list-2b | Create listing flow (Studio or marketing account) | platform-mono | 2 | Medium | done | — |

### Lane: Checkout (Tier 1)

Payment session and redirects.

| id | title | parent | tier | impact | status | doc |
|----|-------|--------|------|--------|--------|-----|
| platform-mono-check-1 | Checkout session API (Stripe or similar) | platform-mono | 2 | Medium | open | — |
| platform-mono-check-2 | Checkout UI and success/cancel redirect | platform-mono | 2 | Medium | open | — |

### Lane: Clone flow (Tier 1)

Clone-to-account and post-purchase.

| id | title | parent | tier | impact | status | doc |
|----|-------|--------|------|--------|--------|-----|
| platform-mono-clone-1 | Clone-to-account API (copy project to buyer) | platform-mono | 2 | Medium | open | [mvp-and-revenue](../../product/mvp-and-revenue.mdx) |
| platform-mono-clone-2 | Clone confirmation and post-purchase UI | platform-mono | 2 | Medium | open | — |

### Lane: Payouts (Tier 1)

Creator payouts and revenue share.

| id | title | parent | tier | impact | status | doc |
|----|-------|--------|------|--------|--------|-----|
| platform-mono-pay-1 | Stripe Connect (or similar) onboarding for creators | platform-mono | 2 | Medium | open | — |
| platform-mono-pay-2 | Payout and revenue-share tracking | platform-mono | 2 | Medium | open | — |

---

## Reference

- **Initiative:** [STATUS § Next #4](STATUS.md) · [product roadmap Platform (future)](../../roadmap/product.mdx)
- **Process:** [task-breakdown-system.md](./task-breakdown-system.md) · [task-registry.md](./task-registry.md)
