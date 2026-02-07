---
name: Next steps tracking and impact sizing
overview: Make "what can I do next?" answerable for contributors and agents by tracking all next steps (including platform, settings, paywall) in STATUS and roadmap with impact sizes; add a single entry point and agent-strategy rules to reduce overlap and merge conflicts.
todos: []
isProject: false
---

# Next steps tracking and impact sizing

## Goal

When someone (or a coding agent) enters the repo and asks **"what can I do next?"**, they get a clear, single-place answer. All known next steps—including the deferred platform/settings/paywall work—are **tracked with impact sizes** so contributors and agents know scope, can pick work without overlap, and we reduce merge conflicts and confusion.

## Principles

- **One canonical list of "next" work**: STATUS **Next** section is the primary list; product roadmap and enhanced-features backlog link from it and stay in sync.
- **Impact size on every item**: Each next step has a size (Small / Medium / Large / Epic) so agents and humans know scope before starting.
- **Agent strategy says where to look**: Strategy doc and index tell agents to read STATUS Next (and roadmap) to answer "what can I do next?" and to prefer **one slice per item** to reduce overlap.

---

## 1. Define impact sizes (where they live)

**Add a short "Impact sizes" block** to [docs/agent-artifacts/core/STATUS.md](docs/agent-artifacts/core/STATUS.md) (e.g. right after the **Next** heading or in a small subsection before the list):

- **Small** — Single area, few files, one PR (e.g. add a capability constant, gate one UI surface).
- **Medium** — One clear slice across API + UI or data (e.g. project-scoped settings API + one settings surface).
- **Large** — Multi-slice, multiple areas (e.g. publish/host pipeline: build artifact, storage, playable runtime).
- **Epic** — Multi-week, many slices and docs (e.g. full platform monetization: listing, checkout, clone, payouts).

Use these labels in the **Next** list and in the roadmap so every item has a size.

---

## 2. STATUS Next: add platform/settings/paywall items with sizes

**Expand the "Next" section** in [docs/agent-artifacts/core/STATUS.md](docs/agent-artifacts/core/STATUS.md) so it includes:

- **Existing items** (keep current numbering or reorder), each with an impact size.
- **New items** from the platform/settings plan, with sizes:
  - **Project-scoped settings** — Add `project` scope (or scopeId = projectId) to settings-overrides and GET/POST; project-level defaults shared by project members. **Impact: Medium.**
  - **Platform: publish and host builds** — Authors publish project build; we host playable narrative. Build pipeline, storage, playable runtime. **Impact: Large.**
  - **Platform: monetization (clone / download)** — Clone to user/org for a price; or download build. Listings, checkout, Stripe Connect or similar. **Impact: Epic.**
  - **Plans/capabilities for platform** — Extend `user.plan` and `CAPABILITIES` to gate platform features (e.g. publish, monetize). **Impact: Small** (capability constants + PLAN_CAPABILITIES) to **Medium** (if new plan tiers or API).

Keep the existing Next items (MCP Apps, Yarn Spinner, Twick/Video, gates, etc.) and add sizes to them too (e.g. MCP Apps = Large, Yarn export/import = Medium, etc.).

**Format**: Either a short table (Item | Impact | Link) or a numbered list with `**[Impact: …]**` at the end of each line. Link each item to the roadmap or architecture doc where it’s described.

---

## 3. Product roadmap: same items and sizes

**In [docs/roadmap/product.mdx**](docs/roadmap/product.mdx):

- Add a **"Platform (future)"** section (if not already added by the settings/platform plan) with:
  - Publish and host project builds — **Impact: Large**
  - Monetization (clone to account / download) — **Impact: Epic**
  - Plan tiers and capabilities for platform — **Impact: Small–Medium**
- In the same file, ensure **"Platform initiatives"** and any **"Other roadmap items"** list include impact sizes so the roadmap is self-consistent.
- Add a line at the top (or in the intro): **"For the canonical 'what can I do next?' list with impact sizes, see [STATUS.md](../agent-artifacts/core/STATUS.md) § Next."**

---

## 4. Single entry point: "What you can do next"

**Add a short "What you can do next" subsection** in [docs/agent-artifacts/core/STATUS.md](docs/agent-artifacts/core/STATUS.md) (or in [docs/18-agent-artifacts-index.mdx](docs/18-agent-artifacts-index.mdx)) so there is one place that answers the question:

- **Where to look**: STATUS **Next** is the list of next steps; each item has an **impact size**. For more context, see [product roadmap](../../roadmap/product.mdx) and [enhanced-features backlog](core/enhanced-features-backlog.md).
- **How to pick work**: Prefer **one slice per item**; use impact size to scope (Small = one PR, Epic = break into slices and track in STATUS). If you start an item, note it in STATUS (e.g. "In progress: …") so others don’t duplicate.

Recommendation: put this **in STATUS** right above the **Next** list, so the flow is: open STATUS → see "What you can do next" → read the Next list with sizes.

---

## 5. Agent strategy: next steps and overlap

**Update [docs/19-coding-agent-strategy.mdx**](docs/19-coding-agent-strategy.mdx):

- In **"How agents are expected to use them (actions)"**, add a bullet:
  - **To see what you can do next:** Read [STATUS § Next](agent-artifacts/core/STATUS.md) (and [product roadmap](roadmap/product.mdx)). Each item has an **impact size** (Small / Medium / Large / Epic). Prefer **one slice per item** to reduce overlap and merge conflicts; if you start an item, add a short "In progress" line in STATUS so other agents or contributors don’t pick the same work.
- Optionally add a short **"Product and platform next steps"** reminder: when proposing or implementing work that touches platform, settings, or paywall, check STATUS Next and roadmap for impact and dependencies; add new initiatives to the backlog as `proposed` and to STATUS Next once accepted.

---

## 6. Agent artifacts index: point to "what you can do next"

**Update [docs/18-agent-artifacts-index.mdx**](docs/18-agent-artifacts-index.mdx):

- In the **Living agent artifacts (core)** list, for STATUS.md add a line: **"For 'what can I do next?', see STATUS § Next and § What you can do next (impact sizes)."**
- Or add a single **"What you can do next"** entry in the index that points to STATUS § Next so agents that land on the index can immediately find the list.

---

## 7. Enhanced-features backlog

**Keep [docs/agent-artifacts/core/enhanced-features-backlog.md**](docs/agent-artifacts/core/enhanced-features-backlog.md) as the place for **proposed** ideas. When an item is **accepted**, it should also appear in STATUS Next (with impact size) so the canonical "next" list stays complete. In the backlog process doc or in STATUS, add a one-line rule: **"When a backlog item is set to accepted, add it to STATUS Next with an impact size."**

---

## Summary: where things live


| Question                  | Answer                                                                    |
| ------------------------- | ------------------------------------------------------------------------- |
| What can I do next?       | [STATUS § Next](docs/agent-artifacts/core/STATUS.md) (with impact sizes). |
| Why this size?            | STATUS § Impact sizes (Small/Medium/Large/Epic).                          |
| More context for an item? | Product roadmap, architecture docs, backlog (links from STATUS Next).     |
| How do I avoid overlap?   | One slice per item; if you start something, add "In progress" in STATUS.  |


---

## Files to change (implementation order)


| Step | File                                                                                                             | Action                                                                                                                                                           |
| ---- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | [docs/agent-artifacts/core/STATUS.md](docs/agent-artifacts/core/STATUS.md)                                       | Add "Impact sizes" definitions; add "What you can do next" subsection; add platform/settings/paywall items to Next with sizes; add sizes to existing Next items. |
| 2    | [docs/roadmap/product.mdx](docs/roadmap/product.mdx)                                                             | Add or expand "Platform (future)" with publish/host, monetization, plan tiers; add impact sizes; add pointer to STATUS § Next.                                   |
| 3    | [docs/19-coding-agent-strategy.mdx](docs/19-coding-agent-strategy.mdx)                                           | Add "what you can do next" action (read STATUS Next, use impact sizes, one slice per item, "In progress" when starting).                                         |
| 4    | [docs/18-agent-artifacts-index.mdx](docs/18-agent-artifacts-index.mdx)                                           | Note that "what can I do next?" is in STATUS § Next and § What you can do next.                                                                                  |
| 5    | [docs/agent-artifacts/core/enhanced-features-process.md](docs/agent-artifacts/core/enhanced-features-process.md) | Optional: add line "When status is set to accepted, add the item to STATUS Next with an impact size."                                                            |


---

## Impact sizes for current and new next steps (reference)


| Item                                                        | Impact       | Notes                                                |
| ----------------------------------------------------------- | ------------ | ---------------------------------------------------- |
| Editors as MCP Apps                                         | Large        | McpAppDescriptor, MCP Server, host registration.     |
| First-class Yarn Spinner (export/import, syntax, variables) | Medium       | Multiple slices; compiler/runtime later = Large.     |
| Twick → VideoDoc persistence + plan/commit UI               | Medium       | Data mapping + UI.                                   |
| Video workflow panel (plan/patch/review)                    | Medium       | Mirror Dialogue workflow.                            |
| Apply gates to more surfaces                                | Small        | Copilot sidebar, model selection.                    |
| Project-scoped settings                                     | Medium       | API + scope + optional UI.                           |
| Platform: publish and host builds                           | Large        | Build pipeline, storage, playable runtime.           |
| Platform: monetization (clone/download)                     | Epic         | Listings, checkout, Stripe Connect, clone semantics. |
| Plan/capabilities for platform                              | Small–Medium | Constants + PLAN_CAPABILITIES; optional new tiers.   |


This plan does not implement features; it only adds tracking and sizing so that contributors and agents can see what to do next and scope work appropriately.