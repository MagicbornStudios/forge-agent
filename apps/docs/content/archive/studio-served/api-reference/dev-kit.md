---
title: "@forge/dev-kit"
---

Convenience package that re-exports **@forge/dev-kit** and **@forge/agent-engine**. UI atoms live in **@forge/ui** (or the `ui` namespace export from dev-kit).

## Quick start

1. **Install:** `pnpm add @forge/dev-kit`. If using a private registry, set `.npmrc` with `@forge:registry=<your-registry-url>`.
2. **One style import:** In your app CSS (e.g. `globals.css`), add `@import '@forge/dev-kit/styles/editor';` — do not import dockview directly.
3. **Minimal snippet:** Wrap your app with `AppProviders`, render `EditorApp` and your editor (e.g. `CodebaseAgentStrategyWorkspace`). See [components: Editor shell](/docs/components/editor-shell) and the consumer example in the repo.

## Editor styles

For DockLayout/editor chrome styles, import once in your app CSS: `@import '@forge/dev-kit/styles/editor'` (or `@forge/dev-kit/styles/editor`). Do not import dockview directly.

## UI components

We recommend using **@forge/dev-kit** as the single entrypoint. For all UI atoms (buttons, cards, inputs, etc.), use the `ui` namespace from dev-kit:

```ts
import { ui } from '@forge/dev-kit';

<ui.Button>Click me</ui.Button>
```

You can also import from `@forge/ui` directly if you prefer.

More content coming soon.
