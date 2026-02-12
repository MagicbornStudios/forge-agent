# Shared workspace and editor styles

These files are the single source for workspace and editor theming in this project. They were copied from `dialogue-forge` (packages/shared/src/styles) and are now owned here.

## Files

- **themes.css** - Data-driven theme tokens (shadcn-first). Set `data-theme` on `<html>` to switch: `dark-fantasy` (default), `light`, `cyberpunk`, `darcula`, `high-contrast`, `girly`. Defines shadcn semantic tokens (`--background`, `--foreground`, `--card`, `--muted`, `--sidebar-*`, etc.) plus graph/domain tokens: `--graph-canvas`, `--graph-editor`, `--graph-node-*`, `--graph-edge-*`, `--status-*`, `--text-primary`, `--control-*`, `--flag-*`, `--domain-forge` / `--domain-dialogue` / `--domain-writer` / `--domain-ai` / `--domain-video` / `--domain-character`, `--border-active`, `--border-hover`. Migration note: `--color-df-*` has been removed; use the new token names above.
- **contexts.css** - Domain context theming via `data-domain` (e.g. `data-domain="dialogue"`). Provides `--context-accent`, `--context-glow`, `--context-ring` for focus/selection.
- **graph.css** - React Flow viewport/node/edge overrides; per-type node selection (inset box-shadow on custom nodes); Dialogue graph choice colors/edges (`.dialogue-graph-editor`).
- **scrollbar.css** - Global scrollbar styling and React Flow controls.

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

These are imported from `app/globals.css` after Tailwind base. Order: themes -> contexts -> graph -> scrollbar (themes first so tokens exist for the others).
