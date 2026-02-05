'use client';

import React from 'react';
import {
  AppProviders,
  AppSpace,
  WorkspaceShell,
  WorkspaceHeader,
  WorkspaceToolbar,
  WorkspaceLayoutGrid,
  WorkspaceMain,
  WorkspaceInspector,
  WorkspaceBottomPanel,
  WorkspaceStatusBar,
  WorkspaceButton,
} from '@forge/dev-kit';

export default function Home() {
  const [activeTab, setActiveTab] = React.useState<'forge'>('forge');

  return (
    <AppProviders
      copilot={{
        runtimeUrl: '/api/copilotkit',
        defaultOpen: true,
        labels: { title: 'Forge Assistant', initial: 'Ask the assistant to help build your workspace.' },
      }}
    >
      <AppSpace>
        <AppSpace.Tabs
          label="Workspace tabs"
          actions={
            <WorkspaceButton
              size="sm"
              variant="ghost"
              tooltip="Add a workspace (stub)"
            >
              + Workspace
            </WorkspaceButton>
          }
        >
          <AppSpace.Tab
            label="Forge"
            domain="forge"
            isActive={activeTab === 'forge'}
            onSelect={() => setActiveTab('forge')}
            tooltip="Forge workspace"
          />
        </AppSpace.Tabs>

        <AppSpace.Content>
          <WorkspaceShell workspaceId="forge" title="Forge" domain="forge">
            <WorkspaceHeader>
              <WorkspaceHeader.Left>
                <div className="text-sm font-semibold">Forge</div>
              </WorkspaceHeader.Left>
              <WorkspaceHeader.Center>
                <div className="text-xs text-muted-foreground">Consumer example workspace</div>
              </WorkspaceHeader.Center>
              <WorkspaceHeader.Right />
            </WorkspaceHeader>

            <WorkspaceToolbar>
              <WorkspaceToolbar.Left>
                <WorkspaceToolbar.FileMenu
                  items={[
                    { id: 'new', label: 'New', onClick: () => console.info('[consumer] New') },
                    { id: 'open', label: 'Open', onClick: () => console.info('[consumer] Open') },
                    { id: 'save', label: 'Save', onClick: () => console.info('[consumer] Save') },
                  ]}
                />
                <WorkspaceToolbar.ProjectSelect
                  value="demo"
                  onValueChange={() => {}}
                  options={[{ value: 'demo', label: 'Demo Project' }]}
                />
              </WorkspaceToolbar.Left>
              <WorkspaceToolbar.Right>
                <WorkspaceButton size="sm" variant="outline" tooltip="Settings (stub)">
                  Settings
                </WorkspaceButton>
              </WorkspaceToolbar.Right>
            </WorkspaceToolbar>

            <WorkspaceLayoutGrid
              main={
                <WorkspaceMain>
                  <div className="h-full w-full rounded-md border border-dashed border-border/70 bg-background/50 p-6 text-sm text-muted-foreground">
                    Drop your editor here. This example keeps the layout and Copilot wiring minimal.
                  </div>
                </WorkspaceMain>
              }
              right={
                <WorkspaceInspector>
                  <div className="p-4 text-xs text-muted-foreground">Inspector panel</div>
                </WorkspaceInspector>
              }
              bottom={
                <WorkspaceBottomPanel>
                  <div className="p-3 text-xs text-muted-foreground">Bottom panel (timeline/logs)</div>
                </WorkspaceBottomPanel>
              }
            />

            <WorkspaceStatusBar>
              <div className="text-xs text-muted-foreground">Ready</div>
            </WorkspaceStatusBar>
          </WorkspaceShell>
        </AppSpace.Content>
      </AppSpace>
    </AppProviders>
  );
}
