'use client';

import React, { useEffect } from 'react';
import {
  WorkspaceShell,
  WorkspaceHeader,
  WorkspaceToolbar,
  WorkspaceLayoutGrid,
  WorkspaceStatusBar,
} from '@forge/shared/components/workspace';
import { ModelSwitcher } from '@/components/model-switcher';
import { useVideoStore } from '@/lib/domains/video/store';
import { useAppShellStore } from '@/lib/app-shell/store';
import { WORKSPACE_EDITOR_IDS } from '@/lib/app-shell/workspace-metadata';
import { useSettingsStore } from '@/lib/settings/store';
import { useAIHighlight } from '@forge/shared/copilot/use-ai-highlight';
import { useDomainCopilot } from '@forge/shared/copilot/use-domain-copilot';
import { useVideoContract } from '@/lib/domains/video/copilot';
import type { VideoDoc } from '@/lib/domains/video/types';
import { SettingsMenu } from '@/components/settings/SettingsMenu';
import { Badge } from '@/components/ui/badge';

const createEmptyVideoDoc = (): VideoDoc => ({
  id: `video-${Date.now()}`,
  graphId: 1,
  title: 'Untitled timeline',
  tracks: [],
  sceneOverrides: [],
  resolution: { width: 1920, height: 1080 },
});

export function VideoWorkspace() {
  const { doc, setDoc, applyOperations } = useVideoStore();
  const workspaceTheme = useAppShellStore((s) => s.workspaceThemes.video);
  const editorId = WORKSPACE_EDITOR_IDS.video;
  const agentName = useSettingsStore((s) =>
    s.getSettingValue('ai.agentName', { workspaceId: 'video', editorId })
  ) as string | undefined;
  const showAgentName = useSettingsStore((s) =>
    s.getSettingValue('ai.showAgentName', { workspaceId: 'video' })
  ) as boolean | undefined;
  const toolsEnabled = useSettingsStore((s) =>
    s.getSettingValue('ai.toolsEnabled', { workspaceId: 'video', editorId })
  ) as boolean | undefined;
  const { onAIHighlight, clearHighlights } = useAIHighlight();

  useEffect(() => {
    if (!doc) {
      setDoc(createEmptyVideoDoc());
    }
  }, [doc, setDoc]);

  const videoContract = useVideoContract({
    doc,
    selection: null,
    applyOperations,
    onAIHighlight,
    clearAIHighlights: clearHighlights,
  });

  useDomainCopilot(videoContract, { toolsEnabled: toolsEnabled !== false });

  const projectOptions = doc ? [{ value: doc.id, label: doc.title }] : [];
  const fileMenuItems = [
    {
      id: 'new',
      label: 'New timeline',
      onSelect: () => {
        setDoc(createEmptyVideoDoc());
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
      onSelect: () => {
        console.info('[Video] Save action not implemented yet.');
      },
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
              value={doc?.id}
              options={projectOptions}
              placeholder="Select timeline"
              disabled={!doc}
              tooltip="Active timeline"
              className="min-w-[180px]"
            />
          </WorkspaceToolbar.Group>
          <span className="text-xs text-muted-foreground">
            {doc ? `${doc.tracks.length} track(s)` : 'Video timeline'}
          </span>
        </WorkspaceToolbar.Left>
        <WorkspaceToolbar.Right>
          {showAgentName !== false && (
            <Badge variant="secondary" className="text-xs">
              Agent: {agentName ?? 'Default'}
            </Badge>
          )}
          <ModelSwitcher />
          <WorkspaceToolbar.Separator />
          <SettingsMenu workspaceId="video" editorId={editorId} />
        </WorkspaceToolbar.Right>
      </WorkspaceToolbar>

      <WorkspaceLayoutGrid
        main={
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Video workspace - timeline and Twick UI coming soon. Use the AI to add tracks or elements.
          </div>
        }
        editor={{ editorId, editorType: 'timeline' }}
      />

      <WorkspaceStatusBar>Ready</WorkspaceStatusBar>
    </WorkspaceShell>
  );
}
