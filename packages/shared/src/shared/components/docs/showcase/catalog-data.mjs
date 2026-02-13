export const SHOWCASE_CATALOG_DATA = {
  sections: [
    {
      id: 'atoms',
      title: 'Atoms',
      description:
        'Foundational @forge/ui primitives and style controls used by both Studio and Platform.',
      entries: [
        {
          id: 'theme-switcher-demo',
          title: 'Theme Switcher',
          summary: 'Theme controls used in internal documentation and agent workflows.',
          demoId: 'theme-switcher-demo',
          previewHeight: 420,
          code: {
            files: [
              {
                path: 'components/showcase/theme-switcher-demo.tsx',
                language: 'tsx',
                code: `import { Button } from '@forge/ui/button';
import { Badge } from '@forge/ui/badge';

export function ThemeSwitcherDemo() {
  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline">Theme</Badge>
      <Button size="sm" variant="outline">Light</Button>
      <Button size="sm" variant="outline">Dark</Button>
    </div>
  );
}`,
              },
            ],
          },
        },
        {
          id: 'density-demo',
          title: 'Density',
          summary: 'Compact versus comfortable control density for editor surfaces.',
          demoId: 'density-demo',
          previewHeight: 460,
          code: {
            files: [
              {
                path: 'components/showcase/density-demo.tsx',
                language: 'tsx',
                code: `import { Button } from '@forge/ui/button';
import { Input } from '@forge/ui/input';

export function DensityDemo() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div data-density="compact"><Button size="sm">Compact</Button></div>
      <div data-density="comfortable"><Input placeholder="Comfortable" /></div>
    </div>
  );
}`,
              },
            ],
          },
        },
        {
          id: 'accordion-demo',
          title: 'Accordion',
          summary: 'Collapsible content panels for FAQs and grouped sections.',
          demoId: 'accordion-demo',
          code: {
            files: [
              {
                path: 'components/showcase/accordion-demo.tsx',
                language: 'tsx',
                code: `import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@forge/ui/accordion';

export function AccordionDemo() {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>What ships in this release?</AccordionTrigger>
        <AccordionContent>
          Bug fixes, performance improvements, and the new Accordion component.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>How do I install?</AccordionTrigger>
        <AccordionContent>
          Run \`pnpm install\` from the project root.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}`,
              },
            ],
          },
        },
        {
          id: 'badge-demo',
          title: 'Badge',
          summary: 'Status and context labels for metadata and callouts.',
          demoId: 'badge-demo',
          code: {
            files: [
              {
                path: 'components/showcase/badge-demo.tsx',
                language: 'tsx',
                code: `import { Badge } from '@forge/ui/badge';

export function BadgeDemo() {
  return (
    <div className="flex gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  );
}`,
              },
            ],
          },
        },
        {
          id: 'button-demo',
          title: 'Button',
          summary: 'Primary and secondary actions with token-driven sizing.',
          demoId: 'button-demo',
          code: {
            files: [
              {
                path: 'components/showcase/button-demo.tsx',
                language: 'tsx',
                code: `import { Button } from '@forge/ui/button';

export function ButtonDemo() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button>Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
    </div>
  );
}`,
              },
            ],
          },
        },
        {
          id: 'card-demo',
          title: 'Card',
          summary: 'Composable card surface used across editors and docs callouts.',
          demoId: 'card-demo',
          code: {
            files: [
              {
                path: 'components/showcase/card-demo.tsx',
                language: 'tsx',
                code: `import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@forge/ui/card';

export function CardDemo() {
  return (
    <Card className="max-w-sm">
      <CardHeader>
        <CardTitle>Card title</CardTitle>
        <CardDescription>Reusable content shell.</CardDescription>
      </CardHeader>
      <CardContent>Card body content.</CardContent>
    </Card>
  );
}`,
              },
            ],
          },
        },
        {
          id: 'dialog-demo',
          title: 'Dialog',
          summary: 'Modal interaction pattern for confirmations and inline forms.',
          demoId: 'dialog-demo',
          code: {
            files: [
              {
                path: 'components/showcase/dialog-demo.tsx',
                language: 'tsx',
                code: `import { Button } from '@forge/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@forge/ui/dialog';

export function DialogDemo() {
  return (
    <Dialog>
      <DialogTrigger asChild><Button variant="outline">Open dialog</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Dialog title</DialogTitle></DialogHeader>
      </DialogContent>
    </Dialog>
  );
}`,
              },
            ],
          },
        },
        {
          id: 'dropdown-menu-demo',
          title: 'Dropdown Menu',
          summary: 'Compact action menu with keyboard navigation and command grouping.',
          demoId: 'dropdown-menu-demo',
          code: {
            files: [
              {
                path: 'components/showcase/dropdown-menu-demo.tsx',
                language: 'tsx',
                code: `import { Button } from '@forge/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@forge/ui/dropdown-menu';

export function DropdownMenuDemo() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button variant="outline">Open menu</Button></DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>New file</DropdownMenuItem>
        <DropdownMenuItem>Save</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}`,
              },
            ],
          },
        },
        {
          id: 'input-demo',
          title: 'Input',
          summary: 'Single-line text entry with shared spacing and border tokens.',
          demoId: 'input-demo',
          code: {
            files: [
              {
                path: 'components/showcase/input-demo.tsx',
                language: 'tsx',
                code: `import { Input } from '@forge/ui/input';

export function InputDemo() {
  return (
    <div className="max-w-sm space-y-3">
      <Input placeholder="Project name" />
      <Input type="email" placeholder="name@example.com" />
    </div>
  );
}`,
              },
            ],
          },
        },
        {
          id: 'label-demo',
          title: 'Label',
          summary: 'Accessible form labels paired with inputs and controls.',
          demoId: 'label-demo',
          code: {
            files: [
              {
                path: 'components/showcase/label-demo.tsx',
                language: 'tsx',
                code: `import { Label } from '@forge/ui/label';
import { Input } from '@forge/ui/input';

export function LabelDemo() {
  return (
    <div className="grid max-w-sm gap-2">
      <Label htmlFor="component-name">Component name</Label>
      <Input id="component-name" placeholder="EditorShell" />
    </div>
  );
}`,
              },
            ],
          },
        },
        {
          id: 'select-demo',
          title: 'Select',
          summary: 'Controlled list selection for settings and filters.',
          demoId: 'select-demo',
          code: {
            files: [
              {
                path: 'components/showcase/select-demo.tsx',
                language: 'tsx',
                code: `import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@forge/ui/select';

export function SelectDemo() {
  return (
    <Select defaultValue="dialogue">
      <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value="dialogue">Dialogue</SelectItem>
        <SelectItem value="character">Character</SelectItem>
      </SelectContent>
    </Select>
  );
}`,
              },
            ],
          },
        },
        {
          id: 'switch-demo',
          title: 'Switch',
          summary: 'Boolean toggle with label for instant state changes.',
          demoId: 'switch-demo',
          code: {
            files: [
              {
                path: 'components/showcase/switch-demo.tsx',
                language: 'tsx',
                code: `import { useState } from 'react';
import { Switch } from '@forge/ui/switch';
import { Label } from '@forge/ui/label';

export function SwitchDemo() {
  const [enabled, setEnabled] = useState(true);
  return (
    <div className="flex items-center gap-2">
      <Switch id="preview-switch" checked={enabled} onCheckedChange={setEnabled} />
      <Label htmlFor="preview-switch">{enabled ? 'Enabled' : 'Disabled'}</Label>
    </div>
  );
}`,
              },
            ],
          },
        },
        {
          id: 'tabs-demo',
          title: 'Tabs',
          summary: 'Segmented navigation for switching between related panels.',
          demoId: 'tabs-demo',
          code: {
            files: [
              {
                path: 'components/showcase/tabs-demo.tsx',
                language: 'tsx',
                code: `import { Tabs, TabsList, TabsTrigger, TabsContent } from '@forge/ui/tabs';

export function TabsDemo() {
  return (
    <Tabs defaultValue="preview">
      <TabsList>
        <TabsTrigger value="preview">Preview</TabsTrigger>
        <TabsTrigger value="code">Code</TabsTrigger>
      </TabsList>
      <TabsContent value="preview">Preview content</TabsContent>
      <TabsContent value="code">Code content</TabsContent>
    </Tabs>
  );
}`,
              },
            ],
          },
        },
      ],
    },
    {
      id: 'molecules',
      title: 'Molecules',
      description:
        'Editor platform compositions from @forge/shared used to construct full application surfaces.',
      entries: [
        {
          id: 'editor-shell-demo',
          title: 'EditorShell',
          summary: 'Declarative root for editor header, toolbar, layout, overlays, and status bar.',
          demoId: 'editor-shell-demo',
          previewHeight: 660,
          installCommand: 'pnpm --filter @forge/studio dev',
          code: {
            files: [
              {
                path: 'components/showcase/editor-shell-demo.tsx',
                language: 'tsx',
                code: `import { EditorShell, EditorToolbar, EditorDockLayout, EditorDockPanel, EditorStatusBar } from '@forge/shared/components/editor';

export function EditorShellDemo() {
  return (
    <EditorShell editorId="demo" title="Demo Editor" domain="docs">
      <EditorToolbar>...</EditorToolbar>
      <EditorDockLayout layoutId="demo-layout">
        <EditorDockLayout.Main>
          <EditorDockPanel panelId="main" title="Viewport">...</EditorDockPanel>
        </EditorDockLayout.Main>
      </EditorDockLayout>
      <EditorStatusBar>Ready</EditorStatusBar>
    </EditorShell>
  );
}`,
              },
            ],
          },
        },
        {
          id: 'dock-layout-demo',
          title: 'EditorDockLayout',
          summary: 'Composable left/main/right/bottom layout with dock panel helpers.',
          demoId: 'dock-layout-demo',
          previewHeight: 620,
          code: {
            files: [
              {
                path: 'components/showcase/dock-layout-demo.tsx',
                language: 'tsx',
                code: `import { EditorDockLayout, EditorDockPanel } from '@forge/shared/components/editor';

export function DockLayoutDemo() {
  return (
    <EditorDockLayout layoutId="demo-layout">
      <EditorDockLayout.Left>
        <EditorDockPanel panelId="library" title="Library">...</EditorDockPanel>
      </EditorDockLayout.Left>
      <EditorDockLayout.Main>
        <EditorDockPanel panelId="viewport" title="Viewport">...</EditorDockPanel>
      </EditorDockLayout.Main>
    </EditorDockLayout>
  );
}`,
              },
            ],
          },
        },
        {
          id: 'editor-toolbar-demo',
          title: 'EditorToolbar',
          summary: 'Toolbar groups and actions for top-of-editor command surfaces.',
          demoId: 'editor-toolbar-demo',
          code: {
            files: [
              {
                path: 'components/showcase/editor-toolbar-demo.tsx',
                language: 'tsx',
                code: `import { EditorToolbar } from '@forge/shared/components/editor';

export function EditorToolbarDemo() {
  return (
    <EditorToolbar>
      <EditorToolbar.Left>...</EditorToolbar.Left>
      <EditorToolbar.Right>...</EditorToolbar.Right>
    </EditorToolbar>
  );
}`,
              },
            ],
          },
        },
        {
          id: 'panel-tabs-demo',
          title: 'PanelTabs',
          summary: 'Tabbed panel content used by inspectors and assistant rails.',
          demoId: 'panel-tabs-demo',
          code: {
            files: [
              {
                path: 'components/showcase/panel-tabs-demo.tsx',
                language: 'tsx',
                code: `import { PanelTabs } from '@forge/shared/components/editor';

export function PanelTabsDemo() {
  return (
    <PanelTabs
      tabs={[
        { id: 'inspector', label: 'Inspector', content: <div>Inspector</div> },
        { id: 'chat', label: 'Chat', content: <div>Chat</div> },
      ]}
      defaultTabId="inspector"
    />
  );
}`,
              },
            ],
          },
        },
        {
          id: 'settings-panel-demo',
          title: 'Settings Panel',
          summary: 'Settings-oriented layout pattern used for preference forms.',
          demoId: 'settings-panel-demo',
          code: {
            files: [
              {
                path: 'components/showcase/settings-panel-demo.tsx',
                language: 'tsx',
                code: `import { Card, CardHeader, CardTitle, CardContent } from '@forge/ui/card';
import { Label } from '@forge/ui/label';
import { Switch } from '@forge/ui/switch';

export function SettingsPanelDemo() {
  return (
    <Card>
      <CardHeader><CardTitle>Appearance</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <Label className="flex items-center justify-between">
          Use compact density
          <Switch defaultChecked />
        </Label>
      </CardContent>
    </Card>
  );
}`,
              },
            ],
          },
        },
        {
          id: 'attachment-demo',
          title: 'Attachment',
          summary: 'Composer attachment UI for images and files in assistant threads.',
          demoId: 'attachment-demo',
          previewHeight: 420,
          code: {
            files: [
              {
                path: 'components/showcase/attachment-demo.tsx',
                language: 'tsx',
                code: `import { AssistantRuntimeProvider, useLocalRuntime } from '@assistant-ui/react';
import { Thread, ComposerAddAttachment } from '@forge/shared/components/assistant-ui';

export function AttachmentDemo() {
  const runtime = useLocalRuntime({
    async run() {
      return { content: [{ type: 'text', text: 'Mock response' }], status: { type: 'complete', reason: 'stop' } };
    },
  });
  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="flex h-[360px] flex-col overflow-hidden rounded-lg border border-border">
        <Thread composerLeading={<ComposerAddAttachment />} />
      </div>
    </AssistantRuntimeProvider>
  );
}`,
              },
            ],
          },
        },
        {
          id: 'assistant-panel-demo',
          title: 'Assistant Panel',
          summary: 'Live assistant thread rendering with a local mocked runtime adapter.',
          demoId: 'assistant-panel-demo',
          previewHeight: 640,
          code: {
            files: [
              {
                path: 'components/showcase/assistant-panel-demo.tsx',
                language: 'tsx',
                code: `import { AssistantRuntimeProvider, useLocalRuntime } from '@assistant-ui/react';
import { Thread } from '@forge/shared/components/assistant-ui/thread';

export function AssistantPanelDemo() {
  const runtime = useLocalRuntime({
    async run() {
      return { content: [{ type: 'text', text: 'Mocked assistant response' }], status: { type: 'complete', reason: 'stop' } };
    },
  });
  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <Thread />
    </AssistantRuntimeProvider>
  );
}`,
              },
            ],
          },
        },
        {
          id: 'plan-card-demo',
          title: 'Plan Card',
          summary: 'Structured plan response card used for AI-generated stepwise workflows.',
          demoId: 'plan-card-demo',
          code: {
            files: [
              {
                path: 'components/showcase/plan-card-demo.tsx',
                language: 'tsx',
                code: `import { PlanCard, PlanActionBar } from '@forge/shared/copilot/generative-ui';

export function PlanCardDemo() {
  return (
    <PlanCard
      title="Add dialogue branch"
      steps={[{ title: 'Create node', description: 'Add one branch node' }]}
      footer={<PlanActionBar onAccept={() => {}} onReject={() => {}} />}
    />
  );
}`,
              },
            ],
          },
        },
      ],
    },
    {
      id: 'organisms',
      title: 'Organisms',
      description:
        'Large composed surfaces that bring editor, assistant, and tooling layers together.',
      entries: [
        {
          id: 'codebase-agent-strategy-editor',
          title: 'Codebase Agent Strategy Editor',
          summary: 'End-to-end strategy editor surface with assistant-aware planning interactions.',
          demoId: 'codebase-agent-strategy-editor',
          previewHeight: 780,
          code: {
            files: [
              {
                path: 'components/showcase/codebase-agent-strategy-editor.tsx',
                language: 'tsx',
                code: `import { CodebaseAgentStrategyEditor } from '@forge/shared/components/assistant-ui';

export function CodebaseAgentStrategyEditorDemo() {
  return (
    <div className="h-[640px] min-h-0 w-full">
      <CodebaseAgentStrategyEditor />
    </div>
  );
}`,
              },
            ],
          },
        },
      ],
    },
  ],
};

