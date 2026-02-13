'use client';

import * as React from 'react';
import {
  AssistantRuntimeProvider,
  type ChatModelAdapter,
  type ThreadMessage,
  useLocalRuntime,
} from '@assistant-ui/react';
import { Sparkles } from 'lucide-react';
import { Badge } from '@forge/ui/badge';
import { Button } from '@forge/ui/button';
import {
  createEditorMenubarMenus,
  EditorButton,
  EditorDockLayout,
  EditorDockPanel,
  EditorEditMenu,
  EditorFileMenu,
  EditorHeader,
  EditorMenubar,
  EditorProjectSelect,
  EditorSettingsMenu,
  EditorSettingsTrigger,
  EditorShell,
  EditorStatusBar,
  EditorToolbar,
  EditorViewMenu,
  PanelRegistrationContextProvider,
  SettingsTriggerProvider,
  usePanelRegistration,
  useSettingsTrigger,
} from '@forge/shared/components/editor';
import { cn } from '@/lib/utils';

const PREVIEW_SURFACE_STYLE: React.CSSProperties = {
  '--control-gap': '0.375rem',
  '--control-height': '2rem',
  '--control-height-sm': '1.75rem',
  '--control-padding-x': '0.625rem',
  '--control-padding-y': '0.25rem',
  '--header-height': '2.375rem',
  '--toolbar-height': '2.5rem',
  '--status-height': '1.75rem',
  '--panel-padding': '0.625rem',
  '--tab-height': '2rem',
  '--icon-size': '0.875rem',
  '--icon-size-lg': '1rem',
  '--context-accent': 'hsl(var(--primary))',
} as React.CSSProperties;

const INITIAL_THREAD_MESSAGES: ThreadMessage[] = [
  {
    id: 'docs-user-1',
    createdAt: new Date('2026-02-01T09:00:00.000Z'),
    role: 'user',
    content: [
      {
        type: 'text',
        text: 'Summarize the latest docs showcase updates.',
      },
    ],
    attachments: [],
    metadata: {
      custom: {},
    },
  },
  {
    id: 'docs-assistant-1',
    createdAt: new Date('2026-02-01T09:00:02.000Z'),
    role: 'assistant',
    content: [
      {
        type: 'text',
        text: 'Showcase previews are now rendered directly from component demos.',
      },
    ],
    status: {
      type: 'complete',
      reason: 'stop',
    },
    metadata: {
      unstable_state: {},
      unstable_annotations: [],
      unstable_data: [],
      steps: [],
      custom: {},
    },
  },
];

const LOCAL_ASSISTANT_ADAPTER: ChatModelAdapter = {
  async run(options) {
    const latestMessage = [...options.messages].reverse().find((message) => message.role === 'user');
    const latestPrompt =
      latestMessage?.content
        .filter((part) => part.type === 'text')
        .map((part) => part.text)
        .join(' ') ?? 'your request';

    return {
      content: [
        {
          type: 'text',
          text: `Mocked runtime response for docs preview: ${latestPrompt}`,
        },
      ],
      status: {
        type: 'complete',
        reason: 'stop',
      },
    };
  },
};

export function ComponentDemoFrame({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border/80 bg-muted/20 p-4',
        className,
      )}
      style={PREVIEW_SURFACE_STYLE}
    >
      {children}
    </div>
  );
}

export function EditorDemoHarness({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  const [settingsOpenCount, setSettingsOpenCount] = React.useState(0);

  const menus = React.useMemo(
    () =>
      createEditorMenubarMenus({
        file: [EditorFileMenu.New(), EditorFileMenu.Open(), EditorFileMenu.Save()],
        edit: [EditorEditMenu.Undo(), EditorEditMenu.Redo(), EditorEditMenu.Copy(), EditorEditMenu.Paste()],
        view: [
          EditorViewMenu.PanelToggle({ id: 'library', label: 'Library', checked: true }),
          EditorViewMenu.PanelToggle({ id: 'inspector', label: 'Inspector', checked: true }),
        ],
        settings: [
          EditorSettingsMenu.OpenSettings({
            onSelect: () => setSettingsOpenCount((current) => current + 1),
          }),
        ],
      }),
    [],
  );

  const defaultLayout = (
    <EditorDockLayout
      layoutId="platform-docs-editor-harness"
      left={
        <EditorDockPanel panelId="docs-library" title="Library">
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>Characters</p>
            <p>Graph Nodes</p>
            <p>Story Beats</p>
          </div>
        </EditorDockPanel>
      }
      main={
        <EditorDockPanel panelId="docs-canvas" title="Viewport" scrollable={false}>
          <div className="flex h-full min-h-[180px] items-center justify-center rounded-md border border-dashed border-border/70 bg-background/60 text-xs text-muted-foreground">
            Editor viewport preview
          </div>
        </EditorDockPanel>
      }
      right={
        <EditorDockPanel panelId="docs-inspector" title="Inspector">
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>Selection metadata</p>
            <p>Properties</p>
          </div>
        </EditorDockPanel>
      }
      bottom={
        <EditorDockPanel panelId="docs-console" title="Assistant">
          <div className="text-xs text-muted-foreground">Tool output stream</div>
        </EditorDockPanel>
      }
      viewport={{
        viewportId: 'docs-editor-preview',
        viewportType: 'docs-preview',
      }}
      className="min-h-[250px]"
    />
  );

  return (
    <ComponentDemoFrame className={cn('overflow-hidden p-0', className)}>
      <SettingsTriggerProvider
        openSettings={() => setSettingsOpenCount((current) => current + 1)}
      >
        <PanelRegistrationContextProvider value={{ editorId: 'docs-editor' }}>
          <EditorShell
            editorId="docs-editor"
            title="Docs Editor"
            domain="docs"
            className="h-[380px]"
          >
            <EditorShell.Header>
              <EditorHeader>
                <EditorHeader.Left>
                  <Badge variant="outline" className="h-6 text-[11px]">
                    Editor Preview
                  </Badge>
                </EditorHeader.Left>
                <EditorHeader.Center>
                  <span className="truncate text-xs text-muted-foreground">
                    Shared editor primitives rendered in docs
                  </span>
                </EditorHeader.Center>
                <EditorHeader.Right>
                  <span className="text-xs text-muted-foreground">
                    Settings opened: {settingsOpenCount}
                  </span>
                </EditorHeader.Right>
              </EditorHeader>
            </EditorShell.Header>

            <EditorShell.Toolbar>
              <EditorToolbar>
                <EditorToolbar.Left>
                  <EditorToolbar.Group>
                    <EditorMenubar menus={menus} />
                    <EditorProjectSelect
                      options={[
                        { value: 'alpha', label: 'Project Alpha' },
                        { value: 'beta', label: 'Project Beta' },
                      ]}
                      value="alpha"
                    />
                  </EditorToolbar.Group>
                </EditorToolbar.Left>
                <EditorToolbar.Right>
                  <EditorButton size="sm" variant="outline">
                    Save
                  </EditorButton>
                </EditorToolbar.Right>
              </EditorToolbar>
            </EditorShell.Toolbar>

            <EditorShell.Settings>
              <div className="pr-[var(--panel-padding)]">
                <EditorSettingsTrigger tooltip="Open settings" />
              </div>
            </EditorShell.Settings>

            <EditorShell.Layout>{children ?? defaultLayout}</EditorShell.Layout>

            <EditorShell.StatusBar>
              <EditorStatusBar>
                <span className="inline-flex items-center gap-2">
                  <Sparkles className="size-3" />
                  Ready
                </span>
              </EditorStatusBar>
            </EditorShell.StatusBar>
          </EditorShell>
        </PanelRegistrationContextProvider>
      </SettingsTriggerProvider>
    </ComponentDemoFrame>
  );
}

export function AssistantRuntimeHarness({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const runtime = useLocalRuntime(LOCAL_ASSISTANT_ADAPTER, {
    initialMessages: INITIAL_THREAD_MESSAGES,
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <ComponentDemoFrame className={cn('h-[360px] min-h-[300px]', className)}>
        {children}
      </ComponentDemoFrame>
    </AssistantRuntimeProvider>
  );
}

export function PanelRegistrationProbe() {
  const registration = usePanelRegistration();

  return (
    <div className="rounded-md border border-border bg-background px-3 py-2 text-xs">
      Panel context editor id: <strong>{registration.editorId}</strong>
    </div>
  );
}

export function SettingsTriggerProbe() {
  const trigger = useSettingsTrigger();

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        type="button"
        onClick={() => trigger?.openSettings?.()}
      >
        Trigger openSettings
      </Button>
      <span className="text-xs text-muted-foreground">
        Provider wired: {trigger?.openSettings ? 'yes' : 'no'}
      </span>
    </div>
  );
}
