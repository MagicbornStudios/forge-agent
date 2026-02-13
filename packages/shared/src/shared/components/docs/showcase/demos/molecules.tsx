'use client';

import * as React from 'react';
import * as UI from '@forge/ui';
import {
  EditorDockLayout,
  EditorDockPanel,
  EditorShell,
  EditorStatusBar,
  EditorToolbar,
} from '../../../editor';
import { ComposerAddAttachment, Thread } from '../../../assistant-ui';
import { PlanActionBar, PlanCard } from '../../../../copilot/generative-ui';
import { AssistantDemoHarness, ShowcaseDemoSurface } from './harnesses';

type DemoRenderer = () => React.JSX.Element;

function EditorShellDemo() {
  return (
    <ShowcaseDemoSurface className="h-[520px] p-0">
      <EditorShell editorId="demo-editor" title="Demo Editor" domain="demo" className="h-full">
        <EditorShell.Toolbar>
          <EditorToolbar className="border-b">
            <EditorToolbar.Left>
              <span className="text-xs font-medium">Demo Editor</span>
            </EditorToolbar.Left>
            <EditorToolbar.Right>
              <UI.Button size="sm" variant="outline">
                Save
              </UI.Button>
            </EditorToolbar.Right>
          </EditorToolbar>
        </EditorShell.Toolbar>
        <EditorShell.Layout>
          <EditorDockLayout layoutId="demo-layout">
            <EditorDockLayout.Left>
              <EditorDockPanel panelId="left" title="Navigator">
                <div className="p-3 text-xs text-muted-foreground">Left rail content</div>
              </EditorDockPanel>
            </EditorDockLayout.Left>
            <EditorDockLayout.Main>
              <EditorDockPanel panelId="main" title="Viewport" scrollable={false}>
                <div className="flex h-full min-h-[180px] items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground">
                  Main content area
                </div>
              </EditorDockPanel>
            </EditorDockLayout.Main>
          </EditorDockLayout>
        </EditorShell.Layout>
        <EditorShell.StatusBar>
          <EditorStatusBar>Ready</EditorStatusBar>
        </EditorShell.StatusBar>
      </EditorShell>
    </ShowcaseDemoSurface>
  );
}

function DockLayoutDemo() {
  return (
    <ShowcaseDemoSurface className="h-[420px] p-0">
      <EditorDockLayout layoutId="demo-dock-layout" className="h-full">
        <EditorDockLayout.Left>
          <EditorDockPanel panelId="nav" title="Navigator">
            <div className="p-3 text-xs text-muted-foreground">Left rail</div>
          </EditorDockPanel>
        </EditorDockLayout.Left>
        <EditorDockLayout.Main>
          <EditorDockPanel panelId="viewport" title="Viewport" scrollable={false}>
            <div className="flex h-full min-h-[160px] items-center justify-center text-xs text-muted-foreground">
              Main viewport
            </div>
          </EditorDockPanel>
        </EditorDockLayout.Main>
        <EditorDockLayout.Right>
          <EditorDockPanel panelId="inspector" title="Inspector">
            <div className="p-3 text-xs text-muted-foreground">Right rail</div>
          </EditorDockPanel>
        </EditorDockLayout.Right>
      </EditorDockLayout>
    </ShowcaseDemoSurface>
  );
}

function EditorToolbarDemo() {
  return (
    <ShowcaseDemoSurface className="p-0">
      <EditorToolbar className="border-b px-2 py-1">
        <EditorToolbar.Left>
          <span className="text-xs font-medium">Editor title</span>
        </EditorToolbar.Left>
        <EditorToolbar.Right>
          <UI.Button size="sm" variant="outline">
            Undo
          </UI.Button>
          <UI.Button size="sm" variant="outline">
            Redo
          </UI.Button>
          <UI.Button size="sm">Save</UI.Button>
        </EditorToolbar.Right>
      </EditorToolbar>
      <div className="p-4 text-sm text-muted-foreground">Toolbar content area</div>
    </ShowcaseDemoSurface>
  );
}

function PanelTabsDemo() {
  return (
    <ShowcaseDemoSurface className="p-0">
      <div className="h-[280px] overflow-hidden rounded-lg border border-border">
        <UI.Tabs defaultValue="inspector" className="h-full">
          <UI.TabsList className="mx-3 mt-3">
            <UI.TabsTrigger value="inspector">Inspector</UI.TabsTrigger>
            <UI.TabsTrigger value="assistant">Assistant</UI.TabsTrigger>
          </UI.TabsList>
          <UI.TabsContent value="inspector" className="p-4 text-sm">
            Inspector content
          </UI.TabsContent>
          <UI.TabsContent value="assistant" className="p-4 text-sm">
            Assistant content
          </UI.TabsContent>
        </UI.Tabs>
      </div>
    </ShowcaseDemoSurface>
  );
}

function SettingsPanelDemo() {
  return (
    <ShowcaseDemoSurface>
      <UI.Card className="max-w-md">
        <UI.CardHeader>
          <UI.CardTitle>Appearance</UI.CardTitle>
          <UI.CardDescription>Settings panel with simple field controls.</UI.CardDescription>
        </UI.CardHeader>
        <UI.CardContent className="space-y-4">
          <div className="space-y-2">
            <UI.Label htmlFor="settings-theme">Theme</UI.Label>
            <UI.Select defaultValue="dark">
              <UI.SelectTrigger id="settings-theme">
                <UI.SelectValue />
              </UI.SelectTrigger>
              <UI.SelectContent>
                <UI.SelectItem value="dark">Dark</UI.SelectItem>
                <UI.SelectItem value="light">Light</UI.SelectItem>
              </UI.SelectContent>
            </UI.Select>
          </div>
          <label className="flex items-center justify-between text-sm">
            Use compact density
            <UI.Switch defaultChecked />
          </label>
        </UI.CardContent>
      </UI.Card>
    </ShowcaseDemoSurface>
  );
}

function AssistantPanelDemo() {
  return (
    <AssistantDemoHarness className="p-0">
      <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-border bg-background">
        <Thread />
      </div>
    </AssistantDemoHarness>
  );
}

function AttachmentDemo() {
  return (
    <AssistantDemoHarness className="h-[360px] p-0">
      <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-border bg-background">
        <Thread composerLeading={<ComposerAddAttachment />} />
      </div>
    </AssistantDemoHarness>
  );
}

function PlanCardDemo() {
  return (
    <ShowcaseDemoSurface>
      <PlanCard
        title="Add dialogue node"
        summary="Create a new character node and connect to the narrative branch."
        steps={[
          { title: 'Create CHARACTER node', description: 'Place at (120, 80)', meta: 'node' },
          { title: 'Connect to PLAYER', description: 'Add edge for dialogue flow', meta: 'edge' },
        ]}
        footer={<PlanActionBar onAccept={() => undefined} onReject={() => undefined} />}
      />
    </ShowcaseDemoSurface>
  );
}

export const MOLECULE_SHOWCASE_DEMOS: Record<string, DemoRenderer> = {
  'editor-shell-demo': EditorShellDemo,
  'dock-layout-demo': DockLayoutDemo,
  'editor-toolbar-demo': EditorToolbarDemo,
  'panel-tabs-demo': PanelTabsDemo,
  'settings-panel-demo': SettingsPanelDemo,
  'assistant-panel-demo': AssistantPanelDemo,
  'attachment-demo': AttachmentDemo,
  'plan-card-demo': PlanCardDemo,
};

