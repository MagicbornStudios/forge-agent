The outermost container for every editor in the Forge platform. Sets theme context, density, domain scoping, and provides the flex layout skeleton.

## Overview

`WorkspaceShell` is the root component that wraps every editor (Dialogue, Character, Video, etc.). It establishes:

- **Data attributes** for CSS theming (`data-editor-id`, `data-domain`, `data-theme`, `data-density`)
- **Flex layout skeleton** (toolbar → content → status bar)
- **Slot-based composition** for structured editor shells
- **Theme context** for domain-specific color schemes

**Every editor starts with WorkspaceShell.** It replaces the legacy `WorkspaceShell` and provides a cleaner, more declarative API.

## Installation

```bash
npm install @forge/dev-kit
```

Import:

```tsx
```

## Basic Usage

```tsx
<WorkspaceShell
  editorId="dialogue"
  title="Dialogue Editor"
  domain="dialogue"
  theme="dark"
  density="comfortable"
>
  <WorkspaceToolbar>...</WorkspaceToolbar>
  <DockLayout>...</DockLayout>
  <WorkspaceStatusBar>Ready</WorkspaceStatusBar>
</WorkspaceShell>
```

## Props API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `editorId` | `string` | - | **Critical.** Unique editor identifier (e.g., 'dialogue', 'character'). Sets `data-editor-id` for settings resolution, copilot context, and CSS scoping. |
| `title` | `string` | **Required** | Display name for the editor. Used in accessibility labels. |
| `subtitle` | `string` | - | Optional subtitle (e.g., active document name, "Untitled Graph"). |
| `domain` | `string` | - | Domain context for theming. Sets `data-domain` attribute for CSS variable scoping (e.g., `--graph-node-*` colors). |
| `theme` | `string` | - | Theme override. Sets `data-theme` attribute (`'dark'`, `'light'`, `'system'`). Read from settings store in practice. |
| `density` | `'compact' \| 'comfortable' \| string` | - | Density override. Sets `data-density` attribute to adjust spacing/sizing. |
| `className` | `string` | - | Additional Tailwind classes for the root element. |
| `children` | `React.ReactNode` | - | Either raw children (legacy) or slot components (recommended). |

## Slot-Based Composition (Recommended)

When using slot components, content renders in **fixed order** with layout applied automatically:

```tsx
<WorkspaceShell editorId="dialogue" title="Dialogue" domain="dialogue">
  <WorkspaceShell.Header>
    {/* Optional header content (rarely used) */}
  </WorkspaceShell.Header>

  <WorkspaceShell.Toolbar>
    <WorkspaceToolbar>...</WorkspaceToolbar>
  </WorkspaceShell.Toolbar>

  <WorkspaceShell.Layout>
    <WorkspaceLayout>...</WorkspaceLayout>
  </WorkspaceShell.Layout>

  <WorkspaceShell.StatusBar>
    <WorkspaceStatusBar>Ready</WorkspaceStatusBar>
  </WorkspaceShell.StatusBar>

  <WorkspaceShell.Overlay>
    <WorkspaceOverlaySurface ... />
  </WorkspaceShell.Overlay>

  <WorkspaceShell.Settings>
    {/* Optional settings panel (rarely used) */}
  </WorkspaceShell.Settings>
</WorkspaceShell>
```

### Slot Order & Layout

Slots render in this order:

1. **Header** (optional) — Top of editor, above toolbar
2. **Toolbar + Settings** (single row) — Toolbar on left, settings trigger on right
3. **Layout** (flex-1, min-h-0) — Main content area (DockLayout)
4. **StatusBar** (optional) — Bottom status strip
5. **Overlay** (portal) — Modals/drawers

**Important:** When using slots, only slot content is rendered. Non-slot children are ignored.

## Real-World Example: TaskEditor

Example showing a complete task management editor:

```tsx
import { WorkspaceShell, WorkspaceToolbar, WorkspaceLayout, WorkspacePanel, WorkspaceStatusBar } from '@forge/dev-kit';
export function TaskEditor() {
  const [tasks, setTasks] = useState([]);
  const [activeTask, setActiveTask] = useState(null);

  return (
    <WorkspaceShell
      editorId="tasks"
      title="Task Manager"
      subtitle={activeTask?.title}
      domain="tasks"
      className="bg-canvas"
    >
      <WorkspaceToolbar className="bg-sidebar border-b border-sidebar-border">
        <WorkspaceToolbar.Left>
          <Badge variant="secondary">{tasks.length} tasks</Badge>
        </WorkspaceToolbar.Left>
        <WorkspaceToolbar.Right>
          <Button onClick={() => createTask()}>
            New Task
          </Button>
        </WorkspaceToolbar.Right>
      </WorkspaceToolbar>

      <WorkspaceLayout
        layoutId="tasks-layout"
        leftDefaultSize={20}
        rightDefaultSize={25}
      >
        <WorkspaceLayout.Left>
          <WorkspacePanel panelId="task-list" title="Tasks">
            {/* Task list */}
          </WorkspacePanel>
        </WorkspaceLayout.Left>

        <WorkspaceLayout.Main>
          <WorkspacePanel panelId="task-editor" title="Editor">
            {/* Task editor */}
          </WorkspacePanel>
        </WorkspaceLayout.Main>

        <WorkspaceLayout.Right>
          <WorkspacePanel panelId="task-props" title="Properties">
            {/* Properties panel */}
          </WorkspacePanel>
        </WorkspaceLayout.Right>
      </WorkspaceLayout>

      <WorkspaceStatusBar>
        {activeTask ? `Editing: ${activeTask.title}` : 'Ready'}
      </WorkspaceStatusBar>
    </WorkspaceShell>
  );
}
```

## Data Attributes & CSS Scoping

`WorkspaceShell` sets these attributes for theming:

```html
<div
  data-editor-id="dialogue"
  data-domain="dialogue"
  data-theme="dark"
  data-density="comfortable"
  aria-label="Dialogue Editor - Main Graph"
>
  ...
</div>
```

### CSS Variable Scoping

Use data attributes to scope CSS variables:

```css
/* Global defaults */
:root {
  --graph-node-page-bg: hsl(220 20% 25%);
  --graph-node-page-border: hsl(220 70% 60%);
}

/* Dialogue domain overrides */
[data-domain="dialogue"] {
  --graph-node-page-bg: hsl(220 30% 30%);
  --graph-node-page-border: hsl(220 80% 65%);
}

/* Character domain overrides */
[data-domain="character"] {
  --graph-node-page-bg: hsl(280 30% 30%);
  --graph-node-page-border: hsl(280 80% 65%);
}

/* Density adjustments */
[data-density="compact"] {
  --control-padding-y: 0.25rem;
  --control-gap: 0.25rem;
}

[data-density="comfortable"] {
  --control-padding-y: 0.5rem;
  --control-gap: 0.5rem;
}
```

## Integration with Settings Store

In practice, `theme` and `density` come from the settings store:

```tsx
function MyEditor() {
  const editorId = 'my-editor';

  const editorTheme = useSettingsStore((s) =>
    s.getSettingValue('ui.theme', { editorId })
  ) as string | undefined;

  const editorDensity = useSettingsStore((s) =>
    s.getSettingValue('ui.density', { editorId })
  ) as string | undefined;

  return (
    <WorkspaceShell
      editorId={editorId}
      title="My Editor"
      theme={editorTheme}
      density={editorDensity}
    >
      {/* ... */}
    </WorkspaceShell>
  );
}
```

## Accessibility

- Sets `aria-label` combining `title` and `subtitle` (`"Dialogue Editor - Main Graph"`)
- `role="toolbar"` on WorkspaceToolbar (when child of WorkspaceShell)
- All interactive elements should have accessible labels

## Advanced Patterns

### Conditional Slot Content

```tsx
<WorkspaceShell editorId="video" title="Video">
  <WorkspaceShell.Toolbar>
    <WorkspaceToolbar>...</WorkspaceToolbar>
  </WorkspaceShell.Toolbar>

  <WorkspaceShell.Layout>
    <WorkspaceLayout>...</WorkspaceLayout>
  </WorkspaceShell.Layout>

  {/* Conditionally render status bar */}
  {showStatus && (
    <WorkspaceShell.StatusBar>
      <WorkspaceStatusBar>{status}</WorkspaceStatusBar>
    </WorkspaceShell.StatusBar>
  )}
</WorkspaceShell>
```

### Multiple Domains in One Editor

For multi-viewport editors (like Dialogue with narrative + storylet):

```tsx
<WorkspaceShell
  editorId="dialogue"
  title="Dialogue"
  domain="dialogue"
>
  <WorkspaceLayout>
    <WorkspaceLayout.Main>
      <div data-editor-scope="narrative">
        {/* Narrative viewport */}
      </div>
      <div data-editor-scope="storylet">
        {/* Storylet viewport */}
      </div>
    </WorkspaceLayout.Main>
  </WorkspaceLayout>
</WorkspaceShell>
```

Scope-specific styles:

```css
[data-editor-scope="narrative"] {
  --graph-accent: hsl(210 80% 60%);
}

[data-editor-scope="storylet"] {
  --graph-accent: hsl(30 80% 60%);
}
```

## TypeScript Interface

```tsx
export interface WorkspaceShellProps {
  editorId?: string;
  title: string;
  subtitle?: string;
  domain?: string;
  theme?: string;
  density?: 'compact' | 'comfortable' | string;
  className?: string;
  children?: React.ReactNode;
}
```

## Common Patterns

### Pattern: Minimal Editor Shell

```tsx
<WorkspaceShell editorId="simple" title="Simple Editor">
  <WorkspaceToolbar>
    <WorkspaceToolbar.Left>
      <span>Simple Editor</span>
    </WorkspaceToolbar.Left>
  </WorkspaceToolbar>

  <div className="flex-1 p-4">
    {/* Your editor content */}
  </div>
</WorkspaceShell>
```

### Pattern: Full-Featured Editor Shell

```tsx
<WorkspaceShell
  editorId="full"
  title="Full Editor"
  subtitle={documentName}
  domain="custom"
  theme={theme}
  density={density}
  className="bg-canvas"
>
  <WorkspaceToolbar className="bg-sidebar border-b">
    <WorkspaceToolbar.Left>
      <WorkspaceToolbar.Menubar menus={menus} />
      <WorkspaceToolbar.Separator />
      <span className="text-xs text-muted-foreground">{statusText}</span>
    </WorkspaceToolbar.Left>
    <WorkspaceToolbar.Right>
      <WorkspaceToolbar.Button onClick={onSave}>Save</WorkspaceToolbar.Button>
    </WorkspaceToolbar.Right>
  </WorkspaceToolbar>

  <WorkspaceReviewBar
    visible={hasPendingChanges}
    onRevert={onRevert}
    onAccept={onAccept}
  />

  <WorkspaceLayout layoutId="full-editor" leftDefaultSize={20} rightDefaultSize={25}>
    <WorkspaceLayout.Left>
      <WorkspacePanel panelId="nav" title="Navigator">
        {/* Navigator content */}
      </WorkspacePanel>
    </WorkspaceLayout.Left>
    <WorkspaceLayout.Main>
      <WorkspacePanel panelId="main" title="Main">
        {/* Main viewport */}
      </WorkspacePanel>
    </WorkspaceLayout.Main>
    <WorkspaceLayout.Right>
      <WorkspacePanel panelId="props" title="Properties">
        <WorkspaceInspector selection={selection} sections={sections} />
      </WorkspacePanel>
    </WorkspaceLayout.Right>
  </WorkspaceLayout>

  <WorkspaceStatusBar>
    {isDirty ? 'Unsaved changes' : 'Ready'}
  </WorkspaceStatusBar>

  <WorkspaceOverlaySurface
    overlays={overlays}
    activeOverlay={activeOverlay}
    onDismiss={dismissOverlay}
  />
</WorkspaceShell>
```

## Related Components

- [WorkspaceToolbar](./workspace-toolbar) — Toolbar with menubar, buttons, separators
- [WorkspaceLayout](./dock-layout) — Resizable panel layout
- [WorkspaceStatusBar](./workspace-status-bar.mdx) — Bottom status strip
- [WorkspaceOverlaySurface](./workspace-overlay-surface.mdx) — Modal system
- [WorkspaceReviewBar](./workspace-review-bar.mdx) — Change review bar for AI edits

## Source Code

Location: `packages/shared/src/shared/components/workspace/WorkspaceShell.tsx`

## Migration from WorkspaceShell

| Old (WorkspaceShell) | New (WorkspaceShell) |
|---------------------|-------------------|
| `workspaceId` | `editorId` |
| No slot system | Slot components (`.Toolbar`, `.Layout`, etc.) |
| Manual layout management | Automatic flex layout via slots |
| No density support | `density` prop + CSS variables |

## Best Practices

1. **Always set `editorId`** — Required for settings, AI context, and CSS scoping
2. **Use slot composition** — More maintainable than raw children
3. **Pull theme/density from settings** — Don't hardcode values
4. **Set domain for themed editors** — Enables domain-specific color schemes
5. **Use className sparingly** — Prefer CSS variables over Tailwind overrides
