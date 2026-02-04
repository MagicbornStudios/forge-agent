'use client';

import React from 'react';
import { useCopilotReadable, useCopilotAction } from '@copilotkit/react-core';
import { useAppShellStore, type AppShellWorkspaceId } from '@/lib/app-shell/store';
import {
  WORKSPACE_LABELS,
  WORKSPACE_EDITOR_SUMMARY,
} from '@/lib/app-shell/workspace-metadata';
import { ForgeWorkspace, VideoWorkspace } from '@/components/workspaces';
import { WorkspaceButton } from '@/shared/components/workspace';
import { AppLayout, AppTabGroup, AppTab, AppContent } from '@/shared/components/app';
import { SettingsMenu } from '@/components/settings/SettingsMenu';
import { Toaster } from '@/components/ui/sonner';
import { useSettingsStore } from '@/lib/settings/store';

export function AppShell() {
  const { route, setActiveWorkspace, openWorkspace, closeWorkspace } = useAppShellStore();
  const { activeWorkspaceId, openWorkspaceIds } = route;
  const toastsEnabled = useSettingsStore((s) => s.getSettingValue('ui.toastsEnabled')) as boolean | undefined;

  // Shell-level context for the agent and user (workspace names, active workspace, editor summary)
  useCopilotReadable({
    description:
      'Unified workspace context: which workspace is active, workspace names, and editor types. Use this to switch workspaces or refer to "Forge" / "Video" in conversation.',
    value: {
      activeWorkspaceId,
      activeWorkspaceName: WORKSPACE_LABELS[activeWorkspaceId],
      workspaceNames: WORKSPACE_LABELS,
      openWorkspaceIds,
      editorSummary: WORKSPACE_EDITOR_SUMMARY[activeWorkspaceId],
      hint: 'Say "switch to Video" or "open Forge" to change workspace. Forge has the graph editor; Video has the timeline.',
    },
  });

  useCopilotAction({
    name: 'switchWorkspace',
    description: 'Switch the active workspace tab. Use when the user asks to go to Forge or Video.',
    parameters: [
      {
        name: 'workspaceId',
        type: 'string',
        description: 'Workspace to switch to: "forge" or "video"',
        required: true,
      },
    ],
    handler: async ({ workspaceId }) => {
      const id = workspaceId as AppShellWorkspaceId;
      if (id === 'forge' || id === 'video') {
        setActiveWorkspace(id);
        return { success: true, message: `Switched to ${WORKSPACE_LABELS[id]}.` };
      }
      return { success: false, message: `Unknown workspace: ${workspaceId}. Use "forge" or "video".` };
    },
  });

  useCopilotAction({
    name: 'openWorkspace',
    description: 'Open a workspace tab if not already open, and switch to it.',
    parameters: [
      {
        name: 'workspaceId',
        type: 'string',
        description: 'Workspace to open: "forge" or "video"',
        required: true,
      },
    ],
    handler: async ({ workspaceId }) => {
      const id = workspaceId as AppShellWorkspaceId;
      if (id === 'forge' || id === 'video') {
        openWorkspace(id);
        return { success: true, message: `Opened ${WORKSPACE_LABELS[id]}.` };
      }
      return { success: false, message: `Unknown workspace: ${workspaceId}.` };
    },
  });

  useCopilotAction({
    name: 'closeWorkspace',
    description: 'Close a workspace tab. Must have at least one open.',
    parameters: [
      {
        name: 'workspaceId',
        type: 'string',
        description: 'Workspace to close: "forge" or "video"',
        required: true,
      },
    ],
    handler: async ({ workspaceId }) => {
      const id = workspaceId as AppShellWorkspaceId;
      if (id === 'forge' || id === 'video') {
        if (openWorkspaceIds.length <= 1) {
          return { success: false, message: 'Cannot close the last workspace.' };
        }
        closeWorkspace(id);
        return { success: true, message: `Closed ${WORKSPACE_LABELS[id]}.` };
      }
      return { success: false, message: `Unknown workspace: ${workspaceId}.` };
    },
  });

  return (
    <AppLayout>
      {/* Workspace tabs */}
      <AppTabGroup
        label="Workspace tabs"
        actions={
          <>
            <WorkspaceButton
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => openWorkspace('forge')}
              tooltip="Open Forge workspace"
              className="text-muted-foreground hover:text-foreground"
            >
              + Forge
            </WorkspaceButton>
            <WorkspaceButton
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => openWorkspace('video')}
              tooltip="Open Video workspace"
              className="text-muted-foreground hover:text-foreground"
            >
              + Video
            </WorkspaceButton>
            <SettingsMenu tooltip="App settings" defaultScope="app" />
          </>
        }
      >
        {openWorkspaceIds.map((id) => (
          <AppTab
            key={id}
            label={WORKSPACE_LABELS[id]}
            isActive={activeWorkspaceId === id}
            domain={id}
            onSelect={() => setActiveWorkspace(id)}
            onClose={openWorkspaceIds.length > 1 ? () => closeWorkspace(id) : undefined}
            tooltip={`Switch to ${WORKSPACE_LABELS[id]}`}
            closeTooltip={`Close ${WORKSPACE_LABELS[id]}`}
          />
        ))}
      </AppTabGroup>

      {/* Active workspace content */}
      <AppContent>
        {activeWorkspaceId === 'forge' && <ForgeWorkspace />}
        {activeWorkspaceId === 'video' && <VideoWorkspace />}
      </AppContent>
      {toastsEnabled !== false && <Toaster />}
    </AppLayout>
  );
}
