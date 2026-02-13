---
title: Forge Platform Documentation
---

**Build professional desktop-class editors in the browser with AI-first components**

---

## What is Forge?

Forge is a complete development platform for building sophisticated editors with minimal effort. Whether you're creating a task manager, data editor, or creative tool, Forge provides everything you need.

### Platform + Dev-Kit

**Forge Platform** - The hosted environment with authentication, data persistence, and infrastructure
**@forge/dev-kit** - The npm package with all UI components, types, and utilities

### Why Use Forge?

- **Narrative-First** - Built for apps that tell stories, manage workflows, or organize complex data
- **Quick Start** - Install one package, start building immediately
- **AI-Powered** - Deep integration with AI assistants and automation
- **Production Ready** - Battle-tested components used in real applications

---

## Quick Start

### Installation

```bash
npm install @forge/dev-kit
```

### Your First Editor

```typescript
import { EditorShell, EditorToolbar, EditorDockLayout, EditorDockPanel, EditorStatusBar } from '@forge/dev-kit';
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

      <EditorDockLayout layoutId="tasks-layout">
        <EditorDockLayout.Main>
          <EditorDockPanel id="main" title="Tasks">
            {/* Your content here */}
          </EditorDockPanel>
        </EditorDockLayout.Main>
      </EditorDockLayout>

      <EditorStatusBar>Ready</EditorStatusBar>
    </EditorShell>
  );
}
```

---

## Documentation Sections

### 📚 Getting Started
- [Platform Overview](/docs/overview) - What Forge provides
- [Quick Start Tutorial](/docs/tutorials/quick-start) - Build your first editor in 10 minutes

### 🧩 Components
- [Component Showcase](/docs/components) - All available UI components
- [Editor Shell](/docs/components/editor-shell) - Root container
- [Dock Layout](/docs/components/dock-layout) - VSCode-style panels
- [Dock Panel](/docs/components/dock-panel) - Individual panels
- [Editor Toolbar](/docs/components/editor-toolbar) - Customizable toolbar
- [Editor Inspector](/docs/components/editor-inspector) - Properties panel
- [Editor Overlay](/docs/components/editor-overlay) - Modal system
- [Panel Tabs](/docs/components/panel-tabs) - Tab system
- [Settings System](/docs/components/settings-system) - Configuration UI

### 📖 Tutorials
- [Quick Start](/docs/tutorials/quick-start) - Build your first editor (10 min)
- [Adding Panels](/docs/tutorials/adding-panels) - Add custom panels
- [AI Integration](/docs/tutorials/ai-integration) - Integrate AI features

### 🎓 Guides
- [Architecture](/docs/guides/architecture) - System design and patterns
- [Component Patterns](/docs/guides/patterns) - Best practices
- [Theming](/docs/guides/theming) - Customize styling
- [Performance](/docs/guides/performance) - Optimization tips

### 📦 Reference
- [Package Structure](/docs/reference/packages) - What's in @forge/dev-kit
- [TypeScript Types](/docs/reference/typescript-interfaces) - Type definitions

### 🤖 AI System
- [AI System Overview](/docs/ai-system/overview) - AI integration architecture
- [Developer Guide](/docs/developer-guide) - Advanced topics

---

## Key Features

### 🏗️ Complete Editor Framework
- **EditorShell** - Theme, density, and domain scoping
- **DockLayout** - Resizable panels with persistence
- **Toolbar** - Menubar, buttons, and actions
- **StatusBar** - Bottom status display
- **Modals** - Dialog and drawer system

### 🎨 UI Components
- **40+ Components** - Based on shadcn/ui
- **Fully Typed** - Complete TypeScript support
- **Accessible** - WCAG AA compliant
- **Themeable** - Dark/light modes built-in

### 🤖 AI Integration
- **Domain Contracts** - Define AI capabilities per editor
- **Tool System** - AI can execute operations
- **Custom Rendering** - Render tool results in chat
- **Context Aware** - AI knows your editor state

### ⚙️ Settings System
- **Hierarchical** - App → Project → Editor → Viewport
- **Type Safe** - Generated TypeScript types
- **UI First** - Declare settings in components
- **Visual Overrides** - See inheritance chain

---

## Next Steps

1. **[Read Platform Overview](/docs/overview)** - Understand what Forge provides
2. **[Try Quick Start](/docs/tutorials/quick-start)** - Build TaskEditor in 10 minutes
3. **[Browse Components](/docs/components)** - See all available components
4. **[Explore AI System](/docs/ai-system/overview)** - Learn about AI integration

---

## Community & Support

- **Documentation** - You're reading it
- **GitHub** - Report issues and contribute
- **Discord** - Join the community

---

## License

MIT - Use Forge in commercial and open-source projects.
