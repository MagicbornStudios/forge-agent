---
title: Styling and UI consistency
created: 2026-02-07
updated: 2026-02-07
---

Living artifact for agents. Index: [18-agent-artifacts-index.mdx](../../18-agent-artifacts-index.mdx).

# Styling and UI consistency

> **For coding agents and humans.** Single place for how we handle styling and UI consistency and what to do when debugging or changing UI.

## Purpose

- Ensure toolbar, menu, panel, and card styling stays consistent and readable (contrast, tokens, icons).
- Define the process for styling passes: before/after screenshots, docs/images, and doc updates.

## Rules

1. **Design tokens and shared components** — Use tokens from [design/01-styling-and-theming.mdx](../../design/01-styling-and-theming.mdx) and components from [02-components.mdx](../../design/02-components.mdx). No ad-hoc `px-*`/`py-*` in editor chrome; use `--panel-padding`, `--control-gap`, `--tab-height`, etc.
2. **Button and menu variants** — Prefer `outline` or `default` for toolbar and menu triggers and primary actions. Avoid ghost-only where it causes poor contrast (dark text on dark background). See [errors-and-attempts.md](./errors-and-attempts.md) entry "Grey buttons and missing menu/icons."
3. **Icons** — Follow the icon audit in [02-components.mdx](../../design/02-components.mdx): menu items (File/View/State), editor creation buttons, Workbench, panel headers, tab triggers. Use Lucide React; standard size **12px** (`size-3` or `var(--icon-size)`). **No custom SVG icons** — use Lucide React only (e.g. `Loader2` for spinners; `X` for close). Do not add inline `<svg>` or custom SVG components for UI icons.
4. **All buttons use shadcn Button** — Every interactive button uses `Button` from `@forge/ui/button`. Close/dismiss actions use Lucide `X` inside `Button variant="ghost" size="icon"`. No plain `<button>` with text "x" or `<span>x</span>`.
5. **Shadcn for editor chrome** — Prefer shadcn UI (Button, Label, Menubar, Tabs, etc.) for all editor chrome (tabs, menus, buttons). Avoid plain HTML elements unless necessary.
6. **Accent for selection** — Use one edge only (e.g. left or bottom) for list item / card selection; not a full border.
7. **Card and panel padding** — Use `p-[var(--panel-padding)]` (and content padding) for card headers and content so sections (e.g. AI Workflow) are not flush to borders.
8. **Base shadcn tokens power all UI** — No hardcoded colors, radii, or shadows in editor chrome. Use `--panel-padding`, `--control-*`, `--radius-*`, `--shadow-*`, and semantic colors (`bg-background`, `text-foreground`, `border-border`, etc.). Visual direction is professional, sharp, and modern (VSCode/Photoshop/Spotify/Unreal); see [01 - Styling and theming](../../design/01-styling-and-theming.mdx) and [03 - Design language](../../design/03-design-language.mdx). **Themes:** Only light and dark (Spotify-based); icon size 12px; radius scale 4–8px; prefer minimal full borders (see design docs).

## Process when making UI/styling changes

1. **Before (optional)** — If in a debugging pass, keep or add a "before" screenshot in **docs/images/** (e.g. `half_done_buttons.png`). Reference it in design or how-to docs.
2. **Implement** — Use tokens and patterns from design/01 and 02. Fix contrast, spacing, and icons as in errors-and-attempts and this doc.
3. **After** — Take a screenshot (Cursor browser tools), save to **docs/images/** with a descriptive name (e.g. `styling_after_contrast_and_spacing.png`). Reference it in the relevant doc (design or how-to) or in STATUS/changelog.
4. **Docs** — Update design docs or errors-and-attempts when adding a new pattern or fix (e.g. new button variant rule or screenshot reference).

## References

- [How-to 26 – Styling debugging with Cursor](../../how-to/26-styling-debugging-with-cursor.mdx) — Full workflow (selectors, screenshots, plans).
- [01 - Styling and theming](../../design/01-styling-and-theming.mdx) — Includes **Token system** (layers, when to use which, file map) and context-aware UI. [02 - Components](../../design/02-components.mdx).
- [errors-and-attempts.md](./errors-and-attempts.md) — e.g. "Grey buttons and missing menu/icons," "Theme/surface tokens," "Toolbar buttons not switching with theme."
