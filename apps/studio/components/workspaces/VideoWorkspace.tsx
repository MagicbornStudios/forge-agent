'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import {
  WorkspaceShell,
  WorkspaceHeader,
  WorkspaceToolbar,
  WorkspaceLayoutGrid,
  WorkspaceStatusBar,
} from '@forge/shared/components/workspace';
import { ModelSwitcher } from '@/components/model-switcher';
import { useVideoStore, VIDEO_DRAFT_KEY } from '@/lib/domains/video/store';
import { useSaveVideoDoc, useVideoDocs, useVideoDoc, useCreateVideoDoc } from '@/lib/data/hooks';
import { useAppShellStore } from '@/lib/app-shell/store';
import { WORKSPACE_EDITOR_IDS } from '@/lib/app-shell/workspace-metadata';
import { useSettingsStore } from '@/lib/settings/store';
import { useAIHighlight } from '@forge/shared/copilot/use-ai-highlight';
import { useDomainCopilot } from '@forge/shared/copilot/use-domain-copilot';
import { useVideoContract } from '@/lib/domains/video/copilot';
import { DEFAULT_VIDEO_DOC_DATA, getVideoDocData } from '@/lib/domains/video/types';
import { SettingsMenu } from '@/components/settings/SettingsMenu';
import { Badge } from '@forge/ui/badge';
import { FeatureGate } from '@forge/shared';
import { CAPABILITIES, useEntitlements } from '@forge/shared/entitlements';
import { LivePlayerProvider } from '@twick/live-player';
import { TimelineProvider, INITIAL_TIMELINE_DATA } from '@twick/timeline';
import { TwickStudio } from '@twick/studio';

export function VideoWorkspace() {
  const lastVideoDocId = useAppShellStore((s) => s.lastVideoDocId);
  const setLastVideoDocId = useAppShellStore((s) => s.setLastVideoDocId);
  const { doc, setDoc, restoreDraft, applyOperations, isDirty } = useVideoStore();
  const saveVideoDocMutation = useSaveVideoDoc();
  const save = () => saveVideoDocMutation.mutate();
  const initialLoadDone = useRef(false);
  const draftRestored = useRef(false);

  const videoDocsQuery = useVideoDocs();
  const videoDocQuery = useVideoDoc(lastVideoDocId);
  const createVideoDocMutation = useCreateVideoDoc();
  const workspaceTheme = useAppShellStore((s) => s.workspaceThemes.video);
  const editorId = WORKSPACE_EDITOR_IDS.video;
  const agentName = useSettingsStore((s) =>
    s.getSettingValue('ai.agentName', { workspaceId: 'video', editorId })
  ) as string | undefined;
  const showAgentName = useSettingsStore((s) =>
    s.getSettingValue('ai.showAgentName', { workspaceId: 'video' })
  ) as boolean | undefined;
  const toolsEnabledSetting = useSettingsStore((s) =>
    s.getSettingValue('ai.toolsEnabled', { workspaceId: 'video', editorId })
  ) as boolean | undefined;
  const entitlements = useEntitlements();
  const toolsEnabled =
    toolsEnabledSetting !== false && entitlements.has(CAPABILITIES.STUDIO_AI_TOOLS);
  const { onAIHighlight, clearHighlights } = useAIHighlight();

  // Apply persisted video draft only when it matches current doc (after app-shell has rehydrated).
  useEffect(() => {
    if (draftRestored.current || lastVideoDocId == null || typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(VIDEO_DRAFT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { state?: { documentId?: number; doc?: unknown; isDirty?: boolean } };
      const state = parsed?.state;
      if (state?.documentId === lastVideoDocId && state.doc) {
        restoreDraft({
          doc: state.doc as Parameters<typeof restoreDraft>[0]['doc'],
          isDirty: state.isDirty ?? true,
        });
        draftRestored.current = true;
        initialLoadDone.current = true;
      }
    } catch {
      // ignore
    }
  }, [lastVideoDocId, restoreDraft]);

  useEffect(() => {
    if (initialLoadDone.current) return;

    if (lastVideoDocId != null && videoDocQuery.data) {
      setDoc(videoDocQuery.data);
      setLastVideoDocId(videoDocQuery.data.id);
      initialLoadDone.current = true;
      return;
    }

    if (lastVideoDocId === null && videoDocsQuery.data !== undefined) {
      if (Array.isArray(videoDocsQuery.data) && videoDocsQuery.data.length > 0) {
        const first = videoDocsQuery.data[0];
        setDoc(first);
        setLastVideoDocId(first.id);
      } else {
        createVideoDocMutation
          .mutateAsync({
            title: 'Untitled timeline',
            doc: { ...DEFAULT_VIDEO_DOC_DATA },
          })
          .then((created) => {
            setDoc(created);
            setLastVideoDocId(created.id);
          })
          .catch(() => {});
      }
      initialLoadDone.current = true;
    }
  }, [
    lastVideoDocId,
    videoDocQuery.data,
    videoDocsQuery.data,
    setDoc,
    setLastVideoDocId,
    createVideoDocMutation,
  ]);

  const videoContract = useVideoContract({
    doc,
    selection: null,
    applyOperations,
    onAIHighlight,
    clearAIHighlights: clearHighlights,
  });

  useDomainCopilot(videoContract, { toolsEnabled });

  const docData = useMemo(() => getVideoDocData(doc), [doc]);

  const projectOptions = doc ? [{ value: String(doc.id), label: doc.title }] : [];
  const fileMenuItems = [
    {
      id: 'new',
      label: 'New timeline',
      onSelect: () => {
        createVideoDocMutation
          .mutateAsync({
            title: 'Untitled timeline',
            doc: { ...DEFAULT_VIDEO_DOC_DATA },
          })
          .then((created) => {
            setDoc(created);
            setLastVideoDocId(created.id);
          });
      },
    },
    {
      id: 'open',
      label: 'Open timeline',
      onSelect: () => {
        console.info('[Video] Open timeline action not implemented yet.');
      },
    },
    { id: 'separator-1', type: 'separator' as const },
    {
      id: 'save',
      label: 'Save',
      disabled: !isDirty,
      onSelect: save,
    },
    {
      id: 'export',
      label: 'Export',
      onSelect: () => {
        console.info('[Video] Export action not implemented yet.');
      },
    },
  ];
  const editMenuItems = [
    {
      id: 'cut',
      label: 'Cut',
      disabled: true,
      onSelect: () => {
        console.info('[Video] Cut action not implemented yet.');
      },
    },
    {
      id: 'copy',
      label: 'Copy',
      disabled: true,
      onSelect: () => {
        console.info('[Video] Copy action not implemented yet.');
      },
    },
  ];
  const viewMenuItems = [
    {
      id: 'zoom-in',
      label: 'Zoom in',
      disabled: true,
      onSelect: () => {
        console.info('[Video] Zoom in action not implemented yet.');
      },
    },
    {
      id: 'zoom-out',
      label: 'Zoom out',
      disabled: true,
      onSelect: () => {
        console.info('[Video] Zoom out action not implemented yet.');
      },
    },
  ];
  const menubarMenus = [
    { id: 'file', label: 'File', items: fileMenuItems },
    { id: 'edit', label: 'Edit', items: editMenuItems },
    { id: 'view', label: 'View', items: viewMenuItems },
  ];

  const mainContent = (
    <div className="h-full min-h-0">
      <LivePlayerProvider>
        <TimelineProvider
          contextId={`video-${doc?.id ?? 'demo'}`}
          initialData={INITIAL_TIMELINE_DATA}
          undoRedoPersistenceKey={`video-${doc?.id ?? 'demo'}-history`}
        >
          <TwickStudio
            studioConfig={{
              videoProps: {
                width: docData.resolution.width,
                height: docData.resolution.height,
              },
            }}
          />
        </TimelineProvider>
      </LivePlayerProvider>
    </div>
  );

  return (
    <WorkspaceShell
      workspaceId="video"
      title="Video"
      subtitle={doc?.title ?? 'Timeline'}
      domain="video"
      theme={workspaceTheme}
      className="flex flex-col h-full min-h-0 bg-background"
    >
      <WorkspaceHeader>
        <WorkspaceHeader.Left>
          <h1 className="text-lg font-bold">Video</h1>
        </WorkspaceHeader.Left>
        <WorkspaceHeader.Center>
          <span className="text-sm text-muted-foreground">{doc?.title ?? 'Timeline'}</span>
        </WorkspaceHeader.Center>
      </WorkspaceHeader>

      <WorkspaceToolbar>
        <WorkspaceToolbar.Left>
          <WorkspaceToolbar.Group className="gap-2">
            <WorkspaceToolbar.Menubar menus={menubarMenus} />
            <WorkspaceToolbar.ProjectSelect
              value={doc ? String(doc.id) : undefined}
              options={projectOptions}
              placeholder="Select timeline"
              disabled={!doc}
              tooltip="Active timeline"
              className="min-w-[180px]"
            />
          </WorkspaceToolbar.Group>
          <span className="text-xs text-muted-foreground">
            {doc ? `${docData.tracks.length} track(s)` : 'Video timeline'}
          </span>
        </WorkspaceToolbar.Left>
        <WorkspaceToolbar.Right>
          {showAgentName !== false && (
            <Badge variant="secondary" className="text-xs">
              Agent: {agentName ?? 'Default'}
            </Badge>
          )}
          <ModelSwitcher />
          <FeatureGate
            capability={CAPABILITIES.VIDEO_EXPORT}
            mode="lock-overlay"
            className="rounded-md"
          >
            <WorkspaceToolbar.Button
              variant="outline"
              size="sm"
              tooltip="Export timeline"
              onClick={() => console.info('[Video] Export not implemented yet.')}
            >
              Export
            </WorkspaceToolbar.Button>
          </FeatureGate>
          <WorkspaceToolbar.Separator />
          <SettingsMenu workspaceId="video" editorId={editorId} />
        </WorkspaceToolbar.Right>
      </WorkspaceToolbar>

      <WorkspaceLayoutGrid
        main={mainContent}
        editor={{ editorId, editorType: 'timeline' }}
      />

      <WorkspaceStatusBar>
        {isDirty ? 'Unsaved changes' : 'Ready'} - Twick editor (timeline state not yet synced)
      </WorkspaceStatusBar>
    </WorkspaceShell>
  );
}
