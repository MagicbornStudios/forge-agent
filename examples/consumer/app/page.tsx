'use client';

import React from 'react';
import {
  AppProviders,
  EditorApp,
  EditorShell,
  ModeHeader,
  ModeToolbar,
  ModeStatusBar,
  CodebaseAgentStrategyEditor,
} from '@forge/dev-kit';

export default function Home() {
  return (
    <AppProviders tooltip={{ delayDuration: 250 }} copilot={false}>
      <EditorApp>
        <EditorApp.Tabs label="Mode tabs">
          <EditorApp.Tab label="Strategy" isActive domain="ai" />
        </EditorApp.Tabs>

        <EditorApp.Content>
          <EditorShell
            modeId="strategy"
            title="Strategy"
            subtitle="Codebase Agent Strategy Editor"
            domain="ai"
            className="flex-1 min-h-0 bg-canvas"
          >
            <ModeHeader>
              <ModeHeader.Left>
                <h1 className="text-lg font-bold">Strategy</h1>
              </ModeHeader.Left>
              <ModeHeader.Center>
                <span className="text-sm text-muted-foreground">
                  Consumer showcase for assistant-ui + tool-ui
                </span>
              </ModeHeader.Center>
            </ModeHeader>

            <ModeToolbar className="bg-sidebar border-b border-sidebar-border">
              <ModeToolbar.Left>
                <span className="text-xs text-muted-foreground">
                  Build and iterate on agent strategies with streaming chat.
                </span>
              </ModeToolbar.Left>
            </ModeToolbar>

            <div className="flex-1 min-h-0">
              <CodebaseAgentStrategyEditor apiUrl="/api/assistant-chat" />
            </div>

            <ModeStatusBar>Connected to /api/assistant-chat</ModeStatusBar>
          </EditorShell>
        </EditorApp.Content>
      </EditorApp>
    </AppProviders>
  );
}
