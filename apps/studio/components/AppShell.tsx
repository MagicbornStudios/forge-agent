'use client';

import React from 'react';
import { useCopilotReadable, useCopilotAction } from '@copilotkit/react-core';
import type { Parameter } from '@copilotkit/shared';
import { useEditorStore, type EditorModeId } from '@/lib/app-shell/store';
import {
  MODE_LABELS,
  MODE_EDITOR_SUMMARY,
} from '@/lib/app-shell/mode-metadata';
import { EditorApp } from '@forge/shared/components/app';
import { EditorButton } from '@forge/shared/components/editor';
import { SettingsMenu } from '@/components/settings/SettingsMenu';
import { Toaster } from '@forge/ui/sonner';
import { useSettingsStore } from '@/lib/settings/store';
import { useEntitlements, CAPABILITIES } from '@forge/shared/entitlements';
import { ImageGenerateRender } from '@/components/copilot/ImageGenerateRender';
import { StructuredOutputRender } from '@/components/copilot/StructuredOutputRender';
import { useGenerateImage, useStructuredOutput } from '@/lib/data/hooks';
import { createAppAction } from '@forge/shared/copilot';

// Modes (new naming)
import { DialogueMode } from '@/components/modes/DialogueMode';
import { VideoMode } from '@/components/modes/VideoMode';
import { CharacterMode } from '@/components/modes/CharacterMode';
import { StrategyMode } from '@/components/modes/StrategyMode';

const VALID_MODE_IDS: EditorModeId[] = ['dialogue', 'video', 'character', 'strategy'];

function isValidModeId(id: string): id is EditorModeId {
  return VALID_MODE_IDS.includes(id as EditorModeId);
}

export function AppShell() {
  const { route, setActiveWorkspace, openWorkspace, closeWorkspace } = useEditorStore();
  const { activeWorkspaceId, openWorkspaceIds } = route;
  const toastsEnabled = useSettingsStore((s) => s.getSettingValue('ui.toastsEnabled')) as boolean | undefined;
  const entitlements = useEntitlements();
  const imageGenEnabled = entitlements.has(CAPABILITIES.IMAGE_GENERATION);
  const generateImageMutation = useGenerateImage();
  const structuredOutputMutation = useStructuredOutput();

  // Shell-level context for the copilot agent
  useCopilotReadable({
    description:
      'Unified editor context: which mode is active, mode names, and editor types. Use this to switch modes.',
    value: {
      activeWorkspaceId,
      activeModeName: MODE_LABELS[activeWorkspaceId],
      modeNames: MODE_LABELS,
      openWorkspaceIds,
      editorSummary: MODE_EDITOR_SUMMARY[activeWorkspaceId],
      hint: 'Say "switch to Dialogue", "open Video", "open Characters", or "open Strategy" to change mode.',
    },
  });

  useCopilotAction(createAppAction<[Parameter]>({
    name: 'switchMode',
    description: 'Switch the active editor mode tab.',
    parameters: [
      {
        name: 'modeId',
        type: 'string',
        description: `Mode to switch to: ${VALID_MODE_IDS.map((id) => `"${id}"`).join(', ')}`,
        required: true,
      },
    ],
    handler: async ({ modeId }) => {
      const id = String(modeId);
      if (isValidModeId(id)) {
        setActiveWorkspace(id);
        return { success: true, message: `Switched to ${MODE_LABELS[id]}.` };
      }
      return { success: false, message: `Unknown mode: ${modeId}. Use ${VALID_MODE_IDS.join(', ')}.` };
    },
  }));

  useCopilotAction(createAppAction<[Parameter]>({
    name: 'openMode',
    description: 'Open an editor mode tab if not already open, and switch to it.',
    parameters: [
      {
        name: 'modeId',
        type: 'string',
        description: `Mode to open: ${VALID_MODE_IDS.map((id) => `"${id}"`).join(', ')}`,
        required: true,
      },
    ],
    handler: async ({ modeId }) => {
      const id = String(modeId);
      if (isValidModeId(id)) {
        openWorkspace(id);
        return { success: true, message: `Opened ${MODE_LABELS[id]}.` };
      }
      return { success: false, message: `Unknown mode: ${modeId}.` };
    },
  }));

  useCopilotAction(createAppAction<[Parameter]>({
    name: 'closeMode',
    description: 'Close an editor mode tab. Must have at least one open.',
    parameters: [
      {
        name: 'modeId',
        type: 'string',
        description: `Mode to close: ${VALID_MODE_IDS.map((id) => `"${id}"`).join(', ')}`,
        required: true,
      },
    ],
    handler: async ({ modeId }) => {
      const id = String(modeId);
      if (isValidModeId(id)) {
        if (openWorkspaceIds.length <= 1) {
          return { success: false, message: 'Cannot close the last mode.' };
        }
        closeWorkspace(id);
        return { success: true, message: `Closed ${MODE_LABELS[id]}.` };
      }
      return { success: false, message: `Unknown mode: ${modeId}.` };
    },
  }));

  useCopilotAction(createAppAction<[Parameter, Parameter, Parameter]>({
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
        const result = await generateImageMutation.mutateAsync({
          prompt: String(prompt ?? ''),
          ...(aspectRatio && { aspectRatio: String(aspectRatio) }),
          ...(imageSize && { imageSize: String(imageSize) }),
        });
        return {
          success: true,
          message: 'Image generated',
          data: { imageUrl: result.imageUrl },
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

  useCopilotAction(createAppAction<[Parameter, Parameter]>({
    name: 'app_respondWithStructure',
    description:
      'Extract or produce structured data (JSON) from a prompt.',
    parameters: [
      { name: 'prompt', type: 'string', description: 'What to extract or generate', required: true },
      {
        name: 'schemaName',
        type: 'string',
        description: 'Predefined schema: "characters", "keyValue", or "list"',
        required: false,
      },
    ],
    handler: async ({ prompt, schemaName }) => {
      try {
        const data = await structuredOutputMutation.mutateAsync({
          prompt: String(prompt ?? ''),
          ...(schemaName && { schemaName: String(schemaName) }),
        });
        return { success: true, message: 'Structured data extracted', data };
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
    <EditorApp>
      {/* Mode tabs */}
      <EditorApp.Tabs
        label="Mode tabs"
        actions={
          <>
            <EditorButton
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => openWorkspace('dialogue')}
              tooltip="Open Dialogue mode"
              className="text-muted-foreground hover:text-foreground"
            >
              + Dialogue
            </EditorButton>
            <EditorButton
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => openWorkspace('video')}
              tooltip="Open Video mode"
              className="text-muted-foreground hover:text-foreground"
            >
              + Video
            </EditorButton>
            <EditorButton
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => openWorkspace('character')}
              tooltip="Open Characters mode"
              className="text-muted-foreground hover:text-foreground"
            >
              + Characters
            </EditorButton>
            <EditorButton
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => openWorkspace('strategy')}
              tooltip="Open Strategy mode"
              className="text-muted-foreground hover:text-foreground"
            >
              + Strategy
            </EditorButton>
            <SettingsMenu tooltip="App settings" defaultScope="app" />
          </>
        }
      >
        {openWorkspaceIds.map((id) => (
          <EditorApp.Tab
            key={id}
            label={MODE_LABELS[id]}
            isActive={activeWorkspaceId === id}
            domain={id}
            onSelect={() => setActiveWorkspace(id)}
            onClose={openWorkspaceIds.length > 1 ? () => closeWorkspace(id) : undefined}
            tooltip={`Switch to ${MODE_LABELS[id]}`}
            closeTooltip={`Close ${MODE_LABELS[id]}`}
          />
        ))}
      </EditorApp.Tabs>

      {/* Active mode content */}
      <EditorApp.Content>
        {activeWorkspaceId === 'dialogue' && <DialogueMode />}
        {activeWorkspaceId === 'video' && <VideoMode />}
        {activeWorkspaceId === 'character' && <CharacterMode />}
        {activeWorkspaceId === 'strategy' && <StrategyMode />}
      </EditorApp.Content>
      {toastsEnabled !== false && <Toaster />}
    </EditorApp>
  );
}
