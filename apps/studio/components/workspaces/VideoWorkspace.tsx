'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  WorkspaceShell,
  WorkspaceHeader,
  WorkspaceToolbar,
  WorkspaceLayoutGrid,
  WorkspaceStatusBar,
} from '@forge/shared/components/workspace';
import { ModelSwitcher } from '@/components/model-switcher';
import { useVideoStore } from '@/lib/domains/video/store';
import { useSaveVideoDoc } from '@/lib/data/hooks';
import { useAppShellStore } from '@/lib/app-shell/store';
import { WORKSPACE_EDITOR_IDS } from '@/lib/app-shell/workspace-metadata';
import { useSettingsStore } from '@/lib/settings/store';
import { useAIHighlight } from '@forge/shared/copilot/use-ai-highlight';
import { useDomainCopilot } from '@forge/shared/copilot/use-domain-copilot';
import { useVideoContract } from '@/lib/domains/video/copilot';
import { DEFAULT_VIDEO_DOC_DATA, getVideoDocData } from '@/lib/domains/video/types';
import { getLastVideoDocId } from '@/lib/persistence/local-storage';
import { SettingsMenu } from '@/components/settings/SettingsMenu';
import { Badge } from '@forge/ui/badge';
import { FeatureGate } from '@forge/shared/components/gating';
import { CAPABILITIES, useEntitlements } from '@forge/shared/entitlements';
import { TwickTimeline, TwickTrackList } from '@/components/video';

export function VideoWorkspace() {
  const { doc, setDoc, applyOperations, loadDoc, isDirty } = useVideoStore();
  const saveVideoDocMutation = useSaveVideoDoc();
  const save = () => saveVideoDocMutation.mutate();
  const initialLoadDone = useRef(false);
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
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedTrackId(null);
    setSelectedElementId(null);
  }, [doc?.id]);

  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;

    const run = async () => {
      const lastId = getLastVideoDocId();
      if (lastId != null) {
        await loadDoc(lastId);
        return;
      }
      const listRes = await fetch('/api/video-docs');
      if (!listRes.ok) return;
      const docs = await listRes.json();
      if (Array.isArray(docs) && docs.length > 0) {
        const id = docs[0].id != null ? Number(docs[0].id) : docs[0].id;
        await loadDoc(id);
        return;
      }
      const createRes = await fetch('/api/video-docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Untitled timeline',
          doc: { ...DEFAULT_VIDEO_DOC_DATA },
        }),
      });
      if (createRes.ok) {
        const created = await createRes.json();
        setDoc(created);
      }
    };

    run();
  }, [loadDoc, setDoc]);

  const videoContract = useVideoContract({
    doc,
    selection: null,
    applyOperations,
    onAIHighlight,
    clearAIHighlights: clearHighlights,
  });

  useDomainCopilot(videoContract, { toolsEnabled });

  const docData = useMemo(() => getVideoDocData(doc), [doc]);
  const selectedTrack = docData.tracks.find((track) => track.id === selectedTrackId) ?? null;
  const selectedElement = selectedTrack?.elements.find((el) => el.id === selectedElementId) ?? null;

  const handleAddTrack = useCallback(() => {
    if (!doc) return;
    const name = `Track ${docData.tracks.length + 1}`;
    applyOperations([{ type: 'addTrack', name, trackType: 'video' }]);
  }, [applyOperations, doc, docData.tracks.length]);

  const handleAddTextElement = useCallback(() => {
    if (!doc) return;
    let targetTrackId = selectedTrackId ?? docData.tracks[0]?.id ?? null;
    if (!targetTrackId) {
      applyOperations([{ type: 'addTrack', name: 'Track 1', trackType: 'video' }]);
      const nextDoc = useVideoStore.getState().doc;
      const nextData = getVideoDocData(nextDoc);
      targetTrackId = nextData.tracks[0]?.id ?? null;
    }
    if (!targetTrackId) return;
    applyOperations([
      {
        type: 'addElement',
        trackId: targetTrackId,
        elementType: 'text',
        start: 0,
        end: 5,
        props: { text: 'Title card' },
      },
    ]);
    setSelectedTrackId(targetTrackId);
  }, [applyOperations, doc, docData.tracks, selectedTrackId]);

  const projectOptions = doc ? [{ value: String(doc.id), label: doc.title }] : [];
  const fileMenuItems = [
    {
      id: 'new',
      label: 'New timeline',
      onSelect: async () => {
        const res = await fetch('/api/video-docs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Untitled timeline',
            doc: { ...DEFAULT_VIDEO_DOC_DATA },
          }),
        });
        if (res.ok) setDoc(await res.json());
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

  const leftContent = doc ? (
    <TwickTrackList
      tracks={docData.tracks}
      selectedTrackId={selectedTrackId}
      onSelectTrack={(trackId) => {
        setSelectedTrackId(trackId);
        setSelectedElementId(null);
      }}
      onAddTrack={handleAddTrack}
    />
  ) : (
    <div className="p-4 text-sm text-muted-foreground">Loading timeline...</div>
  );

  const mainContent = doc ? (
    <TwickTimeline
      data={docData}
      selectedTrackId={selectedTrackId}
      selectedElementId={selectedElementId}
      onSelectTrack={(trackId) => {
        setSelectedTrackId(trackId);
        setSelectedElementId(null);
      }}
      onSelectElement={(trackId, elementId) => {
        setSelectedTrackId(trackId);
        setSelectedElementId(elementId);
      }}
    />
  ) : (
    <div className="flex h-full items-center justify-center text-muted-foreground">
      Loading timeline...
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
          <WorkspaceToolbar.Button
            variant="outline"
            size="sm"
            tooltip="Add a new track"
            onClick={handleAddTrack}
            disabled={!doc}
          >
            Add track
          </WorkspaceToolbar.Button>
          <WorkspaceToolbar.Button
            variant="outline"
            size="sm"
            tooltip="Add a text element"
            onClick={handleAddTextElement}
            disabled={!doc}
          >
            Add text
          </WorkspaceToolbar.Button>
          <FeatureGate capability={CAPABILITIES.VIDEO_EXPORT} mode="lock-overlay" className="rounded-md">
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
        left={leftContent}
        main={mainContent}
        editor={{ editorId, editorType: 'timeline' }}
      />

      <WorkspaceStatusBar>
        {isDirty ? 'Unsaved changes' : 'Ready'}
        {selectedTrack && (
          <span className="ml-2 text-muted-foreground">- Track: {selectedTrack.name}</span>
        )}
        {selectedElement && (
          <span className="ml-2 text-muted-foreground">- Element: {selectedElement.type}</span>
        )}
      </WorkspaceStatusBar>
    </WorkspaceShell>
  );
}
