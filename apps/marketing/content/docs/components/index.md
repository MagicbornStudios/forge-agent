---
title: Component library
---

# Component library

Forge provides a shared component set for building editor UIs.

## Key components

- **EditorShell** — Declarative root (layout and slots).
- **DockLayout** — Dockview-based panels (undock, reorder, persist).
- **DockPanel**, **PanelTabs** — Panel chrome.
- **EditorToolbar** — Toolbar with File menu, project select, and actions.

Atoms live in `@forge/ui`. Editor molecules and organisms in `@forge/shared`. When using **@forge/dev-kit**, we recommend importing atoms via the `ui` namespace: `import { ui } from '@forge/dev-kit'` (see [API reference: dev-kit](/docs/api-reference/dev-kit)). See the individual component pages for API details.
