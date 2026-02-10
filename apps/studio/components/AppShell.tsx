'use client';

import React, { useMemo } from 'react';
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
import {
  EditorButton,
  EditorMenubar,
  EditorFileMenu,
  EditorHelpMenu,
} from '@forge/shared/components/editor';
import { AppSettingsSheet } from '@/components/settings/AppSettingsSheet';
import { AssistantChatPopup } from '@/components/assistant/AssistantChatPopup';
import { CreateListingSheet } from '@/components/listings/CreateListingSheet';
import { OpenSettingsSheetProvider } from '@/lib/contexts/OpenSettingsSheetContext';
import { AppMenubarProvider, useAppMenubar } from '@/lib/contexts/AppMenubarContext';
import { useAppSettingsMenuItems } from '@/lib/settings/useAppSettingsMenuItems';
import { Toaster } from '@forge/ui/sonner';
import { Separator } from '@forge/ui/separator';
import { useSettingsStore } from '@/lib/settings/store';
import { useEntitlements, CAPABILITIES } from '@forge/shared/entitlements';
import { useVideoEditorEnabled, useStrategyEditorEnabled } from '@/lib/feature-flags';
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

function UnifiedMenubar({
  onOpenCreateListing,
  openProjectSwitcher,
  openChatPopup,
  mergeEditorMenus = true,
}: {
  onOpenCreateListing: () => void;
  openProjectSwitcher?: () => void;
  openChatPopup?: () => void;
  /** When false, app bar shows only app-level items (File, Settings, Help); editor contributions are ignored. Default true. */
  mergeEditorMenus?: boolean;
}) {
  const { editorMenus } = useAppMenubar();
  const appSettingsItems = useAppSettingsMenuItems({ onOpenCreateListing });
  const merged = useMemo(() => {
    const helpItems = [
      EditorHelpMenu.Welcome(),
      EditorHelpMenu.ShowCommands({ onSelect: openChatPopup }),
      EditorHelpMenu.About(),
    ];
    if (!mergeEditorMenus) {
      const fileItems = [
        ...(openProjectSwitcher ? [EditorFileMenu.SwitchProject({ onSelect: openProjectSwitcher })] : []),
      ];
      return [
        ...(fileItems.length > 0 ? [{ id: 'file', label: 'File', items: fileItems }] : []),
        { id: 'settings', label: 'Settings', items: appSettingsItems },
        { id: 'help', label: 'Help', items: helpItems },
      ];
    }
    const fileMenuFromEditor = editorMenus.find((m) => m.id === 'file');
    const otherEditorMenus = editorMenus.filter((m) => m.id !== 'file');
    const fileItems = [
      ...(openProjectSwitcher ? [EditorFileMenu.SwitchProject({ onSelect: openProjectSwitcher })] : []),
      ...(fileMenuFromEditor?.items ?? []),
    ];
    return [
      ...(fileItems.length > 0 ? [{ id: 'file', label: 'File', items: fileItems }] : []),
      ...otherEditorMenus,
      { id: 'settings', label: 'Settings', items: appSettingsItems },
      { id: 'help', label: 'Help', items: helpItems },
    ];
  }, [mergeEditorMenus, editorMenus, appSettingsItems, openProjectSwitcher, openChatPopup]);
  return <EditorMenubar menus={merged} />;
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
  const appSettingsSheetOpen = useEditorStore((s) => s.appSettingsSheetOpen);
  const setAppSettingsSheetOpen = useEditorStore((s) => s.setAppSettingsSheetOpen);
  const { activeWorkspaceId, openWorkspaceIds } = route;
  const [chatPopupOpen, setChatPopupOpen] = React.useState(false);
  const [projectSwitcherOpen, setProjectSwitcherOpen] = React.useState(false);
  const [createListingOpen, setCreateListingOpen] = React.useState(false);
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
  const videoEnabled = useVideoEditorEnabled();
  const strategyEnabled = useStrategyEditorEnabled();
  const editorIdsForActions = React.useMemo(
    () =>
      VALID_EDITOR_IDS.filter(
        (id) => (id !== 'video' || videoEnabled) && (id !== 'strategy' || strategyEnabled),
      ),
    [videoEnabled, strategyEnabled],
  );
  const editorNames = React.useMemo(() => {
    const names: Partial<Record<EditorId, string>> = {};
    editorIdsForActions.forEach((id) => {
      names[id] = EDITOR_LABELS[id];
    });
    return names;
  }, [editorIdsForActions]);
  const visibleWorkspaceIds = React.useMemo(
    () =>
      openWorkspaceIds.filter(
        (id) => (id !== 'video' || videoEnabled) && (id !== 'strategy' || strategyEnabled),
      ),
    [openWorkspaceIds, videoEnabled, strategyEnabled],
  );
  const imageGenEnabled = entitlements.has(CAPABILITIES.IMAGE_GENERATION);
  const generateImageMutation = useGenerateImage();
  const structuredOutputMutation = useStructuredOutput();

  React.useEffect(() => {
    if (videoEnabled) return;
    if (openWorkspaceIds.includes('video')) {
      closeWorkspace('video');
    }
    if (activeWorkspaceId === 'video') {
      setActiveWorkspace(visibleWorkspaceIds[0] ?? 'dialogue');
    }
  }, [
    activeWorkspaceId,
    closeWorkspace,
    openWorkspaceIds,
    setActiveWorkspace,
    videoEnabled,
    visibleWorkspaceIds,
  ]);

  React.useEffect(() => {
    if (strategyEnabled) return;
    if (openWorkspaceIds.includes('strategy')) {
      closeWorkspace('strategy');
    }
    if (activeWorkspaceId === 'strategy') {
      setActiveWorkspace(visibleWorkspaceIds[0] ?? 'dialogue');
    }
  }, [
    activeWorkspaceId,
    closeWorkspace,
    openWorkspaceIds,
    setActiveWorkspace,
    strategyEnabled,
    visibleWorkspaceIds,
  ]);

  const copilotReadableValue = React.useMemo(
    () => ({
      activeWorkspaceId,
      activeEditorId: activeWorkspaceId,
      activeEditorName: EDITOR_LABELS[activeWorkspaceId],
      editorNames,
      openWorkspaceIds: visibleWorkspaceIds,
      editorSummary: EDITOR_SUMMARY[activeWorkspaceId],
      hint: videoEnabled
        ? 'Say "switch to Dialogue", "open Video", "open Characters", or "open Strategy" to change editor.'
        : 'Say "switch to Dialogue", "open Characters", or "open Strategy" to change editor.',
    }),
    [activeWorkspaceId, editorNames, visibleWorkspaceIds, videoEnabled],
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
          if (id === 'video') {
            return { success: false, message: 'Video editor is currently locked.' };
          }
          if (id === 'strategy') {
            return { success: false, message: 'Strategy editor is currently locked.' };
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
          if (id === 'video') {
            return { success: false, message: 'Video editor is currently locked.' };
          }
          if (id === 'strategy') {
            return { success: false, message: 'Strategy editor is currently locked.' };
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

  const openAppSettingsSheet = React.useCallback(() => {
    // Defer so Radix menubar can close first; otherwise the sheet may not open.
    setTimeout(() => setAppSettingsSheetOpen(true), 0);
  }, []);
  const openChatPopup = React.useCallback(() => setChatPopupOpen(true), []);

  // Global shortcut: Mod+K and Ctrl+Shift+P open assistant chat popup
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      const isModK = mod && (e.key === 'k' || e.key === 'K');
      const isCtrlShiftP = e.ctrlKey && e.shiftKey && (e.key === 'p' || e.key === 'P');
      if (isModK || isCtrlShiftP) {
        const target = e.target as Node;
        const inInput = target && typeof (target as HTMLElement).closest === 'function'
          ? (target as HTMLElement).closest('input, textarea, [contenteditable="true"]')
          : null;
        if (!inInput) {
          e.preventDefault();
          setChatPopupOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <OpenSettingsSheetProvider>
    <AppMenubarProvider>
    <EditorApp>
      {/* Editor tabs */}
      <EditorApp.Tabs
        label="Editor tabs"
        leading={
          <UnifiedMenubar
            onOpenCreateListing={() => setCreateListingOpen(true)}
            openProjectSwitcher={() => setProjectSwitcherOpen(true)}
            openChatPopup={openChatPopup}
          />
        }
        actions={
          <>
            <ProjectSwitcher
              projects={projectsQuery.data ?? []}
              selectedProjectId={activeProjectId}
              onProjectChange={setActiveProjectId}
              open={projectSwitcherOpen}
              onOpenChange={setProjectSwitcherOpen}
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
              tooltip="Open or switch to Dialogue editor"
              className="border-0 text-muted-foreground hover:text-foreground"
            >
              <MessageCircle className="size-3 shrink-0" />
              Dialogue
            </EditorButton>
            {videoEnabled ? (
              <EditorButton
                type="button"
                variant="outline"
                size="sm"
                onClick={() => openWorkspace('video')}
                tooltip="Open or switch to Video editor"
                className="border-0 text-muted-foreground hover:text-foreground"
              >
                <Video className="size-3 shrink-0" />
                Video
              </EditorButton>
            ) : null}
            <EditorButton
              type="button"
              variant="outline"
              size="sm"
              onClick={() => openWorkspace('character')}
              tooltip="Open or switch to Character editor"
              className="border-0 text-muted-foreground hover:text-foreground"
            >
              <Users className="size-3 shrink-0" />
              Character
            </EditorButton>
            {strategyEnabled ? (
              <EditorButton
                type="button"
                variant="outline"
                size="sm"
                onClick={() => openWorkspace('strategy')}
                tooltip="Open or switch to Strategy editor"
                className="border-0 text-muted-foreground hover:text-foreground"
              >
                <Target className="size-3 shrink-0" />
                Strategy
              </EditorButton>
            ) : null}
            <Separator orientation="vertical" className="h-[var(--control-height-sm)]" />
          </>
        }
      >
        {visibleWorkspaceIds.map((id) => {
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
                  <Icon className="size-3 shrink-0" aria-hidden />
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
        {activeWorkspaceId === 'video' && videoEnabled && <VideoEditor />}
        {activeWorkspaceId === 'character' && <CharacterEditor />}
        {activeWorkspaceId === 'strategy' && strategyEnabled && <StrategyEditor />}
      </EditorApp.Content>
      <CreateListingSheet open={createListingOpen} onOpenChange={setCreateListingOpen} />
      <AssistantChatPopup open={chatPopupOpen} onOpenChange={setChatPopupOpen} />
      <AppSettingsSheet
        open={appSettingsSheetOpen}
        onOpenChange={setAppSettingsSheetOpen}
        activeEditorId={activeWorkspaceId}
        activeProjectId={activeProjectId != null ? String(activeProjectId) : null}
        viewportId="main"
      />
      {toastsEnabled !== false && <Toaster />}
    </EditorApp>
    </AppMenubarProvider>
    </OpenSettingsSheetProvider>
  );
}
