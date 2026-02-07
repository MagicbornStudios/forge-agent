---
name: Design system styling review
overview: A single plan that (1) explains the current token layers and where failures come from, (2) aligns with shadcn and stabilizes third-party components, (3) wires React Flow to theme/context tokens, (4) fixes contrast and duplicates, (5) documents the system and adds density to the theme switcher, and (6) expands context-aware color usage.
todos: []
isProject: false
---

# Design system and styling review

## 1. How the system works today (and why it feels confusing)

**Token layers (cascade order):**

```mermaid
flowchart TB
  subgraph root [":root in themes.css"]
    A[Shadcn semantic: --background, --foreground, --card, etc.]
    B[Our tokens: --graph-*, --control-*, --menu-*, --sidebar*, --text-*, etc.]
    C[Sidebar derived: --sidebar = var(--sidebar-background) = var(--graph-sidebar-bg)]
  end
  subgraph density ["[data-density]"]
    D[compact / comfortable sizing overrides]
  end
  subgraph theme ["[data-theme='X']"]
    E[Per-theme overrides of semantic + graph + control + text + shadows]
  end
  subgraph context ["[data-domain] in contexts.css"]
    F[--context-accent, --primary, --ring, etc. from --domain-*]
  end
  root --> density
  density --> theme
  theme --> context
```



- **:root** is the default (dark) and defines every token once. Sidebar colors are **derived** from `--graph-sidebar-bg` and `--text-primary`, so any theme that overrides those (in its `[data-theme]` block) automatically updates the sidebar.
- **Shadcn alignment**: We use the same variable names as shadcn (`--background`, `--foreground`, etc.). [globals.css](apps/studio/app/globals.css) maps them into Tailwind via `@theme inline` (`--color-background: var(--background)`, etc.). We do **not** use the `.dark` class for theming; we only use `data-theme`, so all color comes from CSS variables. That is compatible with shadcn as long as components use those variables (which they do via Tailwind utilities).
- **Where it fails**:
  - **Surface/foreground mismatch**: Using `bg-background` or `text-foreground` inside a **different** surface (e.g. app bar strip that uses a darker bg, or a toolbar inside sidebar) can give wrong contrast, because `--background`/`--foreground` are global. The fix is to use the token for that surface (e.g. `bg-sidebar text-sidebar-foreground` inside sidebar, or a dedicated toolbar token if we introduce one).
  - **Duplicate @layer base**: [globals.css](apps/studio/app/globals.css) has two identical `@layer base` blocks (lines 92–99 and 101–109); one should be removed.
  - **Too many token names**: Having shadcn semantic + graph + control + menu + panel + domain + flags in one file makes it hard to see “which token for which job.” We don’t need to delete tokens; we need a single doc that defines the **layers** and **when to use which** (see below).
  - **React Flow**: Only controls are overridden in [scrollbar.css](packages/shared/src/shared/styles/scrollbar.css) (`.react-flow__controls*`). The viewport background and default node/edge styles are still React Flow’s defaults. We have `--graph-canvas`, `--graph-node-*`, `--graph-edge-*` but no CSS that applies them to `.react-flow__background`, `.react-flow__node`, and edge paths in a central way.
  - **Density not in theme switcher**: Density is applied via `data-density` in [AppThemeProvider](apps/studio/components/providers/AppThemeProvider.tsx) from settings, but the [ThemeSwitcher](apps/studio/components/app-bar/ThemeSwitcher.tsx) only changes theme; users cannot switch density from the same UI.

---

## 2. What to do (concise)

### 2.1 Documentation (single source of truth)

- **Extend** [docs/design/01-styling-and-theming.mdx](docs/design/01-styling-and-theming.mdx) (or add a dedicated “Token system” subsection / doc) to include:
  - **Layers**: (1) Shadcn semantic = `--background`, `--foreground`, `--card`, `--popover`, `--primary`, `--muted`, `--sidebar*`, etc., all overridden by `data-theme`. (2) Sizing/density = `--control-height`, `--panel-padding`, `--tab-height`, `--menu-item-padding-x/y`, etc., overridden by `data-density`. (3) Graph = `--graph-canvas`, `--graph-node-*`, `--graph-edge-*`, `--graph-sidebar-bg`, overridden by `data-theme`. (4) Context = `--context-accent` (and derived `--primary`/`--ring` when `[data-domain]`), from [contexts.css](packages/shared/src/shared/styles/contexts.css).
  - **When to use which**: Body/main canvas → `bg-background` / `text-foreground`. Sidebar → `bg-sidebar` / `text-sidebar-foreground`. Popovers/dropdowns → `bg-popover` / `text-popover-foreground`. Cards/panels → `bg-card` / `text-card-foreground`. Controls (inputs, buttons) → `--control-*` and semantic colors. Graph → `--graph-*` only in graph UI. Avoid `bg-background`/`text-foreground` inside sidebar or other non-body surfaces.
  - **File map**: themes.css = colors + density + theme overrides; contexts.css = domain/context accents; graph.css = dialogue graph edge/choice styling; scrollbar.css = React Flow controls + scrollbars; globals.css = Tailwind @theme + base, no color redefinitions.
- **Reference** this from [styling-and-ui-consistency.md](docs/agent-artifacts/core/styling-and-ui-consistency.md) and from [errors-and-attempts.md](docs/agent-artifacts/core/errors-and-attempts.md) (e.g. “Theme/surface tokens” entry).

### 2.2 Contrast and stability (shadcn-friendly)

- **Audit** (targeted): In `apps/studio` and shared editor chrome, find places that use `bg-background` or `text-foreground` inside:
  - Sidebar (use `bg-sidebar` / `text-sidebar-foreground` or sidebar-accent for hover).
  - App bar / toolbar strips that are visually “darker” or “lighter” than body (prefer a semantic token for that strip and a matching foreground, or ensure the strip uses a token that is overridden per theme so contrast holds).
- **Dropdowns/menus**: Already use `DropdownMenuContent` (popover surface). Ensure triggers on sidebar use a variant that stays readable (outline/default per [errors-and-attempts](docs/agent-artifacts/core/errors-and-attempts.md)); no new token needed if we fix surface usage.
- **Remove** the duplicate `@layer base` block in [globals.css](apps/studio/app/globals.css).
- **Do not** redefine semantic tokens in globals.css; keep themes.css as the only source (already documented in errors-and-attempts).

### 2.3 React Flow: theme- and context-aware

- **Central overrides** (new file or a clear section in an existing one, e.g. [graph.css](packages/shared/src/shared/styles/graph.css) or shared styles imported after React Flow’s style):
  - `.react-flow__background` → `background: var(--graph-canvas);`
  - Default node container (e.g. `.react-flow__node`) → background/border from `--graph-node-bg`, `--graph-node-border` (and selected state from `--graph-node-selected` if applicable).
  - Default edge path (e.g. `.react-flow__edge-path`) → `stroke: var(--graph-edge-default);` (and hover if needed).
- **Context awareness**: Graph is already wrapped with `data-domain` (e.g. dialogue/forge); [contexts.css](packages/shared/src/shared/styles/contexts.css) sets `--context-accent` and overrides `--primary`/`--ring` there. Custom nodes (e.g. in [packages/studio components/nodes](apps/studio/components/nodes)) should use our tokens (e.g. `--graph-node-*`, `--context-accent`) via Tailwind or className, and set `data-context-node-type` where we already have context rules (e.g. dialogue ACT/CHAPTER). No change to context logic; ensure node/edge components use token-based classes and that the new React Flow overrides use the same tokens so theme switch and domain both apply.

### 2.4 Theme switcher: add density

- In [ThemeSwitcher.tsx](apps/studio/components/app-bar/ThemeSwitcher.tsx): Add a second control (e.g. submenu or grouped dropdown) for **density** (compact / comfortable). On change: call existing settings (`setSetting('app', 'ui.density', value)`), persist via `SettingsService.postApiSettings`, and optionally toast. `AppThemeProvider` already reads `ui.density` and sets `document.documentElement.dataset.density`; no change needed there.
- Optional: Share the same dropdown surface (theme + density) so “theme and density” live in one place.

### 2.5 Context-aware color usage

- **Already in place**: [contexts.css](packages/shared/src/shared/styles/contexts.css) defines `--context-accent` per `data-domain` and node type; panels and focus rings can use `var(--context-accent)` or `var(--ring)` (which we override under `[data-domain]`).
- **Expand** only where it adds value: e.g. active editor tab, panel header accent, or selected node border already using `--context-accent` or `--ring`. Prefer reusing existing context tokens over adding new ones. Document in 01-styling-and-theming (or token doc) that “context-aware UI” = set `data-domain` (and optionally `data-context-node-type`) and use `--context-accent` / `--ring` for highlights and borders.

### 2.6 Ralph Wiggum loop and agent artifacts

- After implementation: Update [STATUS.md](docs/agent-artifacts/core/STATUS.md) with the styling review and fixes (e.g. “Design system: token doc, contrast audit, React Flow overrides, theme switcher density, duplicate base removed”).
- Add or update an entry in [errors-and-attempts.md](docs/agent-artifacts/core/errors-and-attempts.md) for “Theme/surface tokens: use surface-specific tokens inside sidebar and app bar; do not use bg-background/text-foreground in non-body surfaces.”
- Keep [styling-and-ui-consistency.md](docs/agent-artifacts/core/styling-and-ui-consistency.md) aligned with the new token doc (reference and rules).

---

## 3. Summary


| Area               | Problem                                 | Action                                                                                                                             |
| ------------------ | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Token confusion    | Many tokens; unclear which to use where | Document layers and “when to use which” in 01-styling-and-theming (or token doc); reference from agent artifacts                   |
| Contrast           | Wrong text/background on some surfaces  | Audit sidebar and app bar; use surface tokens (e.g. sidebar, popover) instead of global background/foreground where appropriate    |
| globals.css        | Duplicate @layer base                   | Remove one block                                                                                                                   |
| React Flow         | Default styles not using our theme      | Add overrides for .react-flow__background, default node, default edge to use --graph-* tokens; keep context via data-domain        |
| Density            | Not in theme switcher                   | Add density option to ThemeSwitcher; persist via existing settings                                                                 |
| Third-party shadcn | Stability                               | Keep single source of semantic tokens (themes.css); no redefinitions in globals; document so new shadcn components use same tokens |
| Context awareness  | Already present                         | Document; expand only where useful (tabs, panels) using existing --context-accent / --ring                                         |


This keeps shadcn as the base, makes our token stack explicit and documentable, fixes known failure points (contrast, duplicate base, React Flow), and gives one place (theme switcher) to switch both theme and density while keeping context-aware theming consistent.