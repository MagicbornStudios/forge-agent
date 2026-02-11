'use client';

import React, { useMemo } from 'react';
import { useCopilotReadable, useCopilotAction } from '@copilotkit/react-core';
import type { Parameter } from '@copilotkit/shared';
import { useEditorStore, EDITOR_IDS, type EditorId } from '@/lib/app-shell/store';
import { EDITOR_LABELS, EDITOR_SUMMARY } from '@/lib/app-shell/editor-metadata';
import { registerDefaultEditors } from '@/lib/editor-registry/editor-bootstrap';
import { useEntitlements, CAPABILITIES } from '@forge/shared/entitlements';
import { ImageGenerateRender } from '@/components/copilot/ImageGenerateRender';
import { StructuredOutputRender } from '@/components/copilot/StructuredOutputRender';
import { useGenerateImage, useStructuredOutput } from '@/lib/data/hooks';
import { createAppAction } from '@forge/shared/copilot';
import { Studio } from '@/components/Studio';

registerDefaultEditors();

export function AppShell() {
  const {
    route,
    setActiveWorkspace,
    openWorkspace,
    closeWorkspace,
  } = useEditorStore();
  const { activeWorkspaceId, openWorkspaceIds } = route;
  const editorIdsForActions = EDITOR_IDS;
  const editorNames = React.useMemo(() => {
    const names: Partial<Record<EditorId, string>> = {};
    editorIdsForActions.forEach((id) => {
      names[id] = EDITOR_LABELS[id];
    });
    return names;
  }, [editorIdsForActions]);
  const visibleWorkspaceIds = openWorkspaceIds;
  const entitlements = useEntitlements();
  const imageGenEnabled = entitlements.has(CAPABILITIES.IMAGE_GENERATION);
  const generateImageMutation = useGenerateImage();
  const structuredOutputMutation = useStructuredOutput();

  const copilotReadableValue = React.useMemo(
    () => ({
      activeWorkspaceId,
      activeEditorId: activeWorkspaceId,
      activeEditorName: EDITOR_LABELS[activeWorkspaceId],
      editorNames,
      openWorkspaceIds: visibleWorkspaceIds,
      editorSummary: EDITOR_SUMMARY[activeWorkspaceId],
      hint: 'Say "switch to Dialogue" or "open Characters" to change editor.',
    }),
    [activeWorkspaceId, editorNames, visibleWorkspaceIds],
  );

  const copilotReadable = React.useMemo(
    () => ({
      description:
        'Unified editor context: which editor is active, editor names, and editor types. Use this to switch editors.',
      value: copilotReadableValue,
    }),
    [copilotReadableValue],
  );

  useCopilotReadable(copilotReadable);

  const switchEditorAction = React.useMemo(
    () =>
      createAppAction<[Parameter]>({
        name: 'switchEditor',
        description: 'Switch the active editor tab.',
        parameters: [
          {
            name: 'editorId',
            type: 'string',
            description: `Editor to switch to: ${editorIdsForActions.map((id) => `"${id}"`).join(', ')}`,
            required: true,
          },
        ],
        handler: async ({ editorId }) => {
          const id = String(editorId);
          if (editorIdsForActions.includes(id as EditorId)) {
            const nextId = id as EditorId;
            setActiveWorkspace(nextId);
            return { success: true, message: `Switched to ${EDITOR_LABELS[nextId]}.` };
          }
          return { success: false, message: `Unknown editor: ${editorId}. Use ${editorIdsForActions.join(', ')}.` };
        },
      }),
    [editorIdsForActions, setActiveWorkspace],
  );

  const openEditorAction = React.useMemo(
    () =>
      createAppAction<[Parameter]>({
        name: 'openEditor',
        description: 'Open an editor tab if not already open, and switch to it.',
        parameters: [
          {
            name: 'editorId',
            type: 'string',
            description: `Editor to open: ${editorIdsForActions.map((id) => `"${id}"`).join(', ')}`,
            required: true,
          },
        ],
        handler: async ({ editorId }) => {
          const id = String(editorId);
          if (editorIdsForActions.includes(id as EditorId)) {
            const nextId = id as EditorId;
            openWorkspace(nextId);
            return { success: true, message: `Opened ${EDITOR_LABELS[nextId]}.` };
          }
          if (id === 'video') {
            return { success: false, message: 'Video editor is currently locked.' };
          }
          if (id === 'strategy') {
            return { success: false, message: 'Strategy editor is currently locked.' };
          }
          return { success: false, message: `Unknown editor: ${editorId}.` };
        },
      }),
    [editorIdsForActions, openWorkspace],
  );

  const closeEditorAction = React.useMemo(
    () =>
      createAppAction<[Parameter]>({
        name: 'closeEditor',
        description: 'Close an editor tab. Must have at least one open.',
        parameters: [
          {
            name: 'editorId',
            type: 'string',
            description: `Editor to close: ${editorIdsForActions.map((id) => `"${id}"`).join(', ')}`,
            required: true,
          },
        ],
        handler: async ({ editorId }) => {
          const id = String(editorId);
          if (editorIdsForActions.includes(id as EditorId)) {
            if (openWorkspaceIds.length <= 1) {
              return { success: false, message: 'Cannot close the last editor.' };
            }
            const nextId = id as EditorId;
            closeWorkspace(nextId);
            return { success: true, message: `Closed ${EDITOR_LABELS[nextId]}.` };
          }
          return { success: false, message: `Unknown editor: ${editorId}.` };
        },
      }),
    [closeWorkspace, editorIdsForActions, openWorkspaceIds.length],
  );

  const generateImageAction = React.useMemo(
    () =>
      createAppAction<[Parameter, Parameter, Parameter]>({
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
      }),
    [generateImageMutation, imageGenEnabled],
  );

  const structuredOutputAction = React.useMemo(
    () =>
      createAppAction<[Parameter, Parameter]>({
        name: 'app_respondWithStructure',
        description: 'Extract or produce structured data (JSON) from a prompt.',
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
      }),
    [structuredOutputMutation],
  );

  useCopilotAction(switchEditorAction);
  useCopilotAction(openEditorAction);
  useCopilotAction(closeEditorAction);
  useCopilotAction(generateImageAction);
  useCopilotAction(structuredOutputAction);

  return <Studio />;
}
