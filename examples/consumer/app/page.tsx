'use client';

import React from 'react';
import {
  AppProviders,
  EditorApp,
  EditorShell,
  EditorHeader,
  EditorToolbar,
  EditorStatusBar,
  CodebaseAgentStrategyEditor,
} from '@forge/dev-kit';

export default function Home() {
  return (
    <AppProviders tooltip={{ delayDuration: 250 }} copilot={false}>
      <EditorApp>
        <EditorApp.Tabs label="Editor tabs">
          <EditorApp.Tab label="Strategy" isActive domain="ai" />
        </EditorApp.Tabs>

        <EditorApp.Content>
          <EditorShell
            editorId="strategy"
            title="Strategy"
            subtitle="Codebase Agent Strategy Editor"
            domain="ai"
            className="flex-1 min-h-0 bg-canvas"
          >
            <EditorHeader>
              <EditorHeader.Left>
                <h1 className="text-lg font-bold">Strategy</h1>
              </EditorHeader.Left>
              <EditorHeader.Center>
                <span className="text-sm text-muted-foreground">
                  Consumer showcase for assistant-ui + tool-ui
                </span>
              </EditorHeader.Center>
            </EditorHeader>

            <EditorToolbar className="bg-sidebar border-b border-sidebar-border">
              <EditorToolbar.Left>
                <span className="text-xs text-muted-foreground">
                  Build and iterate on agent strategies with streaming chat.
                </span>
              </EditorToolbar.Left>
            </EditorToolbar>

            <div className="flex-1 min-h-0">
              <CodebaseAgentStrategyEditor apiUrl="/api/assistant-chat" />
            </div>

            <EditorStatusBar>Connected to /api/assistant-chat</EditorStatusBar>
          </EditorShell>
        </EditorApp.Content>
      </EditorApp>
    </AppProviders>
  );
}
