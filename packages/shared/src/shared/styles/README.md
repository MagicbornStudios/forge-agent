# Shared workspace and editor styles

These files are the single source for workspace and editor theming in this project. They were copied from `dialogue-forge` (packages/shared/src/styles) and are now owned here.

## Files

- **themes.css** — Data-driven theme tokens. Set `data-theme` on `<html>` to switch: `dark-fantasy` (default), `light`, `cyberpunk`, `darcula`, `high-contrast`, `girly`. Defines `--color-df-*` and domain accents `--color-df-domain-forge`, etc.
- **contexts.css** — Domain context theming via `data-domain` (e.g. `data-domain="forge"`). Provides `--context-accent`, `--context-glow`, `--context-ring` for focus/selection.
- **graph.css** — Graph editor classes (choice colors, edges, draft state) for `.dialogue-graph-editor`.
- **scrollbar.css** — Global scrollbar styling and React Flow controls.

## How to switch themes

Set the theme on the document root:

```html
<html data-theme="light">
```

or programmatically:

```ts
document.documentElement.setAttribute('data-theme', 'dark-fantasy');
```

## Import order

These are imported from `app/globals.css` after Tailwind base. Order: themes → contexts → graph → scrollbar (themes first so tokens exist for the others).
