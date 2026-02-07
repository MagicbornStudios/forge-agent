'use client';

import React from 'react';
import { useCopilotReadable, useCopilotAction } from '@copilotkit/react-core';
import type { Parameter } from '@copilotkit/shared';
import { useEditorStore, type EditorId } from '@/lib/app-shell/store';
import {
  EDITOR_LABELS,
  EDITOR_SUMMARY,
} from '@/lib/app-shell/editor-metadata';
import { useProjects, useCreateProject } from '@/lib/data/hooks';
import { ProjectSwitcher } from '@/components/ProjectSwitcher';
import { EditorApp } from '@forge/shared/components/app';
import { EditorButton } from '@forge/shared/components/editor';
import { SettingsMenu } from '@/components/settings/SettingsMenu';
import { ThemeSwitcher, AppBarUser } from '@/components/app-bar';
import { Toaster } from '@forge/ui/sonner';
import { Separator } from '@forge/ui/separator';
import { useSettingsStore } from '@/lib/settings/store';
import { useEntitlements, CAPABILITIES } from '@forge/shared/entitlements';
import { ImageGenerateRender } from '@/components/copilot/ImageGenerateRender';
import { StructuredOutputRender } from '@/components/copilot/StructuredOutputRender';
import { MessageCircle, Video, Users, Target } from 'lucide-react';
import { useGenerateImage, useStructuredOutput } from '@/lib/data/hooks';
import { createAppAction } from '@forge/shared/copilot';

// Editors
import { DialogueEditor } from '@/components/editors/DialogueEditor';
import { VideoEditor } from '@/components/editors/VideoEditor';
import { CharacterEditor } from '@/components/editors/CharacterEditor';
import { StrategyEditor } from '@/components/editors/StrategyEditor';

const VALID_EDITOR_IDS: EditorId[] = ['dialogue', 'video', 'character', 'strategy'];

function isValidEditorId(id: string): id is EditorId {
  return VALID_EDITOR_IDS.includes(id as EditorId);
}

export function AppShell() {
  const {
    route,
    activeProjectId,
    setActiveProjectId,
    setActiveWorkspace,
    openWorkspace,
    closeWorkspace,
  } = useEditorStore();
  const { activeWorkspaceId, openWorkspaceIds } = route;
  const projectsQuery = useProjects();
  const createProjectMutation = useCreateProject();

  // Auto-select first project when none selected
  React.useEffect(() => {
    if (activeProjectId != null) return;
    const projects = projectsQuery.data ?? [];
    if (projects.length > 0) setActiveProjectId(projects[0].id);
  }, [activeProjectId, projectsQuery.data, setActiveProjectId]);
  const toastsEnabled = useSettingsStore((s) => s.getSettingValue('ui.toastsEnabled')) as boolean | undefined;
  const entitlements = useEntitlements();
  const imageGenEnabled = entitlements.has(CAPABILITIES.IMAGE_GENERATION);
  const generateImageMutation = useGenerateImage();
  const structuredOutputMutation = useStructuredOutput();

  // Shell-level context for the copilot agent
  useCopilotReadable({
    description:
      'Unified editor context: which editor is active, editor names, and editor types. Use this to switch editors.',
    value: {
      activeWorkspaceId,
      activeEditorId: activeWorkspaceId,
      activeEditorName: EDITOR_LABELS[activeWorkspaceId],
      editorNames: EDITOR_LABELS,
      openWorkspaceIds,
      editorSummary: EDITOR_SUMMARY[activeWorkspaceId],
      hint: 'Say "switch to Dialogue", "open Video", "open Characters", or "open Strategy" to change editor.',
    },
  });

  useCopilotAction(createAppAction<[Parameter]>({
    name: 'switchEditor',
    description: 'Switch the active editor tab.',
    parameters: [
      {
        name: 'editorId',
        type: 'string',
        description: `Editor to switch to: ${VALID_EDITOR_IDS.map((id) => `"${id}"`).join(', ')}`,
        required: true,
      },
    ],
    handler: async ({ editorId }) => {
      const id = String(editorId);
      if (isValidEditorId(id)) {
        setActiveWorkspace(id);
        return { success: true, message: `Switched to ${EDITOR_LABELS[id]}.` };
      }
      return { success: false, message: `Unknown editor: ${editorId}. Use ${VALID_EDITOR_IDS.join(', ')}.` };
    },
  }));

  useCopilotAction(createAppAction<[Parameter]>({
    name: 'openEditor',
    description: 'Open an editor tab if not already open, and switch to it.',
    parameters: [
      {
        name: 'editorId',
        type: 'string',
        description: `Editor to open: ${VALID_EDITOR_IDS.map((id) => `"${id}"`).join(', ')}`,
        required: true,
      },
    ],
    handler: async ({ editorId, modeId }) => {
      const id = String(editorId ?? modeId);
      if (isValidEditorId(id)) {
        openWorkspace(id);
        return { success: true, message: `Opened ${EDITOR_LABELS[id]}.` };
      }
      return { success: false, message: `Unknown editor: ${editorId}.` };
    },
  }));

  useCopilotAction(createAppAction<[Parameter]>({
    name: 'closeEditor',
    description: 'Close an editor tab. Must have at least one open.',
    parameters: [
      {
        name: 'editorId',
        type: 'string',
        description: `Editor to close: ${VALID_EDITOR_IDS.map((id) => `"${id}"`).join(', ')}`,
        required: true,
      },
    ],
    handler: async ({ editorId }) => {
      const id = String(editorId);
      if (isValidEditorId(id)) {
        if (openWorkspaceIds.length <= 1) {
          return { success: false, message: 'Cannot close the last editor.' };
        }
        closeWorkspace(id);
        return { success: true, message: `Closed ${EDITOR_LABELS[id]}.` };
      }
      return { success: false, message: `Unknown editor: ${editorId}.` };
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
      {/* Editor tabs */}
      <EditorApp.Tabs
        label="Editor tabs"
        actions={
          <>
            <ProjectSwitcher
              projects={projectsQuery.data ?? []}
              selectedProjectId={activeProjectId}
              onProjectChange={setActiveProjectId}
              onCreateProject={async ({ name, description }) => {
                const baseSlug = name
                  .toLowerCase()
                  .trim()
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/(^-|-$)+/g, '');
                const existingSlugs = new Set((projectsQuery.data ?? []).map((p) => p.slug));
                const rootSlug = baseSlug || `project-${Date.now()}`;
                let slug = rootSlug;
                let suffix = 2;
                while (existingSlugs.has(slug)) {
                  slug = `${rootSlug}-${suffix}`;
                  suffix += 1;
                }
                const created = await createProjectMutation.mutateAsync({
                  title: name,
                  slug,
                  description,
                  domain: 'forge',
                });
                setActiveProjectId(created.id);
                return { id: created.id, name: created.title };
              }}
              isLoading={projectsQuery.isLoading}
              error={projectsQuery.error ? 'Failed to load projects' : null}
              variant="compact"
            />
            <EditorButton
              type="button"
              variant="outline"
              size="sm"
              onClick={() => openWorkspace('dialogue')}
              tooltip="Open Dialogue editor"
              className="text-muted-foreground hover:text-foreground"
            >
              <MessageCircle className="size-3 shrink-0" />
              + Dialogue Editor
            </EditorButton>
            <EditorButton
              type="button"
              variant="outline"
              size="sm"
              onClick={() => openWorkspace('video')}
              tooltip="Open Video editor"
              className="text-muted-foreground hover:text-foreground"
            >
              <Video className="size-3 shrink-0" />
              + Video Editor
            </EditorButton>
            <EditorButton
              type="button"
              variant="outline"
              size="sm"
              onClick={() => openWorkspace('character')}
              tooltip="Open Character editor"
              className="text-muted-foreground hover:text-foreground"
            >
              <Users className="size-3.5 shrink-0" />
              + Character Editor
            </EditorButton>
            <EditorButton
              type="button"
              variant="outline"
              size="sm"
              onClick={() => openWorkspace('strategy')}
              tooltip="Open Strategy editor"
              className="text-muted-foreground hover:text-foreground"
            >
              <Target className="size-3 shrink-0" />
              + Strategy Editor
            </EditorButton>
            <Separator orientation="vertical" className="h-[var(--control-height-sm)]" />
            <ThemeSwitcher />
            <AppBarUser />
            <SettingsMenu tooltip="App settings" defaultScope="app" />
          </>
        }
      >
        {openWorkspaceIds.map((id) => {
          const Icon =
            id === 'dialogue'
              ? MessageCircle
              : id === 'video'
                ? Video
                : id === 'character'
                  ? Users
                  : Target;
          return (
            <EditorApp.Tab
              key={id}
              label={
                <>
                  <Icon className="size-4 shrink-0" aria-hidden />
                  {EDITOR_LABELS[id]}
                </>
              }
              isActive={activeWorkspaceId === id}
              domain={id}
              onSelect={() => setActiveWorkspace(id)}
              onClose={openWorkspaceIds.length > 1 ? () => closeWorkspace(id) : undefined}
              tooltip={`Switch to ${EDITOR_LABELS[id]}`}
              closeTooltip={`Close ${EDITOR_LABELS[id]}`}
            />
          );
        })}
      </EditorApp.Tabs>

      {/* Active editor content */}
      <EditorApp.Content>
        {activeWorkspaceId === 'dialogue' && <DialogueEditor />}
        {activeWorkspaceId === 'video' && <VideoEditor />}
        {activeWorkspaceId === 'character' && <CharacterEditor />}
        {activeWorkspaceId === 'strategy' && <StrategyEditor />}
      </EditorApp.Content>
      {toastsEnabled !== false && <Toaster />}
    </EditorApp>
  );
}
