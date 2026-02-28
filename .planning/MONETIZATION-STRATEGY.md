# Monetization Strategy — Iteration Doc

**Status:** Draft. We are iterating on this to define how we make money, long-term growth, and short-term monetization.

**Current state:** 0 revenue; 0 funding. Code-signing deferred until 50k (HUMAN-TASKS HT-09). No monetization plan in place yet.

---

## 1. License and distribution

- **Not MIT.** This repo is not open-source permissive. License TBD.
- **Implications:** We can restrict usage, gate features, require subscription, and control extension distribution.

### License options (for iteration)

| Option | Summary | Pros | Cons |
|--------|---------|------|------|
| **BSL (Business Source License)** | Source visible; commercial use requires license; converts to Apache after N years | Clear path to open; dual-license common | Conversion terms must be defined |
| **SSPL** | Source available; hosting as a service requires sharing your modifications | MongoDB-style; strong copyleft for SaaS | Controversial; some avoid |
| **Proprietary + EULA** | Closed source or source-available under custom terms | Full control; no conversion obligation | More legal setup; no community expectation |
| **Custom source-available** | "Personal/educational free; commercial requires paid license" | Flexible; can match exact model | Needs lawyer; less precedent |

**Next step:** Legal review before final choice. BSL and proprietary are most common for "we'll monetize and keep control" scenarios.

---

## 2. Monetization model (proposed direction)

**Desktop app subscription:** We are fine locking down the Repo Studio desktop app with a subscription.

**Extensions gating:** Extensions can be restricted—users need an active subscription to use extensions (or specific premium extensions).

**Flow:** User downloads Repo Studio → must activate/subscribe (via platform) to use the full product or extensions.

---

## 3. What we can do now (short-term)

| Action | Depends on | Notes |
|--------|------------|-------|
| Decide license | — | Legal/compliance; affects all distribution |
| Document paid vs free boundaries | — | What works without subscription today |
| Define "activation" flow | Platform (Phase 18) | Desktop checks platform for valid subscription |
| Ship free tier / trial | — | Time-limited or feature-limited to drive conversion |

**Blocker:** Platform must support auth and entitlement checks before we can enforce subscription.

---

## 4. What becomes available after phases

| Phase | Enables | Monetization relevance |
|-------|---------|------------------------|
| 18. Platform integration gateway | Auth, Open Router proxy, extension install proxy | **Entitlement checks.** Platform can validate subscription; Repo Studio gates on response. |
| 19. Planning assistant context | LoopId, workspaceId, plan tools | Premium: better context = value; could gate advanced planning |
| 20. Planning artifacts first-class | DoD, HUMAN-TASKS, unified todos | Core UX; part of base or premium depending on tier |
| 25. Concept simulation workspace | Concept discovery; replaces Story | Extension or built-in; good candidate for premium |
| 26. Codebase vector indexing | Semantic search | **High value.** Could be premium-only (indexing + retrieval). |
| 27. Repo Studio documentation | Docs, download hub | Supports conversion; docs can explain pricing |

**Critical dependency:** Phase 18 (platform gateway) is the gate for any subscription enforcement. Desktop must call platform to validate subscription.

---

## 5. What the platform must support

For monetization to work, the platform needs:

1. **Auth** — User identity; desktop connects and gets a session.
2. **Entitlement/subscription check** — `GET /api/entitlements` or similar: returns `{ active: boolean, tier?: string }` for the user.
3. **Billing** — Stripe (or similar) for subscriptions. TBD: self-hosted vs managed.
4. **Extension gating** — When Repo Studio requests extension install or loads extension, platform can say "allowed" or "requires subscription."

**Current PLATFORM-PRD:** Covers auth and proxy. Does *not* yet cover entitlements or billing. Add to platform roadmap.

---

## 6. Extensions worth building or gating

| Extension | Build? | Gate? | Rationale |
|-----------|--------|-------|------------|
| Story (→ Concept type) | In progress (Phase 25) | TBD | Concept simulation; high value for discovery |
| Env workspace | Exists | TBD | DevOps value; could be free (acquisition) or premium |
| Concept workspace | Phase 25 | **Likely gate** | Discovery loop; differentiated; good premium candidate |
| Future: vector search UI | Phase 26 | **Likely gate** | Indexing is costly; semantic search is high value |
| Community extensions | Third party | Optional | Could allow free community extensions; first-party premium |

**Principle:** First-party extensions that add significant value (Concept, vector search) are strong candidates for subscription gating. Commodity or acquisition extensions (e.g. basic Env) might stay free.

---

## 7. Revenue streams — what scales

| Stream | Scalability | Effort | When it works |
|--------|-------------|--------|---------------|
| **Desktop subscription** | High — linear with users | Low — Stripe + entitlements | Product-led; users self-serve; predictable MRR |
| **Usage-based (API markup)** | Variable — scales with usage | Medium — metering, billing | Open Router proxy: charge markup; volatile but margins can be good |
| **Premium extensions** | Medium — bundle or à la carte | Low — already gating mechanism | Concept, vector search; clear value; upsell path |
| **Team/seat licensing** | High — per-seat multiplies | Low — same infra, different tier | Teams pay more; good once you have individual converts |
| **Enterprise / self-hosted** | High ACV — fewer customers | High — sales, support, custom deploys | Defer until PMF; then 1–2 deals can move needle |
| **Extension marketplace cut** | Long-term — needs ecosystem | High — curation, payouts | Like VS Code; only after critical mass of extensions |

**Best fit for solo/small team:** Product-led subscription + premium extensions. No sales team, low support, predictable revenue.

---

## 8. Business model options (pick one to start)

### Option A: Flat subscription
- **Free:** Planning + Code + 1 extension, time-limited or feature-capped.
- **Pro ($15–25/mo):** Full desktop, all extensions, platform proxy.
- **Scales:** More users = more revenue. Simple. No usage metering.
- **Risk:** Heavy users (lots of Open Router calls) could cost you; may need fair-use or soft caps.

### Option B: Tiered subscription
- **Free:** Core only, no extensions or limited.
- **Pro ($12–20/mo):** Extensions, platform proxy.
- **Team ($X/seat/mo):** Same + team features, shared context (future).
- **Scales:** Higher ARPU from teams.
- **Risk:** More complexity; team features need to exist.

### Option C: Usage + base
- **Free:** Limited or no platform proxy (user brings own API keys).
- **Pro ($10/mo base + usage):** Platform proxy with markup (e.g. 20% on Open Router); extensions.
- **Scales:** Revenue scales with usage; aligns cost and revenue.
- **Risk:** Billing complexity; users hate surprise bills; need caps/warnings.

### Option D: Extension-first
- **Free:** Desktop + core workspaces; no extensions.
- **Pay per extension:** Concept ($5/mo), Vector search ($8/mo), or bundle ($12/mo).
- **Scales:** À la carte can convert better; clear value per purchase.
- **Risk:** Fragmented; some never upgrade; harder to message.

**Recommendation:** Start with **Option A** (flat Pro). Simplest to build and explain. Add Team tier (Option B) when you have team features. Consider usage component (Option C) only if Open Router costs become material.

---

## 9. Scaling path (revenue → reinvestment)

| Stage | Revenue | Reinvest in | Notes |
|-------|---------|-------------|-------|
| **0** | $0 | Phase 18 (entitlements), license, docs | Can't charge yet |
| **$1–5k MRR** | First paying users | Code-signing (HT-09 at 50k cumulative), better onboarding | Validate willingness to pay |
| **$5–20k MRR** | Sustainable solo | Team tier, Concept/vector extensions, polish | Product-led engine working |
| **$20k+ MRR** | Can hire or outsource | Support, sales (enterprise), or more product | Choose: grow team vs stay lean |
| **Enterprise** | 1–2 deals = meaningful | Self-hosted option, SLA, security review | Defer until PMF; then high leverage |

**Key:** Don't add complexity (usage billing, enterprise, marketplace) until simpler model is proven. Flat subscription first.

---

## 10. Long-term growth

- **Product-led growth:** Free/trial → hit limits or need premium features → subscribe.
- **Platform stickiness:** Auth, sync, cloud features (future) → harder to leave.
- **Extension ecosystem:** Community builds free extensions; we build and gate premium ones. Marketplace potential.
- **Enterprise:** Self-hosted, SLA, support contracts. Later phase.

---

## 11. Short-term monetization

- **Immediate:** No revenue until platform supports entitlements.
- **Post–Phase 18:** Can enforce desktop subscription and/or extension gating.
- **First paid feature:** TBD. Candidates: full desktop use, specific extensions (Concept, vector search), platform proxy (Open Router usage).

---

## 12. Open questions

- [ ] Exact license choice
- [ ] Free tier: what works without subscription? (e.g. Planning + Code only? Limited extensions?)
- [ ] Pricing: monthly/yearly; per-seat vs per-machine
- [ ] Trial: duration, feature set
- [ ] First paid feature and pricing
- [ ] Extension marketplace vs first-party-only for now

---

## 13. References

- [.planning/PRD.md](PRD.md)
- [.planning/PLATFORM-PRD.md](PLATFORM-PRD.md)
- [.planning/HUMAN-TASKS.md](HUMAN-TASKS.md) — HT-09 (code-signing at 50k)
- [.planning/ROADMAP.md](ROADMAP.md)
