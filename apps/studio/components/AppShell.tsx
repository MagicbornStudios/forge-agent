'use client';

import React from 'react';
import { useCopilotReadable, useCopilotAction } from '@copilotkit/react-core';
import { useAppShellStore, type AppShellWorkspaceId } from '@/lib/app-shell/store';
import {
  WORKSPACE_LABELS,
  WORKSPACE_EDITOR_SUMMARY,
} from '@/lib/app-shell/workspace-metadata';
import { ForgeWorkspace, VideoWorkspace } from '@/components/workspaces';
import { WorkspaceButton } from '@forge/shared/components/workspace';
import { AppLayout, AppTabGroup, AppTab, AppContent } from '@forge/shared/components/app';
import { SettingsMenu } from '@/components/settings/SettingsMenu';
import { Toaster } from '@forge/ui/sonner';
import { useSettingsStore } from '@/lib/settings/store';
import { useEntitlements, CAPABILITIES } from '@forge/shared/entitlements';
import { ImageGenerateRender } from '@/components/copilot/ImageGenerateRender';
import { StructuredOutputRender } from '@/components/copilot/StructuredOutputRender';
import { AiService } from '@/lib/api-client';
import { createAppAction } from '@forge/shared/copilot';

export function AppShell() {
  const { route, setActiveWorkspace, openWorkspace, closeWorkspace } = useAppShellStore();
  const { activeWorkspaceId, openWorkspaceIds } = route;
  const toastsEnabled = useSettingsStore((s) => s.getSettingValue('ui.toastsEnabled')) as boolean | undefined;
  const entitlements = useEntitlements();
  const imageGenEnabled = entitlements.has(CAPABILITIES.IMAGE_GENERATION);

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

  useCopilotAction(createAppAction({
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
  }));

  useCopilotAction(createAppAction({
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
  }));

  useCopilotAction(createAppAction({
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
  }));

  useCopilotAction(createAppAction({
    name: 'app_generateImage',
    description:
      'Generate an image from a text prompt. Use when the user asks to create, draw, or generate an image.',
    parameters: [
      { name: 'prompt', type: 'string', description: 'Detailed description of the image to generate', required: true },
      {
        name: 'aspectRatio',
        type: 'string',
        description: 'Optional aspect ratio: 1:1, 16:9, 9:16, 4:3, 3:4, etc.',
        required: false,
      },
      {
        name: 'imageSize',
        type: 'string',
        description: 'Optional size: 1K, 2K, 4K',
        required: false,
      },
    ],
    handler: async ({ prompt, aspectRatio, imageSize }) => {
      try {
        const res = await fetch('/api/image-generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: String(prompt ?? ''),
            ...(aspectRatio && { aspectRatio: String(aspectRatio) }),
            ...(imageSize && { imageSize: String(imageSize) }),
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          return { success: false, message: data.error ?? 'Image generation failed', data: {} };
        }
        return {
          success: true,
          message: 'Image generated',
          data: { imageUrl: data.imageUrl },
        };
      } catch (err) {
        return {
          success: false,
          message: err instanceof Error ? err.message : 'Image generation failed',
          data: {},
        };
      }
    },
    render: ImageGenerateRender,
    ...(imageGenEnabled ? {} : { available: 'disabled' as const }),
  }));

  useCopilotAction(createAppAction({
    name: 'app_respondWithStructure',
    description:
      'Extract or produce structured data (JSON) from a prompt. Use when the user wants a list of characters, key-value pairs, or other structured output. Choose schemaName to match the request: "characters" for character lists, "keyValue" for key-value pairs, "list" for a simple string list.',
    parameters: [
      { name: 'prompt', type: 'string', description: 'What to extract or generate (e.g. "List the main characters in this scene")', required: true },
      {
        name: 'schemaName',
        type: 'string',
        description: 'Predefined schema: "characters", "keyValue", or "list"',
        required: false,
      },
    ],
    handler: async ({ prompt, schemaName }) => {
      try {
        const json = await AiService.postApiStructuredOutput({
          prompt: String(prompt ?? ''),
          ...(schemaName && { schemaName: String(schemaName) }),
        });
        return { success: true, message: 'Structured data extracted', data: json.data };
      } catch (err) {
        const message =
          err && typeof err === 'object' && 'body' in err
            ? String((err as { body?: { error?: string } }).body?.error ?? 'Structured output failed')
            : err instanceof Error
              ? err.message
              : 'Structured output failed';
        return { success: false, message, data: undefined };
      }
    },
    render: StructuredOutputRender,
  }));

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
