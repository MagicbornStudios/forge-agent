'use client';

import * as React from 'react';
import * as Editor from '@forge/shared/components/editor';
import type { ComponentDemoId } from './generated-ids';
import {
  ComponentDemoFrame,
  EditorDemoHarness,
  PanelRegistrationProbe,
  SettingsTriggerProbe,
} from './harnesses';

export type EditorDemoId = Extract<ComponentDemoId, `editor.${string}`>;

type DemoRenderer = () => React.JSX.Element;

const SHARED_MENUS = Editor.createEditorMenubarMenus({
  file: [
    Editor.EditorFileMenuNew(),
    Editor.EditorFileMenuOpen(),
    Editor.EditorFileMenuSave(),
  ],
  edit: [Editor.EditorEditMenu.Undo(), Editor.EditorEditMenu.Redo()],
});

function PanelSettingsDemo() {
  const [dense, setDense] = React.useState(true);

  return (
    <ComponentDemoFrame>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Density: {dense ? 'compact' : 'comfortable'}</span>
        <Editor.PanelSettings
          panelId="panel-settings-demo"
          settings={[
            {
              id: 'density',
              label: 'Compact density',
              type: 'toggle',
              value: dense,
              onChange: (value) => setDense(Boolean(value)),
            },
          ]}
        />
      </div>
    </ComponentDemoFrame>
  );
}

function SettingsTabsDemo() {
  const [activeTab, setActiveTab] = React.useState('general');

  return (
    <ComponentDemoFrame>
      <div className="h-[220px] rounded-md border border-border/70 p-3">
        <Editor.SettingsTabs
          value={activeTab}
          onValueChange={setActiveTab}
          tabs={[
            {
              id: 'general',
              label: 'General',
              content: <div className="text-xs text-muted-foreground">General settings</div>,
            },
            {
              id: 'appearance',
              label: 'Appearance',
              content: <div className="text-xs text-muted-foreground">Appearance settings</div>,
            },
          ]}
        />
      </div>
    </ComponentDemoFrame>
  );
}

const EDITOR_DEMOS: Record<EditorDemoId, DemoRenderer> = {
  'editor.dock-layout': () => (
    <EditorDemoHarness>
      <Editor.EditorDockLayout
        layoutId="docs-demo-dock-layout"
        left={
          <Editor.EditorDockPanel panelId="dock-left" title="Left Rail">
            <p className="text-xs text-muted-foreground">Left rail content</p>
          </Editor.EditorDockPanel>
        }
        main={
          <Editor.EditorDockPanel panelId="dock-main" title="Main View" scrollable={false}>
            <div className="flex h-full min-h-[160px] items-center justify-center rounded-md border border-dashed border-border/70 text-xs text-muted-foreground">
              DockLayout viewport
            </div>
          </Editor.EditorDockPanel>
        }
        right={
          <Editor.EditorDockPanel panelId="dock-right" title="Inspector">
            <p className="text-xs text-muted-foreground">Inspector controls</p>
          </Editor.EditorDockPanel>
        }
      />
    </EditorDemoHarness>
  ),
  'editor.dock-panel': () => (
    <EditorDemoHarness>
      <Editor.EditorDockPanel
        panelId="dock-panel-preview"
        title="Dock Panel"
        headerActions={<Editor.EditorButton size="sm" variant="outline">Action</Editor.EditorButton>}
      >
        <div className="space-y-2 text-xs text-muted-foreground">
          <p>Panel header, body, and action region.</p>
          <p>Used in docked rails and tab stacks.</p>
        </div>
      </Editor.EditorDockPanel>
    </EditorDemoHarness>
  ),
  'editor.dock-sidebar': () => (
    <EditorDemoHarness>
      <div className="h-[280px] rounded-md border border-border/70">
        <Editor.DockSidebar>
          <Editor.SidebarHeader>
            <span className="text-xs font-semibold">Dock Sidebar</span>
          </Editor.SidebarHeader>
          <Editor.SidebarContent>
            <Editor.SidebarMenu>
              <Editor.SidebarMenuItem>
                <Editor.SidebarMenuButton isActive>Graphs</Editor.SidebarMenuButton>
              </Editor.SidebarMenuItem>
              <Editor.SidebarMenuItem>
                <Editor.SidebarMenuButton>Nodes</Editor.SidebarMenuButton>
              </Editor.SidebarMenuItem>
            </Editor.SidebarMenu>
          </Editor.SidebarContent>
        </Editor.DockSidebar>
      </div>
    </EditorDemoHarness>
  ),
  'editor.dockview-slot-tab': () => (
    <EditorDemoHarness>
      <Editor.EditorDockLayout
        layoutId="docs-demo-slot-tab"
        mainPanels={[
          {
            id: 'slot-tab-main',
            title: 'Slot Tab Preview',
            content: (
              <Editor.EditorDockPanel panelId="slot-tab-panel" title="Panel" scrollable={false}>
                <div className="flex h-full min-h-[150px] items-center justify-center text-xs text-muted-foreground">
                  DockviewSlotTab is rendered in the tab bar above.
                </div>
              </Editor.EditorDockPanel>
            ),
          },
        ]}
      />
    </EditorDemoHarness>
  ),
  'editor.editor-bottom-panel': () => (
    <EditorDemoHarness>
      <Editor.EditorBottomPanel>
        <div className="text-xs text-muted-foreground">Bottom panel stream output</div>
      </Editor.EditorBottomPanel>
    </EditorDemoHarness>
  ),
  'editor.editor-button': () => (
    <ComponentDemoFrame>
      <div className="flex flex-wrap gap-2">
        <Editor.EditorButton size="sm">Primary</Editor.EditorButton>
        <Editor.EditorButton size="sm" variant="outline" tooltip="Outline action">
          Outline
        </Editor.EditorButton>
      </div>
    </ComponentDemoFrame>
  ),
  'editor.editor-header': () => (
    <ComponentDemoFrame>
      <Editor.EditorHeader>
        <Editor.EditorHeader.Left>
          <span className="text-xs font-semibold">Left</span>
        </Editor.EditorHeader.Left>
        <Editor.EditorHeader.Center>
          <span className="text-xs text-muted-foreground">Centered title</span>
        </Editor.EditorHeader.Center>
        <Editor.EditorHeader.Right>
          <Editor.EditorButton size="sm" variant="outline">Save</Editor.EditorButton>
        </Editor.EditorHeader.Right>
      </Editor.EditorHeader>
    </ComponentDemoFrame>
  ),
  'editor.editor-inspector': () => (
    <ComponentDemoFrame>
      <Editor.EditorInspector>
        <div className="space-y-2 text-xs text-muted-foreground">
          <p>Inspector section one</p>
          <p>Inspector section two</p>
        </div>
      </Editor.EditorInspector>
    </ComponentDemoFrame>
  ),
  'editor.editor-overlay-surface': () => {
    const overlays: React.ComponentProps<typeof Editor.EditorOverlaySurface>['overlays'] = [
      {
        id: 'overlay-demo',
        type: 'modal',
        title: 'Overlay Surface',
        size: 'sm',
        render: ({ onDismiss }) => (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Editor overlay content.</p>
            <Editor.EditorButton size="sm" onClick={onDismiss}>Close</Editor.EditorButton>
          </div>
        ),
      },
    ];

    return (
      <ComponentDemoFrame>
        <Editor.EditorOverlaySurface
          overlays={overlays}
          activeOverlay={{ id: 'overlay-demo', payload: {} }}
          onDismiss={() => undefined}
        />
        <p className="text-xs text-muted-foreground">Overlay opens above this preview.</p>
      </ComponentDemoFrame>
    );
  },
  'editor.editor-panel': () => (
    <ComponentDemoFrame>
      <Editor.PanelRegistrationContextProvider value={{ editorId: 'docs-editor' }}>
        <Editor.EditorRail side="left">
          <Editor.EditorPanel id="panel-a" title="Panel A">
            <PanelRegistrationProbe />
          </Editor.EditorPanel>
        </Editor.EditorRail>
        <div className="text-xs text-muted-foreground">EditorPanel mounted inside EditorRail.</div>
      </Editor.PanelRegistrationContextProvider>
    </ComponentDemoFrame>
  ),
  'editor.editor-rail': () => (
    <ComponentDemoFrame>
      <Editor.PanelRegistrationContextProvider value={{ editorId: 'docs-editor' }}>
        <Editor.EditorRail side="right">
          <Editor.EditorPanel id="rail-panel" title="Rail Panel">
            <div className="text-xs text-muted-foreground">Rail-managed panel content</div>
          </Editor.EditorPanel>
        </Editor.EditorRail>
        <PanelRegistrationProbe />
      </Editor.PanelRegistrationContextProvider>
    </ComponentDemoFrame>
  ),
  'editor.editor-review-bar': () => (
    <ComponentDemoFrame>
      <Editor.EditorReviewBar
        visible
        label="AI suggested 3 updates"
        onRevert={() => undefined}
        onAccept={() => undefined}
      />
    </ComponentDemoFrame>
  ),
  'editor.editor-settings-trigger': () => (
    <ComponentDemoFrame>
      <Editor.SettingsTriggerProvider openSettings={() => undefined}>
        <Editor.EditorSettingsTrigger tooltip="Open settings" />
      </Editor.SettingsTriggerProvider>
    </ComponentDemoFrame>
  ),
  'editor.editor-shell': () => (
    <EditorDemoHarness />
  ),
  'editor.editor-sidebar': () => (
    <ComponentDemoFrame>
      <div className="h-[260px] rounded-md border border-border/70">
        <Editor.EditorSidebar>
          <Editor.SidebarHeader>
            <span className="text-xs font-semibold">Editor Sidebar</span>
          </Editor.SidebarHeader>
          <Editor.SidebarContent>
            <Editor.SidebarMenu>
              <Editor.SidebarMenuItem>
                <Editor.SidebarMenuButton isActive>Overview</Editor.SidebarMenuButton>
              </Editor.SidebarMenuItem>
              <Editor.SidebarMenuItem>
                <Editor.SidebarMenuButton>Tools</Editor.SidebarMenuButton>
              </Editor.SidebarMenuItem>
            </Editor.SidebarMenu>
          </Editor.SidebarContent>
        </Editor.EditorSidebar>
      </div>
    </ComponentDemoFrame>
  ),
  'editor.editor-status-bar': () => (
    <ComponentDemoFrame>
      <Editor.EditorStatusBar>Ready</Editor.EditorStatusBar>
    </ComponentDemoFrame>
  ),
  'editor.editor-tab': () => (
    <ComponentDemoFrame>
      <div className="flex gap-2">
        <Editor.EditorTab label="Dialogue" isActive />
        <Editor.EditorTab label="Character" />
      </div>
    </ComponentDemoFrame>
  ),
  'editor.editor-tab-group': () => (
    <ComponentDemoFrame>
      <Editor.EditorTabGroup
        leading={<Editor.EditorButton size="sm" variant="outline">Menu</Editor.EditorButton>}
        actions={<Editor.EditorButton size="sm" variant="outline">Settings</Editor.EditorButton>}
      >
        <Editor.EditorTab label="Dialogue" isActive />
        <Editor.EditorTab label="Character" />
      </Editor.EditorTabGroup>
    </ComponentDemoFrame>
  ),
  'editor.editor-toolbar': () => (
    <ComponentDemoFrame>
      <Editor.EditorToolbar>
        <Editor.EditorToolbar.Left>
          <Editor.EditorToolbar.Group>
            <Editor.EditorMenubar menus={SHARED_MENUS} />
          </Editor.EditorToolbar.Group>
        </Editor.EditorToolbar.Left>
        <Editor.EditorToolbar.Right>
          <Editor.EditorButton size="sm" variant="outline">Run</Editor.EditorButton>
        </Editor.EditorToolbar.Right>
      </Editor.EditorToolbar>
    </ComponentDemoFrame>
  ),
  'editor.editor-tooltip': () => (
    <ComponentDemoFrame>
      <Editor.EditorTooltip tooltip="Tooltip content">
        <Editor.EditorButton size="sm" variant="outline">Hover</Editor.EditorButton>
      </Editor.EditorTooltip>
    </ComponentDemoFrame>
  ),
  'editor.panel-registration-context': () => (
    <ComponentDemoFrame>
      <Editor.PanelRegistrationContextProvider value={{ editorId: 'docs-editor' }}>
        <PanelRegistrationProbe />
      </Editor.PanelRegistrationContextProvider>
    </ComponentDemoFrame>
  ),
  'editor.panel-settings': PanelSettingsDemo,
  'editor.panel-tabs': () => (
    <ComponentDemoFrame>
      <div className="h-[220px] rounded-md border border-border/70">
        <Editor.PanelTabs
          tabs={[
            {
              id: 'overview',
              label: 'Overview',
              content: <div className="p-3 text-xs text-muted-foreground">Overview content</div>,
            },
            {
              id: 'details',
              label: 'Details',
              content: <div className="p-3 text-xs text-muted-foreground">Details content</div>,
            },
          ]}
        />
      </div>
    </ComponentDemoFrame>
  ),
  'editor.settings-tabs': SettingsTabsDemo,
  'editor.settings-trigger-context': () => (
    <ComponentDemoFrame>
      <Editor.SettingsTriggerProvider openSettings={() => undefined}>
        <SettingsTriggerProbe />
      </Editor.SettingsTriggerProvider>
    </ComponentDemoFrame>
  ),
  'editor.toolbar-editor-edit-menu': () => (
    <ComponentDemoFrame>
      <Editor.EditorMenubar
        menus={Editor.createEditorMenubarMenus({
          file: [Editor.EditorFileMenuNew()],
          edit: [
            Editor.EditorEditMenu.Undo(),
            Editor.EditorEditMenu.Redo(),
            Editor.EditorEditMenu.Copy(),
            Editor.EditorEditMenu.Paste(),
          ],
        })}
      />
    </ComponentDemoFrame>
  ),
  'editor.toolbar-editor-file-menu': () => (
    <ComponentDemoFrame>
      <Editor.EditorFileMenu
        items={[
          { id: 'new', label: 'New' },
          { id: 'open', label: 'Open' },
          { id: 'sep-1', type: 'separator' },
          { id: 'save', label: 'Save', shortcut: 'Ctrl+S' },
        ]}
      />
    </ComponentDemoFrame>
  ),
  'editor.toolbar-editor-help-menu': () => (
    <ComponentDemoFrame>
      <Editor.EditorMenubar
        menus={Editor.createEditorMenubarMenus({
          file: [Editor.EditorFileMenuNew()],
          help: [
            Editor.EditorHelpMenu.Welcome(),
            Editor.EditorHelpMenu.ShowCommands(),
            Editor.EditorHelpMenu.About(),
          ],
        })}
      />
    </ComponentDemoFrame>
  ),
  'editor.toolbar-editor-menubar': () => (
    <ComponentDemoFrame>
      <Editor.EditorMenubar menus={SHARED_MENUS} />
    </ComponentDemoFrame>
  ),
  'editor.toolbar-editor-project-select': () => (
    <ComponentDemoFrame>
      <Editor.EditorProjectSelect
        value="project-a"
        options={[
          { value: 'project-a', label: 'Project A' },
          { value: 'project-b', label: 'Project B' },
        ]}
      />
    </ComponentDemoFrame>
  ),
  'editor.toolbar-editor-settings-menu': () => (
    <ComponentDemoFrame>
      <Editor.EditorMenubar
        menus={Editor.createEditorMenubarMenus({
          file: [Editor.EditorFileMenuNew()],
          settings: [
            Editor.EditorSettingsMenu.OpenSettings(),
            Editor.EditorSettingsMenu.Separator(),
            Editor.EditorSettingsMenu.User({ label: 'Account' }),
          ],
        })}
      />
    </ComponentDemoFrame>
  ),
  'editor.toolbar-editor-view-menu': () => (
    <ComponentDemoFrame>
      <Editor.EditorMenubar
        menus={Editor.createEditorMenubarMenus({
          file: [Editor.EditorFileMenuNew()],
          view: [
            Editor.EditorViewMenu.PanelToggle({ id: 'library', label: 'Library', checked: true }),
            Editor.EditorViewMenu.PanelToggle({ id: 'assistant', label: 'Assistant', checked: false }),
          ],
        })}
      />
    </ComponentDemoFrame>
  ),
  'editor.viewport-meta': () => (
    <ComponentDemoFrame>
      <Editor.ViewportMeta viewportId="docs-viewport" viewportType="preview" viewportScope="docs">
        <div className="rounded-md border border-dashed border-border/70 p-4 text-xs text-muted-foreground">
          Viewport metadata wrapper
        </div>
      </Editor.ViewportMeta>
    </ComponentDemoFrame>
  ),
};

export function getEditorDemo(id: EditorDemoId): DemoRenderer {
  return EDITOR_DEMOS[id];
}
