# 02 – Workspace shell and slots

Every workspace uses the same surfaces: Header, Toolbar, LayoutGrid (main/right/bottom/left), StatusBar, Overlays. Composition only; no data in this guide.

## Shared components

From `packages/shared/src/shared/components/workspace/`:

- **WorkspaceShell** — Root; accepts `workspaceId`, `title`, `subtitle`, `domain`, `theme`, `className`, `children`. Renders a flex column; children define order.
- **WorkspaceLayout** — Simple flex column wrapper for shell content (used inside `WorkspaceShell`).
- **WorkspaceHeader** — `WorkspaceHeader.Left`, `.Center`, `.Right` for composable sections.
- **WorkspaceToolbar** — `WorkspaceToolbar.Left`, `.Center`, `.Right`; menubar, project select, buttons.
- **WorkspaceLayoutGrid** — Slots: `main` (required), `left?`, `right?`, `bottom?`. Layout adapts to what you pass.
- **WorkspaceStatusBar** — Footer strip (e.g. "Ready", "Unsaved changes").
- **WorkspaceOverlaySurface** — Renders overlays from a declarative list: `overlays`, `activeOverlay`, `onDismiss`.

No imperative registry: you compose these as React children. See [workspace AGENTS.md](../../packages/shared/src/shared/components/workspace/AGENTS.md) for slot rules.

## Minimal shell example

```tsx
<WorkspaceShell workspaceId="my-workspace" title="My Workspace" domain="my">
  <WorkspaceHeader>...</WorkspaceHeader>
  <WorkspaceToolbar>...</WorkspaceToolbar>
  <WorkspaceLayoutGrid main={<div>Main content</div>} />
  <WorkspaceStatusBar>Ready</WorkspaceStatusBar>
  <WorkspaceOverlaySurface overlays={[]} activeOverlay={null} onDismiss={() => {}} />
</WorkspaceShell>
```

Real reference: `apps/studio/components/workspaces/ForgeWorkspace.tsx` composes these with Forge-specific content.

## What the AI can do at this stage

None — no Copilot contract or actions are registered yet. The shell is just layout.

**Next:** [03 – Styling and theming](03-styling.md)
