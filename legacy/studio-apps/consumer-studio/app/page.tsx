'use client';

import {
  AssistantPanel,
  CompanionRuntimeSwitch,
  createForgeRuntimeContract,
  WorkspaceShell,
  WorkspaceStatusBar,
  WorkspaceToolbar,
  StudioLayout,
  StudioProviders,
  useCompanionRuntimeStore,
  WorkspaceLayout,
  WorkspacePanel,
  useCompanionAssistantUrl,
} from '@forge/dev-kit';
import { getWorkspaceLayoutId, WORKSPACE_LABELS } from '../lib/app-spec.generated';

const WORKSPACE_ID = 'assistant' as const;
const CONSUMER_FORGE_CONTRACT = createForgeRuntimeContract({
  aboutMe: {
    name: 'Consumer Studio',
    role: 'Dev Kit Consumer',
    summary: 'Forge tool contract mounted from @forge/dev-kit.',
  },
});

export default function Home() {
  const assistantUrl = useCompanionAssistantUrl();
  const useCodexAssistant = useCompanionRuntimeStore((state: any) => state.useCodexAssistant);
  const layoutId = getWorkspaceLayoutId(WORKSPACE_ID);

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
          <WorkspaceShell
            editorId={WORKSPACE_ID}
            title={WORKSPACE_LABELS[WORKSPACE_ID]}
            subtitle={assistantUrl ? 'Companion runtime connected' : 'Companion runtime not connected'}
            domain="ai"
            className="flex h-full min-h-0 flex-col bg-canvas"
          >
            <WorkspaceShell.Toolbar>
              <WorkspaceToolbar className="border-b border-sidebar-border bg-sidebar">
                <WorkspaceToolbar.Left>
                  <span className="text-xs text-muted-foreground">
                    Chat-only consumer reference app using shared assistant components.
                  </span>
                </WorkspaceToolbar.Left>
              </WorkspaceToolbar>
            </WorkspaceShell.Toolbar>

            <WorkspaceShell.Layout>
              <WorkspaceLayout layoutId={layoutId} className="h-full">
                <WorkspaceLayout.Main>
                  <WorkspaceLayout.Panel id="assistant-chat" title="Assistant">
                    <WorkspacePanel panelId="assistant-chat-content" hideTitleBar className="h-full" scrollable={false}>
                      {assistantUrl ? (
                        <AssistantPanel
                          apiUrl={assistantUrl}
                          className="h-full min-h-0"
                          contract={useCodexAssistant ? undefined : CONSUMER_FORGE_CONTRACT}
                          toolsEnabled={!useCodexAssistant}
                        />
                      ) : (
                        <div className="flex h-full min-h-0 items-center justify-center p-6 text-center text-sm text-muted-foreground">
                          Start Repo Studio (`pnpm dev:repo-studio`) and enable &quot;Use Repo Studio for AI&quot;.
                        </div>
                      )}
                    </WorkspacePanel>
                  </WorkspaceLayout.Panel>
                </WorkspaceLayout.Main>
              </WorkspaceLayout>
            </WorkspaceShell.Layout>

            <WorkspaceShell.StatusBar>
              <WorkspaceStatusBar>
                {assistantUrl
                  ? `Assistant runtime: ${assistantUrl}`
                  : 'Assistant runtime: unavailable (waiting for companion runtime)'}
              </WorkspaceStatusBar>
            </WorkspaceShell.StatusBar>
          </WorkspaceShell>
        </StudioLayout.Content>
      </StudioLayout>
    </StudioProviders>
  );
}
