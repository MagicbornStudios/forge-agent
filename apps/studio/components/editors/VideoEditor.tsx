'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  EditorShell,
  EditorHeader,
  EditorToolbar,
  EditorStatusBar,
  EditorDockLayout,
  EditorDockPanel,
} from '@forge/shared/components/editor';
import { useVideoStore, VIDEO_DRAFT_KEY } from '@/lib/domains/video/store';
import { useSaveVideoDoc, useVideoDocs, useVideoDoc, useCreateVideoDoc } from '@/lib/data/hooks';
import { useEditorStore } from '@/lib/app-shell/store';
import { EDITOR_VIEWPORT_IDS } from '@/lib/app-shell/editor-metadata';
import { useEditorPanelVisibility } from '@/lib/app-shell/useEditorPanelVisibility';
import { useSettingsStore } from '@/lib/settings/store';
import { useAIHighlight } from '@forge/shared/copilot/use-ai-highlight';
import { useDomainCopilot } from '@forge/shared/copilot/use-domain-copilot';
import { useVideoContract } from '@/lib/domains/video/copilot';
import { DEFAULT_VIDEO_DOC_DATA, getVideoDocData } from '@/lib/domains/video/types';
import { useAppMenubarContribution } from '@/lib/contexts/AppMenubarContext';
import { Badge } from '@forge/ui/badge';
import { FeatureGate, type DockLayoutRef } from '@forge/shared';
import { CAPABILITIES, useEntitlements } from '@forge/shared/entitlements';
import { TwickTrackList } from '@/components/video/TwickTrackList';
import { TwickTimeline } from '@/components/video/TwickTimeline';
import { LivePlayerProvider } from '@twick/live-player';
import { TimelineProvider, INITIAL_TIMELINE_DATA } from '@twick/timeline';
import { TwickStudio } from '@twick/studio';
import { LayoutPanelTop, PanelBottom, PanelRight } from 'lucide-react';

export function VideoEditor() {
  const lastVideoDocId = useEditorStore((s) => s.lastVideoDocId);
  const setLastVideoDocId = useEditorStore((s) => s.setLastVideoDocId);
  const { doc, setDoc, restoreDraft, applyOperations, isDirty } = useVideoStore();
  const saveVideoDocMutation = useSaveVideoDoc();
  const save = () => saveVideoDocMutation.mutate();
  const initialLoadDone = useRef(false);
  const draftRestored = useRef(false);

  const videoDocsQuery = useVideoDocs();
  const videoDocQuery = useVideoDoc(lastVideoDocId);
  const createVideoDocMutation = useCreateVideoDoc();
  const editorId = 'video';
  const viewportId = EDITOR_VIEWPORT_IDS.video;
  const editorTheme = useSettingsStore((s) =>
    s.getSettingValue('ui.theme', { editorId }),
  ) as string | undefined;
  const editorDensity = useSettingsStore((s) =>
    s.getSettingValue('ui.density', { editorId }),
  ) as string | undefined;
  const agentName = useSettingsStore((s) =>
    s.getSettingValue('ai.agentName', { editorId, viewportId }),
  ) as string | undefined;
  const showAgentName = useSettingsStore((s) =>
    s.getSettingValue('ai.showAgentName', { editorId }),
  ) as boolean | undefined;
  const toolsEnabledSetting = useSettingsStore((s) =>
    s.getSettingValue('ai.toolsEnabled', { editorId, viewportId }),
  ) as boolean | undefined;
  const showRightPanel = useSettingsStore((s) =>
    s.getSettingValue('panel.visible.video-right', { editorId, viewportId }),
  ) as boolean | undefined;
  const showBottomPanel = useSettingsStore((s) =>
    s.getSettingValue('panel.visible.video-bottom', { editorId, viewportId }),
  ) as boolean | undefined;
  const entitlements = useEntitlements();
  const toolsEnabled =
    toolsEnabledSetting !== false && entitlements.has(CAPABILITIES.STUDIO_AI_TOOLS);
  const { onAIHighlight, clearHighlights } = useAIHighlight();

  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

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
  const { visibility: panelVisibility, setVisible: setPanelVisible, restoreAll: restoreAllPanels, panelSpecs } = useEditorPanelVisibility('video');
  const dockLayouts = useEditorStore((s) => s.dockLayouts);
  const setDockLayout = useEditorStore((s) => s.setDockLayout);
  const clearDockLayout = useEditorStore((s) => s.clearDockLayout);
  const layoutRef = useRef<DockLayoutRef>(null);
  const VIDEO_LAYOUT_ID = 'video-mode';

  const viewMenuItems = useMemo(
    () => {
      const panelIcons: Record<string, React.ReactNode> = {
        right: <PanelRight size={16} />,
        bottom: <PanelBottom size={16} />,
      };
      return [
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
        { id: 'view-sep-panels', type: 'separator' as const },
        ...panelSpecs.map((spec) => ({
          id: `panel-${spec.id}`,
          label: panelVisibility[spec.key] === false ? `Show ${spec.label}` : `Hide ${spec.label}`,
          icon: panelIcons[spec.id] ?? <LayoutPanelTop size={16} />,
          onSelect: () => setPanelVisible(spec.key, !(panelVisibility[spec.key] !== false)),
        })),
        {
          id: 'restore-all-panels',
          label: 'Restore all panels',
          icon: <LayoutPanelTop size={16} />,
          onSelect: restoreAllPanels,
        },
      ];
    },
    [panelSpecs, panelVisibility, setPanelVisible, restoreAllPanels],
  );
  const menubarMenus = [
    { id: 'file', label: 'File', items: fileMenuItems },
    { id: 'edit', label: 'Edit', items: editMenuItems },
    { id: 'view', label: 'View', items: viewMenuItems },
  ];
  useAppMenubarContribution(menubarMenus);

  const mainContent = (
    <div className="h-full min-h-0">
      <TwickStudio
        studioConfig={{
          videoProps: {
            width: docData.resolution.width,
            height: docData.resolution.height,
          },
        }}
      />
    </div>
  );

  return (
    <>
    <EditorShell
      editorId="video"
      title="Video"
      subtitle={doc?.title ?? 'Timeline'}
      domain="video"
      theme={editorTheme}
      density={editorDensity}
      className="flex flex-col h-full min-h-0 bg-background"
    >
      <EditorHeader>
        <EditorHeader.Left>
          <h1 className="text-lg font-bold">Video</h1>
        </EditorHeader.Left>
        <EditorHeader.Center>
          <span className="text-sm text-muted-foreground">{doc?.title ?? 'Timeline'}</span>
        </EditorHeader.Center>
      </EditorHeader>

      <EditorToolbar>
        <EditorToolbar.Left>
          <EditorToolbar.Group className="gap-[var(--control-gap)]">
            <EditorToolbar.ProjectSelect
              value={doc ? String(doc.id) : undefined}
              options={projectOptions}
              placeholder="Select timeline"
              disabled={!doc}
              tooltip="Active timeline"
              className="min-w-[180px]"
            />
          </EditorToolbar.Group>
          <span className="text-xs text-muted-foreground">
            {doc ? `${docData.tracks.length} track(s)` : 'Video timeline'}
          </span>
        </EditorToolbar.Left>
        <EditorToolbar.Right>
          {showAgentName !== false && (
            <Badge variant="secondary" className="text-xs">
              Agent: {agentName ?? 'Default'}
            </Badge>
          )}
          <FeatureGate
            capability={CAPABILITIES.VIDEO_EXPORT}
            mode="lock-overlay"
            className="rounded-md"
          >
            <EditorToolbar.Button
              variant="outline"
              size="sm"
              tooltip="Export timeline"
              onClick={() => console.info('[Video] Export not implemented yet.')}
            >
              Export
            </EditorToolbar.Button>
          </FeatureGate>
        </EditorToolbar.Right>
      </EditorToolbar>

      <EditorDockLayout
        ref={layoutRef}
        main={
          <EditorDockPanel panelId="video-main" scrollable={false} hideTitleBar className="h-full">
            {mainContent}
          </EditorDockPanel>
        }
        right={
          showRightPanel === false ? undefined : (
            <EditorDockPanel panelId="video-right" title="Tracks" hideTitleBar className="h-full">
              <TwickTrackList
                tracks={docData.tracks}
                selectedTrackId={selectedTrackId}
                onSelectTrack={(trackId) => {
                  setSelectedTrackId(trackId);
                  setSelectedElementId(null);
                }}
                onAddTrack={() => console.info('[Video] Add track not implemented yet.')}
              />
            </EditorDockPanel>
          )
        }
        bottom={
          showBottomPanel === false ? undefined : (
            <EditorDockPanel panelId="video-bottom" title="Timeline" scrollable={false} hideTitleBar className="h-full">
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
            </EditorDockPanel>
          )
        }
        slots={{ right: { title: 'Tracks' }, bottom: { title: 'Timeline' } }}
        viewport={{ viewportId, viewportType: 'timeline' }}
        layoutId={VIDEO_LAYOUT_ID}
        layoutJson={dockLayouts[VIDEO_LAYOUT_ID] ?? undefined}
        onLayoutChange={(json) => setDockLayout(VIDEO_LAYOUT_ID, json)}
        clearLayout={() => clearDockLayout(VIDEO_LAYOUT_ID)}
      />

      <EditorStatusBar>
        {isDirty ? 'Unsaved changes' : 'Ready'} - Twick editor (timeline state not yet synced)
      </EditorStatusBar>
    </EditorShell>
  </>
  );
}
