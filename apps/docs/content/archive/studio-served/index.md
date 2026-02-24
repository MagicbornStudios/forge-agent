---
title: Forge Platform Documentation
---

**Build professional desktop-class editors in the browser with AI-first components**

---

## Quick Start

### Installation

```bash
npm install @forge/dev-kit
```

### Your First Editor

```typescript
import { EditorShell, EditorToolbar, WorkspaceLayout, WorkspacePanel, EditorStatusBar } from '@forge/dev-kit';
import { Button } from '@forge/dev-kit/ui';

export function TaskEditor() {
  return (
    <EditorShell editorId="tasks" title="Task Manager">
      <EditorToolbar>
        <EditorToolbar.Left>
          <span>Tasks</span>
        </EditorToolbar.Left>
        <EditorToolbar.Right>
          <Button>New Task</Button>
        </EditorToolbar.Right>
      </EditorToolbar>

      <WorkspaceLayout layoutId="tasks-layout">
        <WorkspaceLayout.Main>
          <WorkspacePanel id="main" title="Tasks">
            {/* Your content here */}
          </WorkspacePanel>
        </WorkspaceLayout.Main>
      </WorkspaceLayout>

      <EditorStatusBar>Ready</EditorStatusBar>
    </EditorShell>
  );
}
```

---

## Next Steps

- [Components](/docs/components) - Browse the component showcase and editor docs
- [Quick Start Tutorial](/docs/tutorials/quick-start) - Build your first editor in 10 minutes
- [API Reference](/docs/api-reference) - Package structure and TypeScript types
- [AI System](/docs/ai-system/overview) - AI integration architecture
