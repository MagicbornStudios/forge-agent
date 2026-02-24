/** Code is merged from catalog-code.generated.mjs (via _showcase-code-map.json). */

const PLACEHOLDER_CODE = { path: '', language: 'tsx', code: '// Run pnpm docs:showcase:generate' };

export const SHOWCASE_CATALOG_DATA = {
  sections: [
    {
      id: 'atoms',
      title: 'Atoms',
      description:
        'Foundational @forge/ui primitives and style controls used by both Studio and Platform.',
      entries: [
        { id: 'theme-switcher-demo', title: 'Theme Switcher', summary: 'Theme controls used in internal documentation and agent workflows.', demoId: 'theme-switcher-demo', previewHeight: 420, code: { files: [PLACEHOLDER_CODE] } },
        { id: 'density-demo', title: 'Density', summary: 'Compact versus comfortable control density for editor surfaces.', demoId: 'density-demo', previewHeight: 460, code: { files: [PLACEHOLDER_CODE] } },
        { id: 'accordion-demo', title: 'Accordion', summary: 'Collapsible content panels for FAQs and grouped sections.', demoId: 'accordion-demo', code: { files: [PLACEHOLDER_CODE] } },
        { id: 'badge-demo', title: 'Badge', summary: 'Status and context labels for metadata and callouts.', demoId: 'badge-demo', code: { files: [PLACEHOLDER_CODE] } },
        { id: 'button-demo', title: 'Button', summary: 'Primary and secondary actions with token-driven sizing.', demoId: 'button-demo', code: { files: [PLACEHOLDER_CODE] } },
        { id: 'card-demo', title: 'Card', summary: 'Composable card surface used across editors and docs callouts.', demoId: 'card-demo', code: { files: [PLACEHOLDER_CODE] } },
        { id: 'dialog-demo', title: 'Dialog', summary: 'Modal interaction pattern for confirmations and inline forms.', demoId: 'dialog-demo', code: { files: [PLACEHOLDER_CODE] } },
        { id: 'dropdown-menu-demo', title: 'Dropdown Menu', summary: 'Compact action menu with keyboard navigation and command grouping.', demoId: 'dropdown-menu-demo', code: { files: [PLACEHOLDER_CODE] } },
        { id: 'input-demo', title: 'Input', summary: 'Single-line text entry with shared spacing and border tokens.', demoId: 'input-demo', code: { files: [PLACEHOLDER_CODE] } },
        { id: 'label-demo', title: 'Label', summary: 'Accessible form labels paired with inputs and controls.', demoId: 'label-demo', code: { files: [PLACEHOLDER_CODE] } },
        { id: 'select-demo', title: 'Select', summary: 'Controlled list selection for settings and filters.', demoId: 'select-demo', code: { files: [PLACEHOLDER_CODE] } },
        { id: 'switch-demo', title: 'Switch', summary: 'Boolean toggle with label for instant state changes.', demoId: 'switch-demo', code: { files: [PLACEHOLDER_CODE] } },
        { id: 'tabs-demo', title: 'Tabs', summary: 'Segmented navigation for switching between related panels.', demoId: 'tabs-demo', code: { files: [PLACEHOLDER_CODE] } },
      ],
    },
    {
      id: 'molecules',
      title: 'Molecules',
      description:
        'Editor platform compositions from @forge/shared used to construct full application surfaces.',
      entries: [
        { id: 'dock-layout-demo', title: 'WorkspaceLayout', summary: 'Composable left/main/right/bottom layout with dock panel helpers.', demoId: 'dock-layout-demo', previewHeight: 620, code: { files: [PLACEHOLDER_CODE] } },
        { id: 'dock-panel-demo', title: 'WorkspacePanel', summary: 'Individual panel wrapper within WorkspaceLayout with title bar, scrolling, and tabs.', demoId: 'dock-panel-demo', code: { files: [PLACEHOLDER_CODE] } },
        { id: 'editor-toolbar-demo', title: 'EditorToolbar', summary: 'Toolbar groups and actions for top-of-editor command surfaces.', demoId: 'editor-toolbar-demo', code: { files: [PLACEHOLDER_CODE] } },
        { id: 'editor-inspector-demo', title: 'EditorInspector', summary: 'Selection-driven properties panel with conditional sections.', demoId: 'editor-inspector-demo', code: { files: [PLACEHOLDER_CODE] } },
        { id: 'editor-overlay-demo', title: 'EditorOverlaySurface', summary: 'Declarative modal system for overlays, dialogs, and popovers.', demoId: 'editor-overlay-demo', code: { files: [PLACEHOLDER_CODE] } },
        { id: 'panel-tabs-demo', title: 'PanelTabs', summary: 'Tabbed panel content used by inspectors and assistant rails.', demoId: 'panel-tabs-demo', code: { files: [PLACEHOLDER_CODE] } },
        { id: 'settings-panel-demo', title: 'Settings Panel', summary: 'Settings-oriented layout pattern used for preference forms.', demoId: 'settings-panel-demo', code: { files: [PLACEHOLDER_CODE] } },
        { id: 'attachment-demo', title: 'Attachment', summary: 'Composer attachment UI for images and files in assistant threads.', demoId: 'attachment-demo', previewHeight: 420, code: { files: [PLACEHOLDER_CODE] } },
        { id: 'assistant-panel-demo', title: 'Assistant Panel', summary: 'Live assistant thread rendering with a local mocked runtime adapter.', demoId: 'assistant-panel-demo', previewHeight: 640, code: { files: [PLACEHOLDER_CODE] } },
        { id: 'plan-card-demo', title: 'Plan Card', summary: 'Structured plan response card used for AI-generated stepwise workflows.', demoId: 'plan-card-demo', code: { files: [PLACEHOLDER_CODE] } },
        { id: 'toolbar-editor-settings-menu-demo', title: 'Toolbar Editor Settings Menu', summary: 'Settings menu items (Open Settings, Account) for the editor menubar.', demoId: 'toolbar-editor-settings-menu-demo', code: { files: [PLACEHOLDER_CODE] } },
        { id: 'studio-menubar-contribution-demo', title: 'Studio Menubar Contribution', summary: 'App-tab menubar that merges shared menus with active-editor menu contributions.', demoId: 'studio-menubar-contribution-demo', previewHeight: 420, code: { files: [PLACEHOLDER_CODE] } },
        { id: 'dock-sidebar-demo', title: 'Dock Sidebar', summary: 'Grid-embedded sidebar for dock layout panels with menu and header.', demoId: 'dock-sidebar-demo', code: { files: [PLACEHOLDER_CODE] } },
        { id: 'plan-demo', title: 'Plan', summary: 'Tool-ui plan component for stepwise todo lists from AI workflows.', demoId: 'plan-demo', code: { files: [PLACEHOLDER_CODE] } },
      ],
    },
    {
      id: 'organisms',
      title: 'Organisms',
      description:
        'Large composed surfaces that bring editor, assistant, and tooling layers together.',
      entries: [
        { id: 'editor-shell-demo', title: 'EditorShell', summary: 'Declarative root for editor header, toolbar, layout, overlays, and status bar.', demoId: 'editor-shell-demo', previewHeight: 660, installCommand: 'pnpm --filter @forge/studio dev', code: { files: [PLACEHOLDER_CODE] } },
        { id: 'settings-system-demo', title: 'Settings System', summary: 'Data-driven settings with inheritance, scopes, and code generation.', demoId: 'settings-system-demo', previewHeight: 520, code: { files: [PLACEHOLDER_CODE] } },
        { id: 'studio-workbench-demo', title: 'Studio Workbench (Mock)', summary: 'Studio-like shell with two editors, editor-scoped menu contributions, and settings contributions using static mock data.', demoId: 'studio-workbench-demo', previewHeight: 860, code: { files: [PLACEHOLDER_CODE] } },
        { id: 'codebase-agent-strategy-editor', title: 'Codebase Agent Strategy Editor', summary: 'End-to-end strategy editor surface with assistant-aware planning interactions.', demoId: 'codebase-agent-strategy-editor', previewHeight: 780, code: { files: [PLACEHOLDER_CODE] } },
      ],
    },
  ],
};
