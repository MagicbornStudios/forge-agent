'use client';

import {
  AssistantPanel,
  CompanionRuntimeSwitch,
  EditorShell,
  EditorStatusBar,
  EditorToolbar,
  StudioLayout,
  StudioProviders,
  WorkspaceLayout,
  WorkspacePanel,
  useCompanionAssistantUrl,
} from '@forge/dev-kit';

export default function Home() {
  const assistantUrl = useCompanionAssistantUrl();

  return (
    <StudioProviders tooltip={{ delayDuration: 250 }}>
      <StudioLayout className="h-screen">
        <StudioLayout.Tabs label="Consumer Studio tabs">
          <StudioLayout.Tabs.Main>
            <StudioLayout.Tab label="AI Chat" isActive domain="ai" />
          </StudioLayout.Tabs.Main>
          <StudioLayout.Tabs.Right>
            <CompanionRuntimeSwitch />
          </StudioLayout.Tabs.Right>
        </StudioLayout.Tabs>

        <StudioLayout.Content className="min-h-0 overflow-hidden">
          <EditorShell
            editorId="assistant"
            title="AI Chat"
            subtitle={assistantUrl ? 'Companion runtime connected' : 'Companion runtime not connected'}
            domain="ai"
            className="flex h-full min-h-0 flex-col bg-canvas"
          >
            <EditorShell.Toolbar>
              <EditorToolbar className="border-b border-sidebar-border bg-sidebar">
                <EditorToolbar.Left>
                  <span className="text-xs text-muted-foreground">
                    Chat-only consumer reference app using shared assistant components.
                  </span>
                </EditorToolbar.Left>
              </EditorToolbar>
            </EditorShell.Toolbar>

            <EditorShell.Layout>
              <WorkspaceLayout layoutId="consumer-studio-chat" className="h-full">
                <WorkspaceLayout.Main>
                  <WorkspaceLayout.Panel id="assistant-chat" title="Assistant">
                    <WorkspacePanel panelId="assistant-chat-content" hideTitleBar className="h-full" scrollable={false}>
                      {assistantUrl ? (
                        <AssistantPanel apiUrl={assistantUrl} className="h-full min-h-0" />
                      ) : (
                        <div className="flex h-full min-h-0 items-center justify-center p-6 text-center text-sm text-muted-foreground">
                          Start Repo Studio (`pnpm dev:repo-studio`) and enable &quot;Use Repo Studio for AI&quot;.
                        </div>
                      )}
                    </WorkspacePanel>
                  </WorkspaceLayout.Panel>
                </WorkspaceLayout.Main>
              </WorkspaceLayout>
            </EditorShell.Layout>

            <EditorShell.StatusBar>
              <EditorStatusBar>
                {assistantUrl
                  ? `Assistant runtime: ${assistantUrl}`
                  : 'Assistant runtime: unavailable (waiting for companion runtime)'}
              </EditorStatusBar>
            </EditorShell.StatusBar>
          </EditorShell>
        </StudioLayout.Content>
      </StudioLayout>
    </StudioProviders>
  );
}

