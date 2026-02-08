# Known issues

**For agents and developers.** Check this file when answering "what can I do next?" or before assigning work that assumes a feature is available. See also [docs/agent-artifacts/core/errors-and-attempts.md](docs/agent-artifacts/core/errors-and-attempts.md) (failure log) and [docs/agent-artifacts/core/STATUS.md](docs/agent-artifacts/core/STATUS.md) (current state and next steps).

---

## Video editor — non-functional and locked until after MVP

**Status:** Not in use; gated by capability `studio.video.editor` (AppShell hides tab + content when locked).

**Details:** The Video editor (Twick-based timeline UI) is currently **non-functional** and **locked until after MVP**. It is not available in the app until we re-enable it. Do not assign work that assumes the Video editor is usable (e.g. "fix Video export" or "add Video timeline persistence") until (1) MVP (paid clone/download + plan tiers) is in place and (2) the editor is unlocked and documented as supported. See [MVP and first revenue](docs/product/mvp-and-revenue.mdx).

**Plan:** [docs/agent-artifacts/core/plan-dockview-restore-video-lock-feature-flags.md](docs/agent-artifacts/core/plan-dockview-restore-video-lock-feature-flags.md) — Restore Dockview, lock Video editor, optional feature-flag SDK.

---

## Strategy (codebase) editor — locked until after MVP

**Status:** Not in use; gated by PostHog feature flag `strategy-editor-enabled` and capability `studio.strategy.editor` (AppShell hides tab + content when flag off; FeatureGate lock-overlay when capability locked).

**Details:** The in-app Strategy editor (CodebaseAgentStrategyEditor) is **out of scope for MVP** and **locked**. The downloadable Strategy core (docs + AGENTS.md) and TRACE are in scope for MVP. The **editor in Studio** ships after MVP. Do not prioritize Strategy editor work for MVP. Same lock pattern as Video: feature flag for shell visibility and copilot actions; `CAPABILITIES.STUDIO_STRATEGY_EDITOR` for plan-based lock-overlay inside the editor (not granted to any plan yet).

---

*(Add other product/editor-level known issues below as needed.)*
