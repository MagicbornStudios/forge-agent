---
title: Task registry
created: 2026-02-08
updated: 2026-02-11
---

Living artifact for agents. Index: [18-agent-artifacts-index.mdx](../../18-agent-artifacts-index.mdx).

# Task registry

Single entry point for "all work in tiers." For **granular, pickable tasks** (especially Tier 3 Small), use this registry and the linked breakdown docs. High-level list: [STATUS § Next](./STATUS.md).

## Initiatives (Tier 0)

| id | title | impact | status | breakdown | STATUS |
|----|-------|--------|--------|-----------|--------|
| model-routing-copilotkit-stability | AI agent / model provider plan; model switcher stability; reduce CopilotKit/Studio calls on load | Small–Medium | open | TBD (plan then implement) | [Next § AI/model](./STATUS.md) |
| ui-polish | Editor UI polish: compact modern icons + spacing audit (tokens, menus, inputs, badges) | Medium | open | [breakdown](task-breakdown-ui-polish.md) | — |
| yarn-spinner | First-class Yarn Spinner | Medium | open | — | [Next #3](./STATUS.md) |
| gameplayer | GamePlayer | Medium–Large | open | — | [Next #4](./STATUS.md) |
| plans-capabilities | Plans/capabilities for platform | Small–Medium | done | [breakdown](task-breakdown-platform-monetization.md) Plan/capabilities lane | [Next #5](./STATUS.md) |
| platform-mono | Platform: monetization (clone/download) | Epic | done | [breakdown](task-breakdown-platform-monetization.md) | [Next #6](./STATUS.md) |
| apply-gates | Apply gates to more surfaces | Small | open | — | [Next #8](./STATUS.md) |
| project-settings | Project-scoped settings | Medium | open | — | [Next #9](./STATUS.md) |
| trace-benchmark | TRACE.md / before-after benchmark for Codebase Agent Strategy | Small–Medium | open | — | [Next #10](./STATUS.md) |
| mcp-apps | Studio and editors as MCP (chat-first): Studio app-level tools, editor registration, MCP vs CopilotKit/assistant-ui (docs + optional unified backend), host matrix and integration docs | Large | open | [breakdown](task-breakdown-mcp-studio-editors.md) | [Next #11](./STATUS.md) |
| publish-host | Platform: publish and host builds (MVP: playable builds) | Large | open | — | [Next #7](./STATUS.md) |
| developer-program | Developer program and editor ecosystem | Epic | open | TBD (task-breakdown-developer-program.md when lanes exist) | [Next #12](./STATUS.md) |
| marketing-part-b | Marketing site overhaul (Part B) | Large | done | — | [Next #13](./STATUS.md) |
| video-twick | Twick → VideoDoc persistence + plan/commit UI | Medium | open | — | [Next #14](./STATUS.md) |
| video-workflow | Video workflow panel | Medium | open | — | [Next #15](./STATUS.md) |
| dev-kit-single-entrypoint | Dev-kit single entrypoint and docs (package + styles + customer/internal docs; optional create-forge-app) | Medium–Large | open | [breakdown](task-breakdown-dev-kit-single-entrypoint.md) | [Next § Dev-kit #18](./STATUS.md) |
| creator-dashboard | Platform creator dashboard (my listings, my games, licenses, revenue) using Vercel-style shell; Studio minimal (publish/update in app bar only) | Large | in_progress | [breakdown](task-breakdown-creator-dashboard.md) | [Platform dashboard](../../roadmap/product.mdx) |
| platform-org-financial-visibility | Platform org model and financial visibility (org switcher, org-scoped APIs, AI usage ledger, Stripe Connect org context) | Medium-Large | done | [breakdown](task-breakdown-creator-dashboard.md) org + finance lanes | [STATUS](./STATUS.md) |
| import-adapters | Adapters: Yarn (MVP), then Ink, Twine, Ren'Py; optional AI-assisted import (see [potential-ideas](../../roadmap/potential-ideas.md)) | Medium–Large | open | — | [Ecosystem and import](../../business/ecosystem-and-import-strategy.mdx) |
| dock-rails | Dock rails and composable panels: config-driven left/main/right/bottom as panel lists; RailPanelDescriptor; main/right as tab lists; naming and docs | Medium | open | [breakdown](task-breakdown-dock-rails.md) | — |
| editor-declarative-registries | Declarative editor components and registries: EditorRail/EditorPanel/EditorLayout, panel registry; SettingsSection/SettingsField, settings registry; EditorMenubarContribution; all editors migrated | Large | done | [breakdown](task-breakdown-editor-declarative-registries.md) | — |
| editor-registration-declarative | Register editors declaratively (like panels/settings): editor registry + Studio + menu registry + naming (StudioApp, StudioMenubarProvider, StudioSettingsProvider) | Small–Medium | done | Studio refactor plan | decisions.md § Studio as single entrypoint |

## Quick picks (Tier 3 or Tier 2, open, Small / Medium)

For easy small tasks: pick from the table below, or see breakdown docs and filter by `tier: 3`, `status: open`, impact Small (or Tier 2, Medium). Each task links to its parent initiative for context.

| id | title | parent | status |
|----|-------|--------|--------|
| platform-mono-cap-1 | Add PLATFORM_LIST capability and gate listing UI | platform-mono | done |
| platform-mono-cap-2 | Add PLATFORM_MONETIZE to CAPABILITIES and plan check | platform-mono | done |
| platform-mono-cap-3 | Wire plan to entitlements store for platform gates | platform-mono | done |
| platform-mono-list-2b | Create listing flow (Studio or marketing account) | platform-mono | done |
| platform-mono-cap-4 | Gate PLATFORM_PUBLISH in CreateListingSheet | platform-mono | done |
| platform-mono-cap-5 | Gate PLATFORM_MONETIZE in CreateListingSheet | platform-mono | done |
| platform-mono-cap-6 | Server-side listings beforeChange for publish/price | platform-mono | done |
| dev-kit-css-2 | Document single style import in 04 and customer Quick start | dev-kit-single-entrypoint | done |
| dev-kit-ui-1 | Document one recommended path (e.g. dev-kit.ui for atoms) in customer docs | dev-kit-single-entrypoint | done |
| creator-dash-template-1 | Evaluate shadcn dashboard templates for customer platform and migrate to selected baseline (`apps/platform`) | creator-dashboard | done |
| ui-polish-primitives-3 | Audit remaining @forge/ui components for `size-4`/`size-5` and replace with `--icon-size` | ui-polish | open |
| ui-polish-editor-3 | Audit editor lists/toolbars/panels for ad-hoc spacing + oversized icons | ui-polish | open |
| ui-polish-dialog-2 | Audit all Studio upsert dialogs for shadcn form section structure + tokenized spacing | ui-polish | open |
| ui-polish-dialog-3 | Audit modal/icon button sizing and close affordances (12px icon baseline) | ui-polish | open |
| ui-polish-dialog-4 | Normalize entity media sections (images/audio/video lists + inline actions) across character/location flows | ui-polish | open |
| ui-polish-docs-3 | Capture before/after screenshots (human) and save to docs/images | ui-polish | open |
| dock-rails-api-shape | Define RailPanelDescriptor and leftPanels/mainPanels/rightPanels/bottomPanels in DockLayout; build default layout by iterating | dock-rails | open |
| dock-rails-wire-editors | Wire Dialogue/Character/Video to new rail API (mainPanels, rightPanels); map or deprecate old right/rightInspector/rightSettings | dock-rails | open |
| dock-rails-naming | Align DockLayout, EditorDockPanel, README/AGENTS with rails and composable panels; document in errors-and-attempts/decisions | dock-rails | open |

*(More quick picks and open tasks are in [task-breakdown-platform-monetization.md](./task-breakdown-platform-monetization.md) and [task-breakdown-dev-kit-single-entrypoint.md](./task-breakdown-dev-kit-single-entrypoint.md).)*
